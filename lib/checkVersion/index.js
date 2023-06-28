/**
 *Created by limbo <yykaue@qq.com> on 2022/7/20.
 */

/**
 * 检查version.json
 * @param callback type: Function,回调
 * @param listenerFlag type: Boolean,监听的flag
 * @param delay type: Number,定时器延迟时间
 * @param url type: String,version文件的地址
 * @param path type: String,version文件的位置
 */
const checkVersion = ({
  callback,
  listenerFlag = process.env.NODE_ENV !== 'development',
  delay = 30 * 1000,
  url,
  path
}) => {
  // 增加回调逻辑
  const customCallback = (payload = {}) => {
    const { JSONInfo = {} } = payload
    const silenceKey = JSONInfo.silenceKey || 'silence'
    if (JSONInfo[silenceKey] === 'true') {
      return
    }
    const params = Object.assign({}, payload, times)
    callback && callback(params)
  }
  const times = setInterval(() => {
    if (!listenerFlag) {
      clearInterval(times)
      return
    }
    getVersion({
      path,
      url,
      callback: customCallback
    })
  }, delay)
}

// 请求version.json
const getVersion = (payload = {}) => {
  const { path, url, callback } = payload
  const xhr = new XMLHttpRequest()
  const _path = path === undefined ? `/${location.pathname.split('/')[1]}/` : path
  const _url = url || `//${location.host}${_path}version.json`

  // xhr.responseType = 'text/plain'
  xhr.timeout = 30000
  xhr.open('GET', `${_url}?t=${+new Date()}`, true)
  xhr.send()
  xhr.onload = (res) => xhrDone(res, xhr, callback)
  // xhr.onreadystatechange = (res) => xhrDone(res, xhr)
}

// 比对key值
const xhrDone = (response, xhr, callback) => {
  if (xhr.readyState !== 4) return
  if (xhr.status !== 200) return
  let JSONInfo
  // JSONInfo = {
  //   name: 'pkg-limbo', // pkg的名称
  //   path: '/limbo', // pkg的publicPath
  //   version: '1.0.0', // 版本
  //   versionDomId: 'pkg-v-limbo', // 版本DOM元素的ID
  //   versionKey: 'md5', // 版本标识的key
  //   silenceKey: 'silence', // 静默标识的key
  //   silence: 'true', // 静默
  //   forceRefresh: 'true', // 强制更新标识
  //   hash: 'hash非必须',
  //   md5: 'md5非必须'
  // }
  try {
    JSONInfo = JSON.parse(xhr.response) || {}
  } catch (e) {
    JSONInfo = {}
    console.log('checkVersion', e)
  }
  const dom = document.getElementById(JSONInfo.versionDomId)
  const versionKey = JSONInfo.versionKey || 'md5'
  if (dom && dom.innerText !== JSONInfo[versionKey]) {
    if (JSONInfo.forceRefresh === 'true') {
      location.reload()
      return
    }
    const params = { xhr, response, JSONInfo }
    callback && callback(params)
  }
}

module.exports = checkVersion
