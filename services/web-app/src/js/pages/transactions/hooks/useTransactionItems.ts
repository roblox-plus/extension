import { useMemo } from 'react';
import { LoadingState } from '@tix-factory/extension-utils';
import TransactionItem from '../../../types/transaction-item';
import useTransactions from './useTransactions';
import { getCatalogLink, getGamePassLink } from '../../../utils/linkify';
import { AssetType } from 'roblox';
import Transaction from '../../../types/transaction';
import isResaleTransaction from '../../../utils/is-resale-transaction';

const getItemUrl = (transaction: Transaction): URL | undefined => {
  if (transaction.item_type === 'Game Pass') {
    return getGamePassLink(transaction.item_id, transaction.item_name);
  }

  if (transaction.item_type === 'Developer Product') {
    return new URL(
      `https://create.roblox.com/dashboard/creations/experiences/${transaction.universe_id}/developer-products/${transaction.item_id}/configure`
    );
  }

  if (transaction.item_type === 'Private Server Product') {
    return new URL(
      `https://create.roblox.com/dashboard/creations/experiences/${transaction.universe_id}/overview`
    );
  }

  if (Object.keys(AssetType).includes(transaction.item_type)) {
    return getCatalogLink(transaction.item_id, transaction.item_name);
  }

  return undefined;
};

export default function useTransactionItems(): [
  TransactionItem[],
  LoadingState
] {
  const [transactions, loadingState] = useTransactions();
  const items = useMemo<TransactionItem[]>(() => {
    const transactionItems: { [key: string]: TransactionItem } = {};

    transactions.forEach((transaction) => {
      const key = `${transaction.item_type}:${transaction.item_id}`;
      const transactionItem = transactionItems[key];
      const isResale = isResaleTransaction(transaction);

      if (transactionItem) {
        transactionItem.revenue += transaction.net_revenue;

        if (isResale) {
          transactionItem.resaleTransactions.push(transaction);
        } else {
          transactionItem.saleTransactions.push(transaction);
        }
      } else {
        transactionItems[key] = {
          id: transaction.item_id,
          name: transaction.item_name,
          type: transaction.item_type,
          revenue: transaction.net_revenue,
          link: getItemUrl(transaction),
          saleTransactions: isResale ? [] : [transaction],
          resaleTransactions: isResale ? [transaction] : [],
        };
      }
    });

    const items = Object.values(transactionItems).sort((a, b) => {
      return a.saleTransactions.length + a.resaleTransactions.length <
        b.saleTransactions.length + b.resaleTransactions.length
        ? 1
        : -1;
    });

    return items;
  }, [transactions]);

  return [items, loadingState];
}
