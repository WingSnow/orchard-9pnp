import { createApp, type App } from 'vue'
import PopAlter from './PopAlter.vue'

interface Options {
  content: string
  duration: number
  type: 'info' | 'warning' | 'error' | 'success'
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $popAlter: (opts: Options) => HTMLElement
  }
}

let parentNode: HTMLElement | null
const createMount = (opts: Options) => {
  if (!parentNode) {
    let node = document.getElementById('o-message-container')
    if (node) {
      parentNode = node
    } else {
      node = document.createElement('div')
      node.id = 'o-message-container'
      document.body.appendChild(node)
      parentNode = node
    }
  }
  const mountNode = document.createElement('div')
  parentNode.appendChild(mountNode)
  const app = createApp(PopAlter, {
    ...opts,
    remove() {
      app.unmount()
      parentNode?.removeChild(mountNode)
    },
  })
  app.mount(mountNode)
  return mountNode
}

export const message = (opts: Options) => {
  return createMount(opts)
}

export default {
  install: (app: App) => {
    app.component('pop-alter', PopAlter)
  },
}
