import request from '../utils/request.util'

export const signIn = (data) => {
  return request({
    url: 'auth/login',
    method: 'post',
    data
  })
}

export const register = (data) => {
  return request({
    url: 'auth/register',
    method: 'post',
    data
  })
}

export const getAuthInfo = (params) => {
  return request({
    url: 'auth/info',
    method: 'get',
    params
  })
}
