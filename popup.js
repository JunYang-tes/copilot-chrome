window.addEventListener("load", () => {
  const port = document.getElementById("port")
  const delay = document.getElementById("delay")
  const save = document.getElementById("save")
  const stateEle = document.getElementById("state")
  const getValue = () => {
    port.value = localStorage.getItem("port") || "9991"
    delay.value = localStorage.getItem("delay") || "2"
    stateEle.innerText = localStorage.getItem("state") || ""
  }
  save.addEventListener("click", () => {
    localStorage.setItem("port", port.value)
    localStorage.setItem("delay", delay.value)
  })
  window.addEventListener("storage", () => {
    let state = localStorage.getItem("state")
    console.log("storage", state)
    stateEle.innerText = state
  })
  getValue()
})