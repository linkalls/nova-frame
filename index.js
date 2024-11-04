class NovaFrame extends HTMLElement {
  constructor() {
    super()
    this.urls = []
    this.id = this.getAttribute("id")
  }

  connectedCallback() {
    const childElements = this.querySelectorAll("a")
    childElements.forEach((element) => {
      this.urls.push({ url: element.href, element })
      this.aTagFetch()
    })
  }

  async aTagFetch() {
    this.urls.forEach((obj) => {
      obj.element.addEventListener("click", async (e) => {
        e.preventDefault()
        try {
          // 現在の内容を保存
          window.old_content = this.innerHTML
          document.dispatchEvent(loadingEvent)
          const response = await fetch(obj.url)
          const result = await response.text()

          const parser = new DOMParser()
          const doc = parser.parseFromString(result, "text/html")
          const NovaFrame = doc.querySelector(`nova-frame[id="${this.id}"]`)
          if (NovaFrame) {
            this.innerHTML = NovaFrame.innerHTML
            this.url = this.urls.filter((url) => url.url !== obj.url) // 重複を削除
            this.connectedCallback()

            // URLをpushStateで履歴に追加
            history.pushState({ frame_id: this.id }, null, obj.url)

            // popstate イベントの設定
            window.addEventListener("popstate", async () => {
              console.log("戻るボタンが押されました")
              if (window.old_content) {
                // 保存した内容を復元
                const frame = this
                if (frame) {
                  frame.innerHTML = window.old_content
                  frame.connectedCallback() // 必要に応じてイベントリスナーを再設定
                  window.old_content = null
                }
              } else {
                console.log("前のコンテンツが保存されていません")
                const response = await fetch(obj.url)
                const result = await response.text()
                const parser = new DOMParser()
                const doc = parser.parseFromString(result, "text/html")
                const NovaFrame = doc.querySelector(`nova-frame[id="${this.id}"]`)
                this.innerHTML = NovaFrame.innerHTML
              }
            })

            document.dispatchEvent(loadEvent)
          } else {
            console.log(`nova-frame[id="${this.id}"]が見つかりません`)
          }
        } catch (e) {
          console.log(e)
        }
      })
    })
  }
}

// カスタム要素を定義
customElements.define("nova-frame", NovaFrame)

// 独自イベント設定
const loadEvent = new Event("nova-frame:load", { isLoaded: true })
const loadingEvent = new Event("nova-frame:loading", { isLoading: true })

document.addEventListener("nova-frame:loading", () => {
  console.log("nova-frame:loading")
  window.loading = true
  window.loaded = false
})

document.addEventListener("nova-frame:load", () => {
  console.log("nova-frame:load")
  window.loading = false
  window.loaded = true
})

// XSS 防止関数
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (tag) => {
    const charsToReplace = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }
    return charsToReplace[tag] || tag
  })
}

const dataNovaFrameId = document.querySelectorAll("form[data-nova-frame-id]")

if (dataNovaFrameId) {
  dataNovaFrameId.forEach((form) => {
    const NovaFrameId = form.getAttribute("data-nova-frame-id")
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      const escapedFormData = new FormData()

      formData.forEach((value, key) => {
        escapedFormData.append(key, escapeHTML(value))
      })

      const method = form.method.toUpperCase()
      let url = form.action
      let options = { method }

      if (method === "GET") {
        const params = new URLSearchParams()
        escapedFormData.forEach((value, key) => {
          params.append(key, value)
        })
        url += `?${params.toString()}`
      } else {
        options.body = new URLSearchParams(escapedFormData)
      }

      try {
        const response = await fetch(url, options)
        const result = await response.text()

        const parser = new DOMParser()
        const doc = parser.parseFromString(result, "text/html")
        const NovaFrame = doc.querySelector(`nova-frame[id="${NovaFrameId}"]`)
        if (NovaFrame) {
          document.querySelector(`nova-frame[id="${NovaFrameId}"]`).innerHTML = NovaFrame.innerHTML
        } else {
          console.log(`nova-frame[id="${NovaFrameId}"]が見つかりません`)
        }
      } catch (e) {
        console.log(e)
      }
    })
  })
}
