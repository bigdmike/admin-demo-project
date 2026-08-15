// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
// Components
import App from './App.vue'
import { initDb } from './mocks/db'

// Styles
import 'unfonts.css'

async function prepareApp () {
  // 面試 Demo 可以直接常態開啟，或透過環境變數控制
  initDb()
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest (request, print) {
      const url = new URL(request.url)

      // 1. 只有 pathname 是「/api/...」且「不是 .js / .vue 等靜態檔案」才當成 API
      const isApiRequest = url.pathname.startsWith('/api') && !/\.(?:js|ts|vue|json)$/.test(url.pathname)

      if (isApiRequest) {
        print.warning() // 這才是真正漏掉 handler 的 API
        return
      }

      // 2. 其餘前端原始碼與靜態資源直接靜默放行
      return
    },
  })
}

prepareApp().then(() => {
  const app = createApp(App)

  registerPlugins(app)

  app.mount('#app')
})
