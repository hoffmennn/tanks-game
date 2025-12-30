import baseConfig from './configs/gameConstans.json'
import { initTouchControls } from './touchController.js'

export function initGame(level = {}, callbacks = {}) {

    const { onGameEnd } = callbacks
    const config = { ...baseConfig, ...level }

    const canvas = document.getElementById('gameCanvas')
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let SCALE_FACTOR = canvas.width / 1263 // when you log canvas.width at my 1920px 13 inch yoga c640 screeen, it shows 1263. im not sure of this number

    let GROUND_Y = canvas.height * config.GROUND_Y_FACTOR
    canvas.style.background = config.BACKGROUND_COLOR || '#5f9ab1'
    const TERRAIN_COLOR = config.TERRAIN_COLOR
    const TERRAIN_DIVERSITY = config.TERRAIN_DIVERSITY
    let GRAVITY = config.GRAVITY * SCALE_FACTOR
    let TANK_WIDTH = config.TANK_WIDTH * SCALE_FACTOR
    let TANK_HEIGHT = config.TANK_HEIGHT * SCALE_FACTOR
    let TERRAIN_STEP = 5 * SCALE_FACTOR
    let TANK_SPEED = config.TANK_SPEED * SCALE_FACTOR
    const POWER_SCALE = config.POWER_SCALE
    const DIFFICULTY = config.DIFFICULTY // 0.5 - easy, 1 - medium, 2 - hard
    let MAX_FUEL = config.MAX_FUEL * SCALE_FACTOR // Pixels of movement per turn
    const WIND_SPEED_RANDOM = config.WIND_SPEED_RANDOM
    let BASE_WIND = 0
    let WIND_SPEED = 0 // gets managed in generateWind() function

    let terrain = []
    let terrainPhase1 = Math.random() * 100 // TODO: check if needs scaling
    let terrainPhase2 = Math.random() * 100
    let terrainSurfacePath = null
    let terrainFillPath = null
    let animationId = null
    let running = false
    let isPlayerTurn = true
    let canShoot = true
    let keysPressed = {}

    function generateTerrain() {
        terrain = []

        // scale amplitudes based on diversity
        const largeHillAmplitude = TERRAIN_DIVERSITY * 12 * SCALE_FACTOR
        const smallBumpAmplitude = TERRAIN_DIVERSITY * 4 * SCALE_FACTOR

        for (let x = 0; x <= canvas.width; x += TERRAIN_STEP) {
            let y = GROUND_Y

            if (TERRAIN_DIVERSITY > 0) {
                y += Math.sin((x * 0.006) / SCALE_FACTOR + terrainPhase1) * largeHillAmplitude //TODO: urobit frekvenciu zavislu od sirky obrazovky a dat do premennej
                y += Math.sin((x * 0.02) / SCALE_FACTOR + terrainPhase2) * smallBumpAmplitude // TODO: to iste
            }

            y = Math.max(100 * SCALE_FACTOR, Math.min(canvas.height - 40 * SCALE_FACTOR, y))
            terrain.push({ x, y })
        }

        if (terrain.length > 0) {
            const surfacePath = new Path2D()
            surfacePath.moveTo(0, terrain[0].y)
            for (let point of terrain) {
                surfacePath.lineTo(point.x, point.y)
            }

            const fillPath = new Path2D(surfacePath)
            fillPath.lineTo(canvas.width, canvas.height)
            fillPath.lineTo(0, canvas.height)
            fillPath.closePath()

            terrainSurfacePath = surfacePath
            terrainFillPath = fillPath
        }
    }

    function getTerrainY(x) {
        const step = TERRAIN_STEP
        const index = Math.floor(x / step)

        if (index < 0 || index >= terrain.length - 1) return GROUND_Y

        const t = (x - terrain[index].x) / step
        return terrain[index].y + t * (terrain[index + 1].y - terrain[index].y)
    }

    function generateWind() {
        BASE_WIND = WIND_SPEED_RANDOM ? (Math.random() - 0.5) * 0.5 : config.WIND_SPEED_FIXED

        WIND_SPEED = BASE_WIND * SCALE_FACTOR

        document.getElementById('windValue').textContent = Math.abs(BASE_WIND * 100).toFixed(0)

        const arrow = document.getElementById('windArrow')
        if (WIND_SPEED > 0) {
            arrow.textContent = '→'
            arrow.style.color = '#ff6b6b'
        } else if (WIND_SPEED < 0) {
            arrow.textContent = '←'
            arrow.style.color = '#4ecdc4'
        } else if (Math.floor(WIND_SPEED) === 0) {
            arrow.textContent = ''
            arrow.style.color = '#95e1d3'
        }
    }

    // Initial generation is now handled by the first call to restartGame() or manual call
    // generateTerrain();
    // generateWind();

    let playerTank = {
        x: 100 * SCALE_FACTOR,
        y: getTerrainY(100 * SCALE_FACTOR + TANK_WIDTH / 2) - TANK_HEIGHT,
        width: TANK_WIDTH,
        height: TANK_HEIGHT,
        hp: 100,
        color: config.PLAYER_TANK_COLOR,
        texture: null,
        fuel: MAX_FUEL,
    }

    let enemyTank = {
        x: canvas.width - 150 * SCALE_FACTOR,
        y: getTerrainY(canvas.width - 150 * SCALE_FACTOR + TANK_WIDTH / 2) - TANK_HEIGHT,
        width: TANK_WIDTH,
        height: TANK_HEIGHT,
        hp: 100,
        color: config.ENEMY_TANK_COLOR,
        texture: null,
        fuel: MAX_FUEL,
        isMoving: false,
        targetX: 0,
    }

    let projectiles = []
    let dragStart = null
    let dragCurrent = null
    let trajectoryPoints = []
    let gameActive = true

    function drawTerrain() {
        if (!terrainSurfacePath || !terrainFillPath) return

        ctx.fillStyle = TERRAIN_COLOR
        ctx.fill(terrainFillPath)

        ctx.strokeStyle = '#4a3319'
        ctx.lineWidth = 3 * SCALE_FACTOR
        ctx.stroke(terrainSurfacePath)
    }

    function drawTank(tank) {
        // vypocet uhla podla terenu
        // Clamp sampling near edges to avoid extreme slopes causing twists
        const sampleLeftX = Math.max(0, Math.min(tank.x, canvas.width - 5 * SCALE_FACTOR))
        const sampleRightX = Math.max(
            5 * SCALE_FACTOR,
            Math.min(tank.x + tank.width, canvas.width - 5 * SCALE_FACTOR),
        )
        const groundLeft = getTerrainY(sampleLeftX)
        const groundRight = getTerrainY(sampleRightX)
        const angle = Math.atan2(groundRight - groundLeft, tank.width)

        ctx.save()

        // rotovat tank okolo stredu podla terenu
        ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2)
        ctx.rotate(angle)
        ctx.translate(-tank.width / 2, -tank.height / 2)

        if (tank.texture) {
            ctx.drawImage(tank.texture, 0, 0, tank.width, tank.height)
            ctx.restore()
            return
        }

        const isEnemy = tank === enemyTank

        // pasy
        ctx.fillStyle = '#2c2c2c'
        ctx.beginPath()
        if (ctx.roundRect) {
            ctx.roundRect(
                0,
                tank.height - 10 * SCALE_FACTOR,
                tank.width,
                10 * SCALE_FACTOR,
                5 * SCALE_FACTOR,
            )
        } else {
            ctx.fillRect(0, tank.height - 10 * SCALE_FACTOR, tank.width, 10 * SCALE_FACTOR)
        }
        ctx.fill()

        // kolesa na pasoch
        ctx.fillStyle = '#555'
        ctx.beginPath()
        for (let i = 6 * SCALE_FACTOR; i < tank.width; i += 12 * SCALE_FACTOR) {
            ctx.moveTo(i + 3 * SCALE_FACTOR, tank.height - 5 * SCALE_FACTOR)
            ctx.arc(i, tank.height - 5 * SCALE_FACTOR, 3 * SCALE_FACTOR, 0, Math.PI * 2)
        }
        ctx.fill()

        // telo tanku
        ctx.fillStyle = tank.color
        ctx.beginPath()
        ctx.moveTo(5 * SCALE_FACTOR, tank.height - 10 * SCALE_FACTOR)
        ctx.lineTo(tank.width - 5 * SCALE_FACTOR, tank.height - 10 * SCALE_FACTOR)
        ctx.lineTo(tank.width - 10 * SCALE_FACTOR, tank.height - 22 * SCALE_FACTOR)
        ctx.lineTo(10 * SCALE_FACTOR, tank.height - 22 * SCALE_FACTOR)
        ctx.closePath()
        ctx.fill()

        // vezicka tanku
        ctx.beginPath()
        ctx.arc(tank.width / 2, tank.height - 22 * SCALE_FACTOR, 9 * SCALE_FACTOR, Math.PI, 0)
        ctx.fill()

        // hlaven - delo
        ctx.strokeStyle = '#1a1a1a'
        ctx.lineWidth = 4 * SCALE_FACTOR
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tank.width / 2, tank.height - 25 * SCALE_FACTOR)
        const barrelAngle = isEnemy ? -Math.PI * 0.8 : -Math.PI * 0.2
        ctx.lineTo(
            tank.width / 2 + Math.cos(barrelAngle) * 22 * SCALE_FACTOR,
            tank.height - 25 * SCALE_FACTOR + Math.sin(barrelAngle) * 22 * SCALE_FACTOR,
        )
        ctx.stroke()

        ctx.restore()
    }

    function drawProjectile(proj) {
        ctx.fillStyle = config.PROJECTILE_COLOR
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, 5 * SCALE_FACTOR, 0, Math.PI * 2)
        ctx.fill()
    }

    function drawTrajectory() {
        if (dragStart && dragCurrent) {
            ctx.strokeStyle = config.TRAJECTORY_COLOR
            ctx.setLineDash([5 * SCALE_FACTOR, 5 * SCALE_FACTOR])
            ctx.lineWidth = 2 * SCALE_FACTOR

            ctx.beginPath()
            ctx.moveTo(dragStart.x, dragStart.y)

            for (let point of trajectoryPoints) {
                ctx.lineTo(point.x, point.y)
            }

            ctx.stroke()
            ctx.setLineDash([])
        }
    }

    function calculateTrajectory(startX, startY, velX, velY) {
        let points = []
        let x = startX
        let y = startY
        let vx = velX
        let vy = velY

        let maxPoints = 30

        for (let i = 0; i < maxPoints; i++) {
            x += vx
            y += vy
            vy += GRAVITY

            points.push({ x, y })

            if (y > canvas.height || x < 0 || x > canvas.width) break
        }

        return points
    }

    function shoot(tank, targetX, targetY) {
        if (!canShoot) return

        const startX = tank.x + tank.width / 2
        const startY = tank.y

        const velocityX = (targetX - startX) * POWER_SCALE
        const velocityY = (targetY - startY) * POWER_SCALE

        projectiles.push({
            x: startX,
            y: startY,
            vx: velocityX,
            vy: velocityY,
            isPlayer: tank === playerTank,
        })

        canShoot = false
    }

    function startEnemyTurn() {
        enemyTank.fuel = MAX_FUEL

        // Calculate random movement within fuel limits
        // Move randomly left or right, but stay within screen bounds
        // If the enemy is stuck near the right edge, avoid choosing rightward movement
        const nearRightEdge = enemyTank.x >= canvas.width - TANK_WIDTH
        let moveDir = Math.random() < 0.5 ? -1 : 1
        if (nearRightEdge) moveDir = -1
        const moveDist = Math.random() * MAX_FUEL

        let targetX = enemyTank.x + moveDir * moveDist
        targetX = Math.max(0, Math.min(canvas.width - TANK_WIDTH, targetX))

        enemyTank.targetX = targetX
        enemyTank.isMoving = true
    }

    /* aktualne pouzivame jednoduchy AI algoritmus ktory presne odhadne idealnu
        strelu, ale pridavame nahodny element aby netriafala presne. */
    /*v buducnosti mozme zapracovat metodu pamatania si predoslej strely, podla ktorej
        upravuje svoju dalsiu, aby mal vyznam hracov pohyb po mape */
    /* alebo mozme skalovat error_margin podla vzdialenosti medzi hracom a AI*/
    function enemyShoot() {
        if (!gameActive || !canShoot) return

        setTimeout(() => {
            const startX = enemyTank.x + enemyTank.width / 2
            const startY = enemyTank.y

            // player position
            const targetX = playerTank.x + playerTank.width / 2
            const targetY = playerTank.y

            const dx = targetX - startX
            const dy = targetY - startY

            // Estimate Flight Time
            // We assume the bullet travels roughly X pixels per frame horizontally.
            // A lower divider means a higher, loftier arc (slower shot).
            // A higher divider means a direct, fast shot (laser).
            // Let's vary it slightly so the AI chooses different arcs.
            const speedFactor = (12 + Math.random() * 10) * SCALE_FACTOR
            let flightTime = Math.abs(dx) / speedFactor

            // added for moon map
            if (config.GRAVITY < 0.2) {
                flightTime *= 2.5
            } else if (config.GRAVITY > 0.6) {
                flightTime *= 0.8
            }

            // Inverse Physics Formulas
            // X = x0 + vx*t + 0.5*wind*t^2  => Solve for vx
            // Y = y0 + vy*t + 0.5*gravity*t^2 => Solve for vy

            // Correction: The game loop adds gravity/wind step-by-step (Discrete Math), not continuously.
            // We adjust the formula to account for the "off-by-one" errors in the loop.
            /* For Gravity (Y): Since gravity is applied after movement, 
                we subtract t from t^2. 
                For Wind (X): Since wind is applied before movement, we add t to t^2. */
            let bestVx =
                (dx - 0.5 * WIND_SPEED * (Math.pow(flightTime, 2) + flightTime)) / flightTime
            let bestVy = (dy - 0.5 * GRAVITY * (Math.pow(flightTime, 2) - flightTime)) / flightTime

            const errorMargin = 1.65 * SCALE_FACTOR
            bestVx += ((Math.random() - 0.5) * errorMargin) / DIFFICULTY
            bestVy += ((Math.random() - 0.5) * errorMargin) / DIFFICULTY

            projectiles.push({
                x: startX,
                y: startY,
                vx: bestVx,
                vy: bestVy,
                isPlayer: false,
            })

            canShoot = false
        }, 1000) // Wait 1 second after moving before shooting
    }

    function updateProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i]

            proj.vx += WIND_SPEED

            proj.x += proj.vx
            proj.y += proj.vy
            proj.vy += GRAVITY

            const terrainY = getTerrainY(proj.x)
            if (proj.y > terrainY || proj.x < 0 || proj.x > canvas.width) {
                projectiles.splice(i, 1)

                canShoot = true
                isPlayerTurn = !isPlayerTurn
                updateTurnIndicator()

                if (!isPlayerTurn && gameActive) {
                    startEnemyTurn()
                } else {
                    playerTank.fuel = MAX_FUEL
                    updateUI()
                }
                continue
            }

            const targetTank = proj.isPlayer ? enemyTank : playerTank

            if (
                proj.x > targetTank.x &&
                proj.x < targetTank.x + targetTank.width &&
                proj.y > targetTank.y &&
                proj.y < targetTank.y + targetTank.height
            ) {
                targetTank.color = '#ffffff'
                setTimeout(() => {
                    targetTank.color =
                        targetTank === playerTank
                            ? config.PLAYER_TANK_COLOR
                            : config.ENEMY_TANK_COLOR
                }, 100)
                targetTank.hp -= 20
                projectiles.splice(i, 1)

                updateUI()

                canShoot = true
                isPlayerTurn = !isPlayerTurn
                updateTurnIndicator()

                if (targetTank.hp <= 0) {
                    endGame(proj.isPlayer)
                } else if (!isPlayerTurn && gameActive) {
                    startEnemyTurn()
                } else {
                    playerTank.fuel = MAX_FUEL
                    updateUI()
                }
            }
        }
    }

    function updateTurnIndicator() {
        const indicator = document.getElementById('currentTurn')
        if (isPlayerTurn) {
            indicator.textContent = 'Na rade: HRÁČ'
            indicator.style.color = '#00ff00'
        } else {
            indicator.textContent = 'Na rade: PC'
            indicator.style.color = '#ff001e'
        }
    }

    function updateUI() {
        document.getElementById('playerHP').textContent = Math.max(0, playerTank.hp)
        document.getElementById('enemyHP').textContent = Math.max(0, enemyTank.hp)
        document.getElementById('playerHPBar').style.width = Math.max(0, playerTank.hp) + '%'
        document.getElementById('enemyHPBar').style.width = Math.max(0, enemyTank.hp) + '%'

        if (playerTank.hp < 50) {
            document.getElementById('playerHPBar').style.background = '#ffaa00'
        }
        if (playerTank.hp < 25) {
            document.getElementById('playerHPBar').style.background = '#ff0000'
        }

        if (enemyTank.hp < 50) {
            document.getElementById('enemyHPBar').style.background = '#ffaa00'
        }
        if (enemyTank.hp < 25) {
            document.getElementById('enemyHPBar').style.background = '#ff0000'
        }

        // Update Fuel UI
        const fuelPct = Math.max(0, (playerTank.fuel / MAX_FUEL) * 100)
        document.getElementById('playerFuelBar').style.width = fuelPct + '%'
        document.getElementById('playerFuel').textContent = Math.floor(fuelPct)
    }
    /*
    function endGame(playerWon) {
        gameActive = false
        document.getElementById('gameOverText').textContent = playerWon ? 'VÍŤAZSTVO!' : 'PREHRA!'
        document.getElementById('gameOverText').style.color = playerWon ? '#00ff00' : '#ff0000'
        document.getElementById('gameOver').style.display = 'block'
    }
    */

    function endGame(playerWon) {
        gameActive = false

        if (typeof onGameEnd === 'function') {
            onGameEnd(playerWon)
        }
    }

    function restartGame() {
        terrainPhase1 = Math.random() * 100 // TODO: check if needs scaling
        terrainPhase2 = Math.random() * 100
        generateTerrain()

        generateWind()

        playerTank.fuel = MAX_FUEL
        enemyTank.fuel = MAX_FUEL
        playerTank.hp = 100
        enemyTank.hp = 100
        playerTank.x = 100 * SCALE_FACTOR
        playerTank.y = getTerrainY(100 * SCALE_FACTOR + TANK_WIDTH / 2) - TANK_HEIGHT
        enemyTank.x = canvas.width - 150 * SCALE_FACTOR
        enemyTank.y = getTerrainY(canvas.width - 150 * SCALE_FACTOR + TANK_WIDTH / 2) - TANK_HEIGHT
        projectiles = []
        gameActive = true
        isPlayerTurn = true
        canShoot = true

        //document.getElementById('gameOver').style.display = 'none'
        document.getElementById('playerHPBar').style.background = '#00ff00'
        document.getElementById('enemyHPBar').style.background = '#00ff00'
        updateUI()
        updateTurnIndicator()
    }

    function updateTankPosition() {
        // Player Movement
        if (keysPressed['ArrowLeft'] && isPlayerTurn && canShoot) {
            if (playerTank.fuel > 0) {
                playerTank.x = Math.max(0, playerTank.x - TANK_SPEED)
                playerTank.y = getTerrainY(playerTank.x + playerTank.width / 2) - TANK_HEIGHT
                playerTank.fuel -= TANK_SPEED
                updateUI()
            }
        }
        if (keysPressed['ArrowRight'] && isPlayerTurn && canShoot) {
            if (playerTank.fuel > 0) {
                playerTank.x = Math.min(canvas.width - playerTank.width, playerTank.x + TANK_SPEED)
                playerTank.y = getTerrainY(playerTank.x + playerTank.width / 2) - TANK_HEIGHT
                playerTank.fuel -= TANK_SPEED
                updateUI()
            }
        }

        // Enemy AI Movement
        if (!isPlayerTurn && enemyTank.isMoving) {
            const dx = enemyTank.targetX - enemyTank.x
            if (Math.abs(dx) <= TANK_SPEED) {
                enemyTank.x = enemyTank.targetX
                enemyTank.isMoving = false
                enemyShoot() // Movement finished, now aim and shoot
            } else {
                enemyTank.x += Math.sign(dx) * TANK_SPEED
                enemyTank.y = getTerrainY(enemyTank.x + enemyTank.width / 2) - TANK_HEIGHT
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        drawTerrain()
        drawTank(playerTank)
        drawTank(enemyTank)

        for (let proj of projectiles) {
            drawProjectile(proj)
        }

        drawTrajectory()
    }

    function gameLoop() {
        if (gameActive) {
            updateProjectiles()
            updateTankPosition()
        }

        draw()
        animationId = requestAnimationFrame(gameLoop)
    }

    const handleKeyDown = (e) => {
        keysPressed[e.key] = true
    }
    const handleKeyUp = (e) => {
        keysPressed[e.key] = false
    }

    const handleMouseDown = (e) => {
        if (!gameActive || !isPlayerTurn || !canShoot) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        dragStart = {
            x: playerTank.x + playerTank.width / 2,
            y: playerTank.y,
        }
        dragCurrent = { x, y }
    }

    const handleMouseMove = (e) => {
        if (!gameActive || !isPlayerTurn || !canShoot) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (dragStart) {
            dragCurrent = { x, y }

            const velX = (x - dragStart.x) * POWER_SCALE
            const velY = (y - dragStart.y) * POWER_SCALE
            trajectoryPoints = calculateTrajectory(dragStart.x, dragStart.y, velX, velY)
        }
    }

    const handleMouseUp = () => {
        if (!gameActive || !isPlayerTurn || !canShoot) return

        if (dragStart && dragCurrent) {
            shoot(playerTank, dragCurrent.x, dragCurrent.y)
            dragStart = null
            dragCurrent = null
            trajectoryPoints = []
        }
    }

    function recalculatePhysics() {
        const oldScale = SCALE_FACTOR || window.innerWidth / 1263

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        SCALE_FACTOR = canvas.width / 1263

        GROUND_Y = canvas.height * config.GROUND_Y_FACTOR
        GRAVITY = config.GRAVITY * SCALE_FACTOR
        TANK_WIDTH = config.TANK_WIDTH * SCALE_FACTOR
        TANK_HEIGHT = config.TANK_HEIGHT * SCALE_FACTOR
        TANK_SPEED = config.TANK_SPEED * SCALE_FACTOR
        MAX_FUEL = config.MAX_FUEL * SCALE_FACTOR
        TERRAIN_STEP = 5 * SCALE_FACTOR
        WIND_SPEED = BASE_WIND * SCALE_FACTOR

        const ratio = SCALE_FACTOR / oldScale
        playerTank.x *= ratio
        playerTank.y = getTerrainY(playerTank.x + TANK_WIDTH / 2) - TANK_HEIGHT
        enemyTank.x *= ratio
        enemyTank.y = getTerrainY(enemyTank.x + TANK_WIDTH / 2) - TANK_HEIGHT

        projectiles.forEach((proj) => {
            proj.x *= ratio
            proj.y *= ratio
            proj.vx *= ratio
            proj.vy *= ratio
        })
    }

    const handleResize = () => {
        recalculatePhysics()

        generateTerrain()

        playerTank.width = TANK_WIDTH
        playerTank.height = TANK_HEIGHT
        enemyTank.width = TANK_WIDTH
        enemyTank.height = TANK_HEIGHT

        enemyTank.y = getTerrainY(enemyTank.x + TANK_WIDTH / 2) - TANK_HEIGHT
        playerTank.y = getTerrainY(playerTank.x + TANK_WIDTH / 2) - TANK_HEIGHT
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('resize', handleResize)

    // Initialize touch controls for mobile devices
    const cleanupTouchControls = initTouchControls(canvas, keysPressed)

    // Start the game
    restartGame()
    if (!running) {
        running = true
        animationId = requestAnimationFrame(gameLoop)
    }

    function destroy() {
        running = false
        if (animationId) cancelAnimationFrame(animationId)
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
        canvas.removeEventListener('mousedown', handleMouseDown)
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('resize', handleResize)
        cleanupTouchControls()
        terrain = []
        terrainSurfacePath = null
        terrainFillPath = null
        projectiles = []
        dragStart = null
        dragCurrent = null
        trajectoryPoints = []
    }

    return { restartGame, destroy }
}
