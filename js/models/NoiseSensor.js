import { NoiseMeasurement } from "./NoiseMeasurement.js";

// Межі класифікації з методичних вказівок до лабораторної №5.
export const NOISE_LIMITS = Object.freeze({
  normalMax: 55,
  warningMax: 70,
});

// Межі коректності даних з попередньої версії вашого monitoring.js.
export const VALID_NOISE_RANGE = Object.freeze({
  min: 30,
  max: 130,
});

export class NoiseSensor {
  constructor(id, district = "Не вказано", location = "Не вказано") {
    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = null;
    this.measurements = [];
  }

  getStatus() {
    if (this.noiseLevel === null) return "invalid";
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) return "normal";
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) return "warning";
    return "critical";
  }

  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new Error("Очікується об'єкт NoiseMeasurement");
    }

    if (!measurement.isValid(VALID_NOISE_RANGE.min, VALID_NOISE_RANGE.max)) {
      throw new Error(`Некоректний рівень шуму: ${measurement.value}`);
    }

    this.measurements.push(measurement);
    this.noiseLevel = measurement.value;
  }

  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new Error(`Рівень має бути в межах ${VALID_NOISE_RANGE.min}–${VALID_NOISE_RANGE.max} dB`);
    }
    this.addMeasurement(new NoiseMeasurement(value));
  }

  static isValidNoiseLevel(value) {
    return Number.isFinite(value) &&
      value >= VALID_NOISE_RANGE.min &&
      value <= VALID_NOISE_RANGE.max;
  }
}
