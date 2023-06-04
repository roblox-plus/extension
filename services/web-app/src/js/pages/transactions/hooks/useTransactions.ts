import { useEffect, useState } from 'react';
import { LoadingState } from '@tix-factory/extension-utils';
import Transaction from '../../../types/transaction';
import useSelectedCreator from './useSelectedCreator';
import { getTransactionsByOwner } from '../../../services/transactions';
import useDateRange from './useDateRange';

export default function useTransactions(): [Transaction[], LoadingState] {
  const [startDate, endDate] = useDateRange();
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creator] = useSelectedCreator();

  useEffect(() => {
    let cancelled = false;

    setTransactions([]);
    setLoadingState(LoadingState.Loading);

    if (!creator.id) {
      return;
    }

    getTransactionsByOwner(creator.type, creator.id, startDate, endDate)
      .then((t) => {
        if (cancelled) {
          return;
        }

        setTransactions(t);
        setLoadingState(LoadingState.Success);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error('Failed to load transactions for this owner.', err);
        setLoadingState(LoadingState.Error);
      });

    return () => {
      cancelled = true;
    };
  }, [creator, startDate, endDate]);

  return [transactions, loadingState];
}
