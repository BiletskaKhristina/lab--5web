export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = value;
    this.measuredAt = measuredAt;
  }

  isValid(min = 30, max = 130) {
    return Number.isFinite(this.value) && this.value >= min && this.value <= max;
  }

  toString() {
    return `${this.value} dB — ${this.measuredAt.toLocaleString("uk-UA")}`;
  }
}
