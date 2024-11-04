class NovaFrame extends HTMLElement {
  constructor() {
    super()
    this.url = []
    this.id = this.getAttribute("id")
  }
  connectedCallback() {
    const childElements = this.querySelectorAll("a")
    childElements.forEach((element) => {
      this.url.push({ url: element.href, element })
      this.aTagFetch()
    })
  }

  async aTagFetch() {
    this.url.forEach((obj) => {
      obj.element.addEventListener("click", async (e) => {
        e.preventDefault()
        try {
          document.dispatchEvent(loadingEvent)
          const response = await fetch(obj.url)
          const result = await response.text()
          // nova-frameのidタグで囲まれているものだけを取得
          const parser = new DOMParser()
          const doc = parser.parseFromString(result, "text/html") //htmlとしてパース
          //　パースとは、文字列を解析して、それをプログラムが理解できるデータ構造に変換すること
          const NovaFrame = doc.querySelector(`nova-frame[id="${this.id}"]`)
          if (NovaFrame) {
            this.innerHTML = NovaFrame.innerHTML
            const usedUrl = this.url.find((url) => url.url === obj.url)
            if (usedUrl) {
              const index = this.url.indexOf(usedUrl) //indexを取得
              if (index > -1) {
                //indexが-1より大きい場合(有効である場合)
                this.url.splice(index, 1) //index番号がindexで配列から1つ削除
              }
            }
            this.connectedCallback() // ここでもっかいevent listenerを設定している
            // 新しい内容に対してもイベントリスナーを再度設定
            // 新しいコンテンツが shadowRoot に設定されると、以前に設定されていたイベントリスナーはすべて削除されます。これは、DOM 要素が置き換えられるためです。
            history.pushState({ frame_id: this.id, url: obj.url }, null, obj.url)
            console.log(history)
            document.dispatchEvent(loadEvent) //独自イベントを発火
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

customElements.define("nova-frame", NovaFrame)

// ここから独自イベントの発火設定

const loadEvent = new Event("nova-frame:load", {
  isLoaded: true,
})

const loadingEvent = new Event("nova-frame:loading", {
  isLoading: true,
})

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

// ここまで独自イベントの発火設定

// formでXSS防ぐようにする
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
      let options = {
        method: method,
      }

      if (method === "GET") {
        const params = new URLSearchParams()
        escapedFormData.forEach((value, key) => {
          params.append(key, value)
        })
        url += `?${params.toString()}`
      } else {
        console.log(escapedFormData.forEach((value, key) => console.log(`${key}: ${value}`)))
        options.body = new URLSearchParams(escapedFormData)
        // console.log(options.body.forEach((value, key) => console.log(`${key}: ${value}`)))
        //formDataをURLSearchParamsに変換してから送るとうまくいく
      }

      try {
        const response = await fetch(url, options)
        const result = await response.text()

        // nova-frameのidタグで囲まれているものだけを取得
        const parser = new DOMParser()
        const doc = parser.parseFromString(result, "text/html") //htmlとしてパース
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
