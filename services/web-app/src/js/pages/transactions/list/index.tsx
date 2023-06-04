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
import { Fragment } from 'react';
import { LoadingState } from '@tix-factory/extension-utils';
import TransactionCardContainer from './card';
import useTransactionItems from '../hooks/useTransactionItems';

export default function TransactionsList() {
  const [items, loadingState] = useTransactionItems();

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
        sx={{ flexGrow: 1, flexWrap: 'wrap', flexDirection: 'row' }}
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
              >
                <Fragment />
              </CardMedia>
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
                      Sales:{' '}
                      {item.saleTransactions.length.toLocaleString() +
                        (item.resaleTransactions.length > 0
                          ? ` (+${item.resaleTransactions.length.toLocaleString()} resales)`
                          : '')}
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
