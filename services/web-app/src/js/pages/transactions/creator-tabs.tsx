import { Fragment, useEffect, useMemo, useState } from 'react';
import useAuthenticatedUser from '../../hooks/useAuthenticatedUser';
import { Avatar, Tab, Tabs } from '@mui/material';
import Group from '../../types/group';
import { getAuthenticatedUserGroups } from '../../services/groups';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionsPath } from '../../constants';
import TransactionOwner from '../../types/transaction-owner';
import AgentType from '../../enums/agentType';

type CreatorTabsInput = {
  setTransactionOwners: (transactionOwners: TransactionOwner[]) => void;
};

export default function CreatorTabs({
  setTransactionOwners,
}: CreatorTabsInput) {
  const navigate = useNavigate();
  const authenticatedUser = useAuthenticatedUser();
  const { groupId } = useParams();
  const [groups, setGroups] = useState<Group[]>([]);
  const groupIndex = useMemo(() => {
    for (let i = 0; i < groups.length; i++) {
      if (groupId === `${groups[i].id}`) {
        return i + 1;
      }
    }

    return 0;
  }, [groupId, groups]);

  useEffect(() => {
    if (!authenticatedUser.user) {
      return;
    }

    getAuthenticatedUserGroups()
      .then(setGroups)
      .catch((err) => {
        console.warn('Failed to load authenticated user groups', err);
      });
  }, [authenticatedUser.user]);

  useEffect(() => {
    if (!authenticatedUser.user) {
      return;
    }

    setTransactionOwners(
      [
        {
          type: AgentType.User,
          id: authenticatedUser.user.id,
          name: `@${authenticatedUser.user.name}`,
        },
      ].concat(
        groups.map((g) => {
          return {
            type: AgentType.Group,
            id: g.id,
            name: g.name,
          };
        })
      )
    );
  }, [authenticatedUser.user, groups, setTransactionOwners]);

  if (!authenticatedUser.user) {
    return <Fragment />;
  }

  // The tabs don't work properly if they're not the direct children of their parent.
  // i.e. if we put this as its own component function it doesn't work properly
  const renderTab = (
    id: number,
    name: string,
    icon: string,
    tabIndex: number
  ) => {
    return (
      <Tab
        key={id}
        tabIndex={tabIndex}
        label={name}
        sx={{
          flexDirection: 'row',
          justifyContent: 'left',
          textAlign: 'left',
          textTransform: 'none',
          borderRight: 1,
        }}
        icon={
          <Avatar
            alt={name}
            src={icon}
            sx={{
              marginRight: 2,
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
            variant="rounded"
          >
            {name.trim().charAt(0)}
          </Avatar>
        }
      />
    );
  };

  return (
    <Tabs
      orientation="vertical"
      value={groupIndex}
      onChange={(_, i) => {
        const group = groups[i - 1];
        if (group) {
          navigate(`${transactionsPath}/${group.id}`);
        } else {
          navigate(transactionsPath);
        }
      }}
    >
      {renderTab(
        authenticatedUser.user.id,
        authenticatedUser.user.displayName,
        authenticatedUser.thumbnail.imageUrl,
        0
      )}
      {groups
        .filter((g) => g.manager)
        .map((g, i) => {
          return renderTab(g.id, g.name, g.icon.imageUrl, i + 1);
        })}
    </Tabs>
  );
}
