import {
  Alert,
  Box,
  CardContent,
  CardMedia,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import useSelectedCreator from '../hooks/useSelectedCreator';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { getTransactionsByOwner } from '../../../services/transactions';
import LoadingState from '../../../enums/loadingState';
import Transaction from '../../../types/transaction';
import TransactionCardContainer from './card';
import AssetType from '../../../enums/assetType';
import { getCatalogLink, getGamePassLink } from '../../../utils/linkify';

type TransactionsListInput = {
  startDate: Date;
  endDate: Date;
};

type TransactionItem = {
  // The ID of the item involved in the transaction.
  id: number;

  // The name of the item involved in the transaction.
  name: string;

  // The type of item involved in the transaction.
  type: string;

  // The link to the item details page.
  link?: URL;

  // How many times the item has sold (excluding resales).
  sales: number;

  // How many times this item has been resold.
  resales: number;

  // Net revenue from this item.
  revenue: number;
};

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

export default function TransactionsList({
  startDate,
  endDate,
}: TransactionsListInput) {
  const [creator] = useSelectedCreator();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );
  const items = useMemo<TransactionItem[]>(() => {
    console.log('Parsing transactions...', transactions);
    const transactionItems: { [key: string]: TransactionItem } = {};

    transactions.forEach((transaction) => {
      const key = `${transaction.item_type}:${transaction.item_id}`;
      const transactionItem = transactionItems[key];

      // HACK: Determine if the transaction is from a resale, by checking if the creator
      // got 10% of the revenue from this transaction.
      // -2 because the 10% could round up to the nearest whole number.
      const isResale =
        transaction.gross_revenue !== 0 &&
        transaction.net_revenue - 2 <= transaction.gross_revenue * 0.1;

      if (transactionItem) {
        transactionItem.revenue += transaction.net_revenue;

        if (isResale) {
          transactionItem.resales++;
        } else {
          transactionItem.sales++;
        }
      } else {
        transactionItems[key] = {
          id: transaction.item_id,
          name: transaction.item_name,
          type: transaction.item_type,
          revenue: transaction.net_revenue,
          link: getItemUrl(transaction),
          sales: isResale ? 0 : 1,
          resales: isResale ? 1 : 0,
        };
      }
    });

    const items = Object.values(transactionItems).sort((a, b) => {
      return a.sales + a.resales < b.sales + b.resales ? 1 : -1;
    });

    console.log('Parsed items from transactions', items);

    return items;
  }, [transactions]);

  useEffect(() => {
    let cancelled = false;

    setTransactions([]);
    setLoadingState(LoadingState.Loading);

    if (!creator.id) {
      return;
    }

    getTransactionsByOwner(creator.type, creator.id, startDate, endDate)
      .then((t) => {
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

  return (
    <Fragment>
      <Typography variant="h4" sx={{ width: '100%', float: 'left', pl: 1 }}>
        Transaction Items
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ width: '100%', float: 'left', pl: 1 }}
      >
        These are all the items sold in the selected time window, sorted by the
        top selling.
      </Typography>
      <Box
        className="transactions-panel"
        sx={{ flexGrow: 1, flexWrap: 'wrap' }}
      >
        {loadingState === LoadingState.Loading ? <CircularProgress /> : null}
        {loadingState === LoadingState.Error ? (
          <Alert severity="error">
            Failed to load items owned by the selected creator. Please refresh
            the page to try again.
          </Alert>
        ) : null}
        {items.map((item) => {
          return (
            <TransactionCardContainer
              link={item.link}
              key={`${item.type}:${item.id}`}
            >
              <CardMedia
                className="rplus-item-card-media"
                data-item-type={item.type}
                data-item-id={item.id}
                sx={{
                  height: '128px',
                  width: '128px',
                  p: 1,
                }}
              />
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  title={item.name}
                >
                  {item.name}
                </Typography>
                <Typography variant="subtitle2">{item.type}</Typography>
                <List>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemText>
                      Sales: {item.sales.toLocaleString()}
                    </ListItemText>
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemText>
                      Revenue: {item.revenue.toLocaleString()}
                    </ListItemText>
                  </ListItem>
                </List>
              </CardContent>
            </TransactionCardContainer>
          );
        })}
      </Box>
    </Fragment>
  );
}
