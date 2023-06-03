import { useParams } from 'react-router-dom';
import TransactionOwner from '../../../types/transaction-owner';
import { useMemo } from 'react';
import useCreators from './useCreators';

export default function useSelectedCreator(): [TransactionOwner, number] {
  const { groupId } = useParams();
  const allCreators = useCreators();

  const [transactionOwner, index] = useMemo<[TransactionOwner, number]>(() => {
    for (let i = 1; i < allCreators.length; i++) {
      if (groupId === `${allCreators[i].id}`) {
        return [allCreators[i], i];
      }
    }

    return [allCreators[0], 0];
  }, [groupId, allCreators]);

  return [transactionOwner, index];
}
