const STORAGE_KEY = 'tanksGameLevels'

export function loadProgress() {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
}

export function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function getLevelProgress(levelId) {
    const progress = loadProgress()
    return progress[levelId]
}

export function updateLevel(levelId, updater) {
    const progress = loadProgress()
    progress[levelId] = updater(progress[levelId] || {})
    saveProgress(progress)
}

export function unlockLevel(levelId) {
    updateLevel(levelId, level => ({
        ...level,
        unlocked: true
    }))
}
