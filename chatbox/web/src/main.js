import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './assets/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 启动前先从 localStorage 恢复登录态
const authStore = useAuthStore()
authStore.restore().finally(() => app.mount('#app'))
