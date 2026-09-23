import { Member } from '../entities/member.entity';

export interface IMemberRepository {
  findByCode(code: string): Promise<Member | null>;
  findAll(): Promise<Member[]>;
  countActiveLoans(memberCode: string): Promise<number>;
  countActiveLoansForMembers(): Promise<Map<string, number>>;
  save(member: Member): Promise<Member>;
}

export const MEMBER_REPOSITORY = Symbol('IMemberRepository');
