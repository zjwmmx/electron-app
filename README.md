# mmx-app
### 安装

```bash
$ npm install
```

### 运行

```bash
$ npm run dev
```

### 打包

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### 本地更新

```bash
# 先打包
$ npm run build
```

找到`dist`目录下的`app-update.yml`文件 拷贝到根目录
修改且降低`package.json`下的版本号