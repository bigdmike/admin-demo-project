// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
// Components
import App from './App.vue'
import { initDb } from './mocks/database/main'

// Styles
import 'unfonts.css'

async function prepareApp () {
  // 面試 Demo 可以直接常態開啟，或透過環境變數控制
  initDb()
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest (request, print) {
      const url = new URL(request.url)
      const isApiRequest = url.pathname.startsWith('/api/')

      if (isApiRequest) {
        console.error(
          '[MSW] 未命中的 API：',
          request.method,
          url.pathname,
        )

        print.error()
        return
      }

    // 其他靜態資源直接略過
    },
  })
}

prepareApp().then(() => {
  const app = createApp(App)

  registerPlugins(app)

  app.mount('#app')
})
