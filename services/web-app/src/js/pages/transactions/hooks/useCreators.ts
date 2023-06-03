import { useEffect, useMemo, useState } from 'react';
import { getAuthenticatedUserGroups } from '../../../services/groups';
import TransactionOwner from '../../../types/transaction-owner';
import useAuthenticatedUser from '../../../hooks/useAuthenticatedUser';
import Group from '../../../types/group';
import AgentType from '../../../enums/agentType';

export default function useCreators(): TransactionOwner[] {
  const authenticatedUser = useAuthenticatedUser();
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  const transactionOwners = useMemo<TransactionOwner[]>(() => {
    return [
      {
        id: authenticatedUser.user?.id || NaN,
        name: `@${authenticatedUser.user?.name}`,
        thumbnail: authenticatedUser.thumbnail.imageUrl || '',
        type: AgentType.User,
      },
    ].concat(
      allGroups.map((g) => {
        return {
          id: g.id,
          name: g.name,
          thumbnail: g.icon.imageUrl,
          type: AgentType.Group,
        };
      })
    );
  }, [authenticatedUser.user, authenticatedUser.thumbnail, allGroups]);

  useEffect(() => {
    getAuthenticatedUserGroups()
      .then((groups) => {
        setAllGroups(groups.filter((g) => g.manager));
      })
      .catch((err) => {
        console.warn('Failed to load user groups for hook', err);
      });
  }, []);

  return transactionOwners;
}
