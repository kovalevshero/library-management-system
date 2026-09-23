export interface BookProps {
  code: string;
  title: string;
  author: string;
  stock: number;
}

export class Book {
  private readonly _code: string;
  private readonly _title: string;
  private readonly _author: string;
  private _stock: number;

  constructor(props: BookProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Book code cannot be empty');
    }
    if (props.stock < 0) {
      throw new Error('Book stock cannot be negative');
    }

    this._code = props.code.trim();
    this._title = props.title;
    this._author = props.author;
    this._stock = props.stock;
  }

  get code(): string {
    return this._code;
  }

  get title(): string {
    return this._title;
  }

  get author(): string {
    return this._author;
  }

  get stock(): number {
    return this._stock;
  }

  getAvailableStock(activeLoansCount: number): number {
    const available = this._stock - activeLoansCount;
    return available > 0 ? available : 0;
  }

  isAvailable(activeLoansCount: number): boolean {
    return this.getAvailableStock(activeLoansCount) > 0;
  }
}
