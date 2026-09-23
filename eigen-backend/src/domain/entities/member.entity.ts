export interface MemberProps {
  code: string;
  name: string;
  penaltyUntil?: Date | null;
}

export class Member {
  private readonly _code: string;
  private readonly _name: string;
  private _penaltyUntil: Date | null;

  constructor(props: MemberProps) {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Member code cannot be empty');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Member name cannot be empty');
    }

    this._code = props.code.trim();
    this._name = props.name.trim();
    this._penaltyUntil = props.penaltyUntil
      ? new Date(props.penaltyUntil)
      : null;
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  get penaltyUntil(): Date | null {
    return this._penaltyUntil ? new Date(this._penaltyUntil.getTime()) : null;
  }

  isPenalized(currentDate: Date = new Date()): boolean {
    if (!this._penaltyUntil) {
      return false;
    }
    return currentDate.getTime() < this._penaltyUntil.getTime();
  }

  canBorrow(
    activeLoansCount: number,
    currentDate: Date = new Date(),
    maxAllowed: number = 2,
  ): boolean {
    if (this.isPenalized(currentDate)) {
      return false;
    }
    return activeLoansCount < maxAllowed;
  }

  applyPenalty(penaltyDays: number = 3, fromDate: Date = new Date()): void {
    const penaltyEndDate = new Date(
      fromDate.getTime() + penaltyDays * 24 * 60 * 60 * 1000,
    );
    this._penaltyUntil = penaltyEndDate;
  }

  clearPenalty(): void {
    this._penaltyUntil = null;
  }
}
