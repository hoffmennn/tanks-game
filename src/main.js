import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"

import initLevelStats from '@/services/statsService.js'
import './styles/main.css'

initLevelStats()

createApp(App)
  .use(router)
  .mount("#app")
