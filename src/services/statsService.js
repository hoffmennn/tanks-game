import levels from '@/game_engine/configs/levels.json'

const STORAGE_KEY = 'tanksGameLevels';

function initLevelStats() {
    // check if stats already exist in localStorage, if not, initialize them

    const stored = localStorage.getItem(STORAGE_KEY);
   
    if (stored) return;

    const levelStats = {};

    levels.forEach((level, index) => {
        levelStats[level.id] = {
            unlocked: index === 0,   
            completed: false,
            best_time: null,
            attempts: 0
        };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(levelStats));
}

export default initLevelStats;
