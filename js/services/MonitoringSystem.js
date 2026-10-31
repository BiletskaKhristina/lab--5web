import { NoiseSensor, NOISE_LIMITS, VALID_NOISE_RANGE } from "../models/NoiseSensor.js";

export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new Error("Можна додавати лише об'єкти NoiseSensor");
    }
    if (this.findSensorById(sensor.id)) {
      throw new Error(`Датчик ${sensor.id} вже існує`);
    }
    this.sensors.push(sensor);
  }

  findSensorById(id) {
    return this.sensors.find(sensor => sensor.id === id);
  }

  getSensorsByDistrict(district) {
    return this.sensors.filter(sensor => sensor.district === district);
  }

  getCriticalSensors() {
    return this.sensors.filter(sensor => sensor.getStatus() === "critical");
  }

  getAverageNoiseLevel() {
    const values = this.sensors.flatMap(sensor =>
      sensor.measurements
        .filter(item => item.isValid(VALID_NOISE_RANGE.min, VALID_NOISE_RANGE.max))
        .map(item => item.value)
    );

    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  getAllMeasurements() {
    return this.sensors.flatMap(sensor => sensor.measurements);
  }

  getMeasurementsByStatus(status) {
    return this.getAllMeasurements().filter(item => {
      if (!item.isValid(VALID_NOISE_RANGE.min, VALID_NOISE_RANGE.max)) return false;
      if (status === "normal") return item.value <= NOISE_LIMITS.normalMax;
      if (status === "warning") return item.value > NOISE_LIMITS.normalMax && item.value <= NOISE_LIMITS.warningMax;
      if (status === "critical") return item.value > NOISE_LIMITS.warningMax;
      return false;
    });
  }
}
