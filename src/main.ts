import Vue, { createApp } from 'vue'
import { createPinia } from 'pinia'
import popAlter from './components/common/popAlter/popAlter'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(popAlter)

app.mount('#app')
