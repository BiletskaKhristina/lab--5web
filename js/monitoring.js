// Вихідні дані згідно з методичними вказівками
const noiseLevels = [
    42, 55, 61, 78, 83, 67,
    53, 47, 88, 69, 74, 82,
    49, 72, 91, 58,
    64, 76, 95, 51,
    71, -1, 85, 63,
    79, 39, 141, 86
];

const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

// --- 1. Стрілкові функції (Arrow Functions) ---
const isValidLevel = (level, min, max) => Number.isFinite(level) && level >= min && level <= max;

const statusLabel = value => `Рівень: ${value} dB`;
const isAbove = (value, threshold) => value > threshold;

// --- 2. Function Expression (функціональний вираз) ---
const countByCategory = function(levels, min, max, warn, crit) {
    let normal = 0;
    let warning = 0;
    let critical = 0;
    let invalidCount = 0;
    const invalidItems = [];

    for (let i = 0; i < levels.length; i++) {
        const val = levels[i];
        if (!isValidLevel(val, min, max)) {
            invalidCount++;
            invalidItems.push({ position: i + 1, value: val });
            continue;
        }

        if (val <= warn) {
            normal++;
        } else if (val <= crit) {
            warning++;
        } else {
            critical++;
        }
    }

    return { normal, warning, critical, invalidCount, invalidItems };
};

// --- 3. Function Declaration (оголошення функції) ---
function findFirstCritical(levels, min, max, crit) {
    for (let i = 0; i < levels.length; i++) {
        const val = levels[i];
        if (isValidLevel(val, min, max) && val > crit) {
            return { value: val, position: i + 1, index: i };
        }
    }
    return null;
}

// Допоміжні функції для обчислень
function calculateAverage(levels, min, max) {
    let sum = 0;
    let count = 0;
    for (const val of levels) {
        if (isValidLevel(val, min, max)) {
            sum += val;
            count++;
        }
    }
    return count > 0 ? sum / count : null;
}

function findMinMax(levels, min, max) {
    let minVal = null;
    let maxVal = null;
    let initialized = false;

    for (const val of levels) {
        if (isValidLevel(val, min, max)) {
            if (!initialized) {
                minVal = val;
                maxVal = val;
                initialized = true;
            } else {
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
            }
        }
    }
    return { min: minVal, max: maxVal };
}

// Пошук відновлення за допомогою while
function findRecovery(levels, startIndex, min, max, warn) {
    if (startIndex === null || startIndex >= levels.length - 1) return null;

    let i = startIndex + 1;
    let safeCount = 0;
    let lastSafePos = null;

    while (i < levels.length) {
        const val = levels[i];
        if (isValidLevel(val, min, max) && val <= warn) {
            safeCount++;
            if (safeCount === 1) {
                // початок серії
            }
            if (safeCount === 3) {
                return i + 1; // позиція третього безпечного вимірювання
            }
        } else {
            safeCount = 0; // скидання серії
        }
        i++;
    }
    return null;
}

// Перевірка через do...while (перше коректне значення)
function findFirstValid(levels, min, max) {
    if (!Array.isArray(levels) || levels.length === 0) return null;
    let i = 0;
    let result = null;
    do {
        if (isValidLevel(levels[i], min, max)) {
            result = { value: levels[i], position: i + 1 };
            break;
        }
        i++;
    } while (i < levels.length);
    return result;
}

// --- Виконання обчислень ---
const totalCount = noiseLevels.length;
const categories = countByCategory(noiseLevels, minValidLevel, maxValidLevel, warningLevel, criticalLevel);
const validCount = categories.normal + categories.warning + categories.critical;
const averageVal = calculateAverage(noiseLevels, minValidLevel, maxValidLevel);
const minMax = findMinMax(noiseLevels, minValidLevel, maxValidLevel);
const firstCrit = findFirstCritical(noiseLevels, minValidLevel, maxValidLevel, criticalLevel);
const recoveryPos = findRecovery(noiseLevels, firstCrit ? firstCrit.index : null, minValidLevel, maxValidLevel, warningLevel);

// Підрахунок перевищень порога попередження
let warningExceedCount = 0;
for (const val of noiseLevels) {
    if (isValidLevel(val, minValidLevel, maxValidLevel) && isAbove(val, warningLevel)) {
        warningExceedCount++;
    }
}

// --- Формування підсумкового звіту в Console ---
console.group("Акустична варта — звіт моніторингу");
console.log(`Пороги: попередження > ${warningLevel} dB; критичний рівень > ${criticalLevel} dB`);
console.log(`Усього вимірювань: ${totalCount}`);
console.log(`Коректних: ${validCount}`);
console.log(`Некоректних: ${categories.invalidCount}`);

console.table({
    "Без перевищення": categories.normal,
    "Попередження": categories.warning,
    "Критичні": categories.critical
});

console.log(`Середній рівень: ${averageVal !== null ? averageVal.toFixed(2) : 'null'} dB`);
console.log(`Мінімальний рівень: ${minMax.min !== null ? minMax.min + ' dB' : 'null'}`);
console.log(`Максимальний рівень: ${minMax.max !== null ? minMax.max + ' dB' : 'null'}`);

if (firstCrit) {
    console.warn(`Перше критичне вимірювання: ${firstCrit.value} dB, позиція ${firstCrit.position}`);
} else {
    console.log("Перше критичне вимірювання: не знайдено");
}

console.log(`Відновлення (три безпечні вимірювання поспіль): ${recoveryPos !== null ? 'позиція ' + recoveryPos : 'не знайдено'}`);
console.log(`Поріг ${warningLevel} dB перевищено у ${warningExceedCount} вимірюваннях.`);

if (categories.invalidItems.length > 0) {
    const invalidStr = categories.invalidItems.map(item => `позиція ${item.position} (${item.value} dB)`).join(', ');
    console.error(`Некоректні дані: ${invalidStr}.`);
}

console.log(`Висновок: зафіксовано ${categories.critical} критичні вимірювання; після першого з них стійкого відновлення не виявлено.`);
console.groupEnd();