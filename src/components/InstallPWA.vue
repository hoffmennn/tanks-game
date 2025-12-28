<script setup>
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
const deferredPrompt = ref(null)

onMounted(() => {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default prompt
        e.preventDefault()
        // Store the event for later use
        deferredPrompt.value = e
        // Show our custom install prompt
        showInstallPrompt.value = true
    })

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        showInstallPrompt.value = false
    }
})

const installPWA = async () => {
    if (!deferredPrompt.value) {
        return
    }

    // Show the install prompt
    deferredPrompt.value.prompt()

    // Wait for the user's response
    const { outcome } = await deferredPrompt.value.userChoice

    console.log(`User response to install prompt: ${outcome}`)

    // Clear the deferredPrompt
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
            <div class="install-buttons">
                <button @click="installPWA" class="install-btn">Install</button>
                <button @click="dismissPrompt" class="dismiss-btn">Later</button>
            </div>
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
