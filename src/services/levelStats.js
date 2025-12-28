
const STORAGE_KEY = 'levelStats';

let startTime = null;
let currentLevelId = null;

/**
 * Spusti meranie času pre level
 */
export function startLevel(levelId) {
  currentLevelId = levelId;
  startTime = performance.now();
}

/**
 * Zruší meranie času (napr. pri odchode z GameView)
 */
export function cancelLevel() {
  startTime = null;
  currentLevelId = null;
}

/**
 * Ukončenie hry
 * @param {boolean} isWin
 * @param {Array} levelsData – celé levels.json
 */
export function finishLevel(isWin, levelsData) {
  if (!startTime || !currentLevelId) return;

  const elapsedTime = Math.round((performance.now() - startTime) / 1000);

  const stats = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const levelKey = `level${currentLevelId}`;

  if (!stats || !stats[levelKey]) return;

  const levelStats = stats[levelKey];

  // attempts vždy
  levelStats.attempts += 1;

  if (isWin) {
    levelStats.completed = true;

    // best time
    if (levelStats.best_time === null || elapsedTime < levelStats.best_time) {
      levelStats.best_time = elapsedTime;
    }

    // unlock next level
    const currentIndex = levelsData.findIndex(l => String(l.id) === String(currentLevelId));
    const nextLevel = levelsData[currentIndex + 1];

    if (nextLevel) {
      const nextKey = `level${nextLevel.id}`;
      if (stats[nextKey]) {
        stats[nextKey].unlocked = true;
      }
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

  // reset
  startTime = null;
  currentLevelId = null;
}
