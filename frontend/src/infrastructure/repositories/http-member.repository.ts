import { Member } from '../../domain/entities/member.entity';
import { IMemberRepository } from '../../domain/repositories/member.repository.interface';
import { apiClient } from '../api/http-client';
import { MemberDto } from '../dtos/api.dtos';

export class HttpMemberRepository implements IMemberRepository {
  async getAllMembers(): Promise<Member[]> {
    const response = await apiClient.get<MemberDto[]>('/members');
    return response.data.map(
      (dto) =>
        new Member({
          code: dto.code,
          name: dto.name,
          borrowedBooksCount: dto.borrowedBooksCount,
          isPenalized: dto.isPenalized,
          penaltyUntil: dto.penaltyUntil,
        })
    );
  }
}
