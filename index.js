class NovaFrame extends HTMLElement {
  constructor() {
    super()
    this.url = []
    this.id = this.getAttribute("id")
  }
  connectedCallback() {
    // domが読み込まれたときに呼ばれる
    if (this.childNodes) {
      // 要素Nodeかどうかを判定
      const childElements = Array.from(this.childNodes).filter((node) => node.nodeType === Node.ELEMENT_NODE)
      // console.log(childElements)
      childElements.forEach((element) => {
        if (element.tagName.toLowerCase() === "a") {
          console.log(element)
          this.url.push({ url: element.href, element })
          console.log(this.url)
          this.aTagFetch()
        }
      })
    }
  }

  async aTagFetch() {
    this.url.forEach((obj) => {
      console.log(obj)
      obj.element.addEventListener("click", async (e) => {
        e.preventDefault()
        console.log(obj.url)
        try {
          const response = await fetch(obj.url)
          const result = await response.text()
          // console.log(result)
          // console.log(this.id)

          // nova-frameのidタグで囲まれているものだけを取得
          const parser = new DOMParser()
          const doc = parser.parseFromString(result, "text/html") //htmlとしてパース
          //　パースとは、文字列を解析して、それをプログラムが理解できるデータ構造に変換すること
          const NovaFrame = doc.querySelector(`nova-frame[id="${this.id}"]`)
          // console.log(NovaFrame)
          if (NovaFrame) {
            this.innerHTML = NovaFrame.innerHTML
          }
        } catch (e) {
          console.log(e)
        }
      })
    })
  }
}

customElements.define("nova-frame", NovaFrame)
