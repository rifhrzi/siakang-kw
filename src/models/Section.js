import { ModuleCard } from './ModuleCard';

export class Section {
  constructor({
    id,
    eyebrow,
    title,
    subtitle,
    link,
    footerNote,
    cards = [],
  }) {
    this.id = id;
    this.eyebrow = eyebrow;
    this.title = title;
    this.subtitle = subtitle;
    this.link = link;
    this.footerNote = footerNote;
    this.cards = cards.map((card) =>
      card instanceof ModuleCard ? card : new ModuleCard(card)
    );
  }
}
