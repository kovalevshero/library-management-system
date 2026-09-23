import { GetMembersUseCase } from '../../src/application/use-cases/check-members/get-members.use-case';
import { IMemberRepository } from '../../src/domain/repositories/member.repository.interface';
import { Member } from '../../src/domain/entities/member.entity';

describe('GetMembersUseCase', () => {
  let useCase: GetMembersUseCase;
  let mockMemberRepo: jest.Mocked<IMemberRepository>;

  beforeEach(() => {
    mockMemberRepo = {
      findByCode: jest.fn(),
      findAll: jest.fn(),
      countActiveLoans: jest.fn(),
      countActiveLoansForMembers: jest.fn(),
      save: jest.fn(),
    };
    useCase = new GetMembersUseCase(mockMemberRepo);
  });

  it('should list all members with their active borrowed books count and penalty status', async () => {
    const members = [
      new Member({ code: 'M001', name: 'Angga' }),
      new Member({ code: 'M002', name: 'Ferry' }),
    ];

    mockMemberRepo.findAll.mockResolvedValue(members);

    const activeMap = new Map<string, number>();
    activeMap.set('M001', 2);
    activeMap.set('M002', 0);
    mockMemberRepo.countActiveLoansForMembers.mockResolvedValue(activeMap);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      code: 'M001',
      name: 'Angga',
      borrowedBooksCount: 2,
      isPenalized: false,
      penaltyUntil: null,
    });
    expect(result[1]).toEqual({
      code: 'M002',
      name: 'Ferry',
      borrowedBooksCount: 0,
      isPenalized: false,
      penaltyUntil: null,
    });
  });
});
