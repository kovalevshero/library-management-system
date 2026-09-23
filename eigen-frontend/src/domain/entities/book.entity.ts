export interface BookProperties {
  code: string;
  title: string;
  author: string;
  stock: number;
  availableStock: number;
}

export class Book {
  readonly code: string;
  readonly title: string;
  readonly author: string;
  readonly stock: number;
  readonly availableStock: number;

  constructor(properties: BookProperties) {
    this.code = properties.code;
    this.title = properties.title;
    this.author = properties.author;
    this.stock = properties.stock;
    this.availableStock = properties.availableStock;
  }

  // Determines if at least one copy is currently available for borrowing
  get isAvailable(): boolean {
    return this.availableStock > 0;
  }

  // Returns number of copies currently loaned out across all members
  get borrowedCount(): number {
    return Math.max(0, this.stock - this.availableStock);
  }
}
