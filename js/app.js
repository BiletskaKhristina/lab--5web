import { NoiseSensor, NOISE_LIMITS, VALID_NOISE_RANGE } from "./models/NoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

// Ваші вихідні дані з попереднього monitoring.js — збережені без змін.
const noiseLevels = [
  42, 55, 61, 78, 83, 67,
  53, 47, 88, 69, 74, 82,
  49, 72, 91, 58,
  64, 76, 95, 51,
  71, -1, 85, 63,
  79, 39, 141, 86
];

const system = new MonitoringSystem();

// У попередніх даних є один масив вимірювань без окремих ID,
// районів та адрес для кожного датчика. Тому моделюємо один датчик
// з історією всіх 28 вимірювань, не вигадуючи додаткові адреси.
const sensor = new NoiseSensor("NS-01");
system.addSensor(sensor);

// Некоректні значення (-1 та 141) залишаємо в початковому масиві,
// але не додаємо до історії датчика.
const invalidItems = [];

noiseLevels.forEach((value, index) => {
  if (!NoiseSensor.isValidNoiseLevel(value)) {
    invalidItems.push({ position: index + 1, value });
    return;
  }

  sensor.addMeasurement(new NoiseMeasurement(value));
});

// Звіти й допоміжні операції.
const totalCount = noiseLevels.length;
const validCount = system.getAllMeasurements().length;
const invalidCount = totalCount - validCount;
const categories = {
  normal: system.getMeasurementsByStatus("normal").length,
  warning: system.getMeasurementsByStatus("warning").length,
  critical: system.getMeasurementsByStatus("critical").length,
};

const validValues = system.getAllMeasurements().map(item => item.value);
const averageVal = system.getAverageNoiseLevel();
const minVal = validValues.length ? Math.min(...validValues) : null;
const maxVal = validValues.length ? Math.max(...validValues) : null;

const firstCriticalIndex = noiseLevels.findIndex(value =>
  NoiseSensor.isValidNoiseLevel(value) && value > NOISE_LIMITS.warningMax
);

function findRecovery(levels, startIndex) {
  if (startIndex === -1 || startIndex >= levels.length - 1) return null;

  let safeCount = 0;

  for (let i = startIndex + 1; i < levels.length; i++) {
    const value = levels[i];

    if (
      NoiseSensor.isValidNoiseLevel(value) &&
      value <= NOISE_LIMITS.warningMax
    ) {
      safeCount++;
      if (safeCount === 3) return i + 1;
    } else {
      safeCount = 0;
    }
  }

  return null;
}

const recoveryPos = findRecovery(noiseLevels, firstCriticalIndex);
const warningExceedCount = noiseLevels.filter(value =>
  NoiseSensor.isValidNoiseLevel(value) && value > NOISE_LIMITS.normalMax
).length;

console.group("Акустична варта — лабораторна робота №5");
console.log(`Пороги за методичкою: normal ≤ ${NOISE_LIMITS.normalMax} dB; warning ≤ ${NOISE_LIMITS.warningMax} dB; critical > ${NOISE_LIMITS.warningMax} dB`);
console.log(`Перевірка коректності даних: ${VALID_NOISE_RANGE.min}–${VALID_NOISE_RANGE.max} dB`);
console.log(`Усього вимірювань: ${totalCount}`);
console.log(`Коректних: ${validCount}`);
console.log(`Некоректних: ${invalidCount}`);
console.table({
  "Без перевищення (normal)": categories.normal,
  "Попередження (warning)": categories.warning,
  "Критичні (critical)": categories.critical,
});
console.log(`Середній рівень: ${averageVal === null ? "null" : averageVal.toFixed(2) + " dB"}`);
console.log(`Мінімальний рівень: ${minVal === null ? "null" : minVal + " dB"}`);
console.log(`Максимальний рівень: ${maxVal === null ? "null" : maxVal + " dB"}`);

if (firstCriticalIndex !== -1) {
  console.warn(`Перше критичне вимірювання: ${noiseLevels[firstCriticalIndex]} dB, позиція ${firstCriticalIndex + 1}`);
} else {
  console.log("Перше критичне вимірювання: не знайдено");
}

console.log(`Відновлення (три безпечні вимірювання поспіль): ${recoveryPos === null ? "не знайдено" : "позиція " + recoveryPos}`);
console.log(`Перевищень нормального рівня (понад ${NOISE_LIMITS.normalMax} dB): ${warningExceedCount}`);

if (invalidItems.length) {
  console.error("Некоректні дані:", invalidItems);
}

console.log("Датчик у системі:", system.findSensorById("NS-01"));
console.log("Критичні датчики:", system.getCriticalSensors());
console.log(`Висновок: ${categories.critical} критичних вимірювань; стійкого відновлення після першого критичного вимірювання ${recoveryPos === null ? "не виявлено" : "виявлено"}.`);
console.groupEnd();

// Для перевірки з Console.
window.noiseMonitoring = { system, sensor, NoiseSensor, NoiseMeasurement, MonitoringSystem };
