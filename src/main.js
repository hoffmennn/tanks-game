import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

import initLevelStats from '@/services/statsService.js'
import './styles/main.css'

// Register service worker for PWA (required for install prompts)
registerSW({ immediate: true })

initLevelStats()

createApp(App).use(router).mount('#app')
