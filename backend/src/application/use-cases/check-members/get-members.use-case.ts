import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBER_REPOSITORY,
  IMemberRepository,
} from '../../../domain/repositories/member.repository.interface';
import { MemberResponseDto } from '../../dtos/library.dto';

@Injectable()
export class GetMembersUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(): Promise<MemberResponseDto[]> {
    const members = await this.memberRepository.findAll();
    const activeLoansMap =
      await this.memberRepository.countActiveLoansForMembers();
    const now = new Date();

    return members.map((member) => {
      const borrowedBooksCount = activeLoansMap.get(member.code) ?? 0;
      return {
        code: member.code,
        name: member.name,
        borrowedBooksCount,
        isPenalized: member.isPenalized(now),
        penaltyUntil: member.penaltyUntil
          ? member.penaltyUntil.toISOString()
          : null,
      };
    });
  }
}
