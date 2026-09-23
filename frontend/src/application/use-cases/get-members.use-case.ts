import { Member } from '../../domain/entities/member.entity';
import { IMemberRepository } from '../../domain/repositories/member.repository.interface';

export class GetMembersUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(): Promise<Member[]> {
    return this.memberRepository.getAllMembers();
  }
}
