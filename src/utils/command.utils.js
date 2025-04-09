import { parseUrlString } from './url.utils'

const words = (function () {
  const scan = (string, pattern, callback) => {
    let match, result
    result = ''
    while (string.length > 0) {
      match = string.match(pattern)

      if (match) {
        result += string.slice(0, match.index)
        result += callback(match)
        string = string.slice(match.index + match[0].length)
      } else {
        result += string
        string = ''
      }
    }
    return result
  }

  const split = (line) => {
    let field, words
    if (line == null) {
      line = ''
    }
    words = []
    field = ''
    scan(
      line,
      /\s*(?:([^\s\\\'\"]+)|'((?:[^\'\\]|\\.)*)'|"((?:[^\"\\]|\\.)*)"|(\\.?)|(\S))(\s|$)?/,
      function (match) {
        let dq, escape, garbage, raw, seperator, sq, word
        ;(raw = match[0]),
          (word = match[1]),
          (sq = match[2]),
          (dq = match[3]),
          (escape = match[4]),
          (garbage = match[5]),
          (seperator = match[6])
        if (garbage != null) {
          throw new Error('Unmatched quote')
        }
        field += word || (sq || dq || escape).replace(/\\(?=.)/, '')
        if (seperator != null) {
          words.push(field)
          return (field = '')
        }
      }
    )
    if (field) {
      words.push(field)
    }
    return words
  }

  const escape = (str) => {
    if (str == null) {
      str = ''
    }
    if (str == null) {
      return "''"
    }
    return str
      .replace(/([^A-Za-z0-9_\-.,:\/@\n])/g, '\\$1')
      .replace(/\n/g, "'\n'")
  }
  return {
    scan,
    escape,
    split,
  }
})()

function rewrite(args) {
  return args.reduce(function (args, a) {
    if (0 == a.indexOf('-X')) {
      args.push('-X')
      args.push(a.slice(2))
    } else {
      args.push(a)
    }

    return args
  }, [])
}

function parseField(s) {
  return s.split(/: (.+)/)
}

function isURL(s) {
  return /^https?:\/\//.test(s)
}

export function parseCurl(s) {
  if (!s.trimStart().startsWith('curl ')) return
  const args = rewrite(words.split(s))

  const out = { method: 'GET', header: {} }
  let state = ''

  args.forEach(function (arg) {
    switch (true) {
      case isURL(arg):
        out.url = arg
        break

      case arg == '-A' || arg == '--user-agent':
        state = 'user-agent'
        break

      case arg == '-H' || arg == '--header':
        state = 'header'
        break

      case arg == '-d' ||
        arg == '--data' ||
        arg == '--data-ascii' ||
        arg === '--data-raw':
        state = 'data'
        break

      case arg == '-u' || arg == '--user':
        state = 'user'
        break

      case arg == '-I' || arg == '--head':
        out.method = 'HEAD'
        break

      case arg == '-X' || arg == '--request':
        state = 'method'
        break

      case arg == '-b' || arg == '--cookie':
        state = 'cookie'
        break

      case arg == '--compressed':
        out.header['Accept-Encoding'] =
          out.header['Accept-Encoding'] || 'deflate, gzip'
        break

      case !!arg:
        switch (state) {
          case 'header':
            var field = parseField(arg)
            out.header[field[0]] = field[1]
            state = ''
            break
          case 'user-agent':
            out.header['User-Agent'] = arg
            state = ''
            break
          case 'data':
            if (out.method == 'GET' || out.method == 'HEAD') out.method = 'POST'
            out.header['Content-Type'] =
              out.header['Content-Type'] || 'application/x-www-form-urlencoded'
            out.body = out.body ? out.body + '&' + arg : arg
            state = ''
            break
          case 'user':
            out.header['Authorization'] = 'Basic ' + btoa(arg)
            state = ''
            break
          case 'method':
            out.method = arg
            state = ''
            break
          case 'cookie':
            out.header['Set-Cookie'] = arg
            state = ''
            break
        }
        break
    }
  })

  const { url, params } = parseUrlString(out.url)
  out.url = url
  out.query = params
  return out
}
