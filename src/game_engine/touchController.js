/**
 * Touch controller that adds on-screen buttons and touch-drag for aiming/shooting
 * Works alongside existing keyboard/mouse controls without modifying game code
 */

export function initTouchControls(canvas, keysPressed) {
    let activeTouch = null

    // Create on-screen control buttons
    const controlsContainer = document.createElement('div')
    controlsContainer.id = 'touch-controls'
    controlsContainer.innerHTML = `
        <button id="btn-left" class="touch-btn">◀</button>
        <button id="btn-right" class="touch-btn">▶</button>
    `
    document.body.appendChild(controlsContainer)

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
        #touch-controls {
            position: fixed;
            bottom: 20px;
            left: 20px;
            display: flex;
            gap: 15px;
            z-index: 1000;
            pointer-events: none;
        }
        
        .touch-btn {
            pointer-events: auto;
            width: 70px;
            height: 70px;
            border: 2px solid rgba(255, 255, 255, 0.6);
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(5px);
            color: white;
            font-size: 28px;
            border-radius: 15px;
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
            transition: all 0.1s ease;
        }
        
        .touch-btn:active {
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0.95);
        }
    `
    document.head.appendChild(style)

    const btnLeft = document.getElementById('btn-left')
    const btnRight = document.getElementById('btn-right')

    // Button event handlers
    function handleLeftPress() {
        keysPressed['ArrowLeft'] = true
    }

    function handleLeftRelease() {
        keysPressed['ArrowLeft'] = false
    }

    function handleRightPress() {
        keysPressed['ArrowRight'] = true
    }

    function handleRightRelease() {
        keysPressed['ArrowRight'] = false
    }

    // Add button listeners
    btnLeft.addEventListener('touchstart', (e) => {
        e.preventDefault()
        handleLeftPress()
    })
    btnLeft.addEventListener('touchend', (e) => {
        e.preventDefault()
        handleLeftRelease()
    })
    btnLeft.addEventListener('touchcancel', (e) => {
        e.preventDefault()
        handleLeftRelease()
    })
    btnLeft.addEventListener('mousedown', handleLeftPress)
    btnLeft.addEventListener('mouseup', handleLeftRelease)
    btnLeft.addEventListener('mouseleave', handleLeftRelease)

    btnRight.addEventListener('touchstart', (e) => {
        e.preventDefault()
        handleRightPress()
    })
    btnRight.addEventListener('touchend', (e) => {
        e.preventDefault()
        handleRightRelease()
    })
    btnRight.addEventListener('touchcancel', (e) => {
        e.preventDefault()
        handleRightRelease()
    })
    btnRight.addEventListener('mousedown', handleRightPress)
    btnRight.addEventListener('mouseup', handleRightRelease)
    btnRight.addEventListener('mouseleave', handleRightRelease)

    // Canvas touch handlers for aiming and shooting
    function handleCanvasTouchStart(e) {
        e.preventDefault()

        const touch = e.changedTouches[0]
        activeTouch = touch.identifier

        // Create and dispatch mousedown event
        const rect = canvas.getBoundingClientRect()
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
            cancelable: true,
            view: window,
        })
        canvas.dispatchEvent(mouseEvent)
    }

    function handleCanvasTouchMove(e) {
        e.preventDefault()

        if (activeTouch === null) return

        // Find the active touch
        let currentTouch = null
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === activeTouch) {
                currentTouch = e.touches[i]
                break
            }
        }

        if (!currentTouch) return

        // Create and dispatch mousemove event
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: currentTouch.clientX,
            clientY: currentTouch.clientY,
            bubbles: true,
            cancelable: true,
            view: window,
        })
        canvas.dispatchEvent(mouseEvent)
    }

    function handleCanvasTouchEnd(e) {
        e.preventDefault()

        // Check if our active touch ended
        let touchEnded = false
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === activeTouch) {
                touchEnded = true
                break
            }
        }

        if (!touchEnded) return

        // Create and dispatch mouseup event
        if (e.changedTouches[0]) {
            const mouseEvent = new MouseEvent('mouseup', {
                clientX: e.changedTouches[0].clientX,
                clientY: e.changedTouches[0].clientY,
                bubbles: true,
                cancelable: true,
                view: window,
            })
            canvas.dispatchEvent(mouseEvent)
        }

        activeTouch = null
    }

    // Add canvas touch listeners
    canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleCanvasTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', handleCanvasTouchEnd, { passive: false })

    // Return cleanup function
    return function cleanup() {
        // Remove canvas listeners
        canvas.removeEventListener('touchstart', handleCanvasTouchStart)
        canvas.removeEventListener('touchmove', handleCanvasTouchMove)
        canvas.removeEventListener('touchend', handleCanvasTouchEnd)
        canvas.removeEventListener('touchcancel', handleCanvasTouchEnd)

        // Remove button controls
        if (controlsContainer && controlsContainer.parentNode) {
            controlsContainer.parentNode.removeChild(controlsContainer)
        }
        if (style && style.parentNode) {
            style.parentNode.removeChild(style)
        }
    }
}
