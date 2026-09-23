import { Member } from '../../../src/domain/entities/member.entity';

describe('Member Entity', () => {
  it('allows borrowing when member has fewer than 2 books and is not penalized', () => {
    const member = new Member({
      code: 'M001',
      name: 'Angga',
      borrowedBooksCount: 1,
      isPenalized: false,
      penaltyUntil: null,
    });

    expect(member.canBorrow).toBe(true);
    expect(member.borrowDisallowedReason).toBeNull();
  });

  it('disallows borrowing when member has reached the maximum of 2 books', () => {
    const member = new Member({
      code: 'M002',
      name: 'Ferry',
      borrowedBooksCount: 2,
      isPenalized: false,
      penaltyUntil: null,
    });

    expect(member.canBorrow).toBe(false);
    expect(member.borrowDisallowedReason).toContain('maximum borrowing limit');
  });

  it('disallows borrowing when member is under active penalty', () => {
    const member = new Member({
      code: 'M003',
      name: 'Putri',
      borrowedBooksCount: 0,
      isPenalized: true,
      penaltyUntil: '2026-10-01T00:00:00.000Z',
    });

    expect(member.canBorrow).toBe(false);
    expect(member.borrowDisallowedReason).toContain('penalty');
  });
});
