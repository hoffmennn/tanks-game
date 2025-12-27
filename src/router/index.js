import { createRouter, createWebHashHistory } from 'vue-router'

import Landing from '@/views/Landing.vue'
import Levels from '@/views/Levels.vue'
import HowToPlay from '@/views/HowToPlay.vue'
import Stats from '@/views/Stats.vue'
import Game from '@/game_engine/Game.vue'

const routes = [
    { path: '/', component: Landing },
    { path: '/levels', component: Levels },
    { path: '/how-to-play', component: HowToPlay },
    { path: '/stats', component: Stats },
    { path: '/game/:id', name: 'game', component: Game, props: true },
]

export default createRouter({
    history: createWebHashHistory(),
    routes,
})
