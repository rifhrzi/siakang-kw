export class ModuleCard {
  constructor({
    id,
    title,
    description,
    features = [],
    actionLabel = 'Lihat Detail',
    schedule = [],
    stats = [],
    highlight,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.features = features;
    this.actionLabel = actionLabel;
    this.schedule = schedule;
    this.stats = stats;
    this.highlight = highlight;
  }
}
