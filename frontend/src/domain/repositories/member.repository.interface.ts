import { Member } from '../entities/member.entity';

export interface IMemberRepository {
  getAllMembers(): Promise<Member[]>;
}
