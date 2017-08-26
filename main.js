console.log("a")
function promiseify(fn) {
  return (...args) => new Promise((res, rej) => {
    args = [...args, (...ret) => res(...ret)]
    fn(...args)
  })
}
const getWindows = promiseify(chrome.windows.getAll)
const getTabs = promiseify(chrome.tabs.getAllInWindow)
const updateTab = promiseify(chrome.tabs.update)
const updateWin = promiseify(chrome.windows.update)
const removeTab = promiseify(chrome.tabs.remove)
const reloadTab = promiseify(chrome.tabs.reload)
const getCurrentTab = promiseify(chrome.tabs.getCurrent)
const newTab = promiseify(chrome.tabs.create)
const getBookmarks = promiseify(chrome.bookmarks.getRecent)
const getHistory = promiseify(chrome.history.search)
const notify = promiseify(chrome.notifications.create)
const createWin = promiseify(chrome.windows.create)

function activeTab(tid) {
  return updateTab(tid, {
    active: true
  })
}
function activeWin(wid) {
  return updateWin(wid, {
    focused: true
  })
}

const provider = {
  getHistory() {
    return [{
      title: "A history"
    }]
  },
  async getTabs() {
    let wins = (await getWindows())
    return (await Promise.all(wins.map(win => getTabs(win.id))))
      .reduce((a, b) => (a.push(...b), a), [])
      .map(tab => ({
        active: tab.active,
        title: tab.title,
        url: tab.url,
        winId: tab.windowId,
        id: tab.id
      }))
  },
  async activeTab(winId, tabId) {
    await activeTab(tabId)
    await activeWin(winId)
  },
  async closeTab(tabId) {
    await removeTab(tabId)
  },
  async reloadTab(tabId) {
    await reloadTab(tabId)
  },
  async getCurrent() {
    return (await getCurrentTab()).map(tab => ({
      active: tab.active,
      title: tab.title,
      url: tab.url,
      winId: tab.windowId,
      id: tab.id
    }))
  },
  async newTab(prop) {
    await newTab(prop)
  },
  getBookmarks(count) {
    return getBookmarks(count)
  },
  async getHistory(opt) {
    opt.text = opt.text || ""
    return (await getHistory(opt)).map(h => ({
      title: h.title,
      url: h.url
    }))
  },
  //https://developer.chrome.com/apps/notifications#property-NotificationOptions-iconUrl
  async notify(prop) {
    prop.iconUrl = prop.iconUrl || chrome.extension.getURL("images/default.png")
    await notify(prop)
  },
  async createWin(prop) {
    await createWin(prop)
  }
}
let port = localStorage.getItem("port") || 9991
let delay = +localStorage.getItem("delay") * 1000 || 2000
let cspSocket = new CSSSocket(`ws://127.0.0.1:${port}/buildin.chrome.`, delay, (state) => {
  localStorage.setItem("state", state)
}, provider)

window.addEventListener("storage", (e) => {
  cspSocket.close()
  port = localStorage.getItem("port") || 9991
  delay = +localStorage.getItem("delay") * 1000 || 2000
  cspSocket = new CSSSocket(`ws://127.0.0.1:${port}/buildin.chrome.`, delay, (state) => {
    localStorage.setItem("state", state)
  }, provider)
})


