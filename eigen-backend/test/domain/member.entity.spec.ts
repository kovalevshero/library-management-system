import { Member } from '../../src/domain/entities/member.entity';

describe('Member Entity', () => {
  it('should initialize correctly with valid properties', () => {
    const member = new Member({
      code: 'M001',
      name: 'Angga',
    });

    expect(member.code).toBe('M001');
    expect(member.name).toBe('Angga');
    expect(member.penaltyUntil).toBeNull();
    expect(member.isPenalized()).toBe(false);
  });

  it('should throw an error if code or name is empty', () => {
    expect(() => new Member({ code: '', name: 'Angga' })).toThrow(
      'Member code cannot be empty',
    );
    expect(() => new Member({ code: 'M001', name: '' })).toThrow(
      'Member name cannot be empty',
    );
  });

  it('should detect if member is currently penalized', () => {
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

    const penalizedMember = new Member({
      code: 'M001',
      name: 'Angga',
      penaltyUntil: futureDate,
    });
    expect(penalizedMember.isPenalized()).toBe(true);

    const clearedMember = new Member({
      code: 'M002',
      name: 'Ferry',
      penaltyUntil: pastDate,
    });
    expect(clearedMember.isPenalized()).toBe(false);
  });

  it('should evaluate canBorrow according to penalty and borrowing limits', () => {
    const member = new Member({
      code: 'M001',
      name: 'Angga',
    });

    expect(member.canBorrow(0)).toBe(true);
    expect(member.canBorrow(1)).toBe(true);
    expect(member.canBorrow(2)).toBe(false);

    member.applyPenalty(3);
    expect(member.canBorrow(0)).toBe(false);
    expect(member.canBorrow(1)).toBe(false);
  });

  it('should accurately set penalty expiry when applyPenalty is called', () => {
    const member = new Member({
      code: 'M001',
      name: 'Angga',
    });

    const baseDate = new Date('2026-09-01T00:00:00.000Z');
    member.applyPenalty(3, baseDate);

    const expectedDate = new Date('2026-09-04T00:00:00.000Z');
    expect(member.penaltyUntil).toEqual(expectedDate);
  });
});
