export class MetricCard {
  constructor({ label, value, meta, variant }) {
    this.label = label;
    this.value = value;
    this.meta = meta;
    this.variant = variant;
  }

  get variantClass() {
    return this.variant ?? '';
  }
}
