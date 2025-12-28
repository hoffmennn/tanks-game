<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showRotateMessage = ref(false)

const checkOrientation = () => {
    // Show message if in portrait mode on mobile
    const isPortrait = window.innerHeight > window.innerWidth
    const isMobile = window.innerWidth < 768
    showRotateMessage.value = isPortrait && isMobile
}

onMounted(() => {
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkOrientation)
    window.removeEventListener('orientationchange', checkOrientation)
})
</script>


<template>
    <div v-if="showRotateMessage" class="rotate-message">
        <div class="rotate-content">
            <div class="rotate-icon">📱 → 📱</div>
            <h2>Please Rotate Your Device</h2>
            <p>This game is best played in landscape mode</p>
        </div>
    </div>
</template>


<style scoped>
.rotate-message {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: white;
}

.rotate-content {
    text-align: center;
    padding: 2rem;
}

.rotate-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: rotate 2s ease-in-out infinite;
}

@keyframes rotate {

    0%,
    100% {
        transform: rotate(0deg);
    }

    50% {
        transform: rotate(90deg);
    }
}

.rotate-content h2 {
    font-size: 1.5rem;
    margin: 1rem 0;
}

.rotate-content p {
    font-size: 1rem;
    opacity: 0.8;
}
</style>
