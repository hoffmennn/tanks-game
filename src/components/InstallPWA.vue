<script setup>
import { ref, onMounted, computed } from 'vue'

const showInstallPrompt = ref(false)
const deferredPrompt = ref(null)
const isIOS = ref(false)
const isStandalone = ref(false)

const shouldShowIOSHint = computed(() => isIOS.value && !isStandalone.value)

onMounted(() => {
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    isIOS.value = /iphone|ipad|ipod/i.test(window.navigator.userAgent)

    if (isStandalone.value) {
        showInstallPrompt.value = false
        return
    }

    // Listen for the beforeinstallprompt event (Android/Chromium only)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt.value = e
        showInstallPrompt.value = true
    })

    // If on iOS (no beforeinstallprompt), show manual hint
    if (isIOS.value) {
        showInstallPrompt.value = true
    }
})

const installPWA = async () => {
    if (!deferredPrompt.value) {
        // iOS users must use Add to Home Screen manually
        return
    }

    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    console.log(`User response to install prompt: ${outcome}`)
    deferredPrompt.value = null
    showInstallPrompt.value = false
}

const dismissPrompt = () => {
    showInstallPrompt.value = false
    // Show again in 24 hours
    setTimeout(() => {
        if (deferredPrompt.value) {
            showInstallPrompt.value = true
        }
    }, 24 * 60 * 60 * 1000)
}
</script>


<template>
    <div v-if="showInstallPrompt" class="install-banner">
        <div class="install-content">
            <p>📱 Install TanksGame for the best experience!</p>
            <p class="install-subtitle">Play fullscreen without the address bar</p>

            <template v-if="shouldShowIOSHint">
                <p class="install-subtitle">On iPhone/iPad: tap Share → Add to Home Screen</p>
                <p class="install-subtitle">(iOS does not show automatic install prompts)</p>
                <div class="install-buttons">
                    <button @click="dismissPrompt" class="dismiss-btn">Got it</button>
                </div>
            </template>

            <template v-else>
                <div class="install-buttons">
                    <button @click="installPWA" class="install-btn">Install</button>
                    <button @click="dismissPrompt" class="dismiss-btn">Later</button>
                </div>
            </template>
        </div>
    </div>
</template>


<style scoped>
.install-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
    box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

.install-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.install-content p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
    font-weight: bold;
}

.install-subtitle {
    font-size: 0.9rem !important;
    opacity: 0.9;
    font-weight: normal !important;
}

.install-buttons {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.install-btn,
.dismiss-btn {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.install-btn {
    background: white;
    color: #667eea;
}

.install-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.dismiss-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
}

.dismiss-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>
