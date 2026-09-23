import { useState, useEffect, useCallback, useMemo } from 'react';
import { Member } from '../../domain/entities/member.entity';
import { GetMembersUseCase } from '../../application/use-cases/get-members.use-case';
import { services } from '../../infrastructure/di/container';

export function useMembers(useCase: GetMembersUseCase = services.getMembersUseCase) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [penalizedOnly, setPenalizedOnly] = useState<boolean>(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await useCase.execute();
      setMembers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve members directory';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPenalty = penalizedOnly ? member.isPenalized : true;
      return matchesSearch && matchesPenalty;
    });
  }, [members, searchQuery, penalizedOnly]);

  const totalMembers = members.length;
  const activeBorrowers = members.filter((m) => m.borrowedBooksCount > 0).length;
  const penalizedMembers = members.filter((m) => m.isPenalized).length;

  return {
    members: filteredMembers,
    allMembers: members,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    penalizedOnly,
    setPenalizedOnly,
    refresh: fetchMembers,
    stats: {
      totalMembers,
      activeBorrowers,
      penalizedMembers,
    },
  };
}
