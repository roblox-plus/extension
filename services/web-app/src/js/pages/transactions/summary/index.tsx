import { ArrowRightAlt } from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import useTransactionItems from '../hooks/useTransactionItems';
import LoadingState from '../../../enums/loadingState';
import { useMemo } from 'react';
import TransactionDatePicker from './date-picker';
import useDateRange from '../hooks/useDateRange';

export default function TransactionsSummary() {
  const [startDate, endDate, setStartDate, setEndDate] = useDateRange();
  const [transactionItems, loadingState] = useTransactionItems();

  const [totalSales, totalResales, totalRevenue] = useMemo<
    [number, number, number]
  >(() => {
    let sales = 0;
    let resales = 0;
    let revenue = 0;

    transactionItems.forEach((t) => {
      sales += t.saleTransactions.length;
      resales += t.resaleTransactions.length;
      revenue += t.revenue;
    });

    return [sales, resales, revenue];
  }, [transactionItems]);

  return (
    <Paper
      className="transactions-panel"
      sx={{ margin: 1, padding: 1, flexDirection: 'column' }}
    >
      <Typography variant="h4">Summary</Typography>
      <Typography variant="body2">
        The date ranges in this box control all the information displayed on
        this page.
      </Typography>
      <Divider sx={{ m: 1 }} />
      {loadingState === LoadingState.Loading ? (
        <CircularProgress />
      ) : loadingState === LoadingState.Error ? (
        <Alert severity="error">
          Failed to load summary. Please refresh the page to try again.
        </Alert>
      ) : (
        <List>
          <ListItem sx={{ p: 0 }}>
            <ListItemText>
              Item Count: {transactionItems.length.toLocaleString()}
            </ListItemText>
          </ListItem>
          <ListItem sx={{ p: 0 }}>
            <ListItemText>
              Total Sales: {totalSales.toLocaleString()}
            </ListItemText>
          </ListItem>
          {totalResales > 0 ? (
            <ListItem sx={{ p: 0 }}>
              <ListItemText>
                Total Resales: {totalResales.toLocaleString()}
              </ListItemText>
            </ListItem>
          ) : null}
          <ListItem sx={{ p: 0 }}>
            <ListItemText>
              Total Revenue: {totalRevenue.toLocaleString()}
            </ListItemText>
          </ListItem>
        </List>
      )}
      <Divider sx={{ m: 1 }} />
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <TransactionDatePicker
          date={startDate}
          setDate={setStartDate}
          maxDate={endDate}
        />
        <ArrowRightAlt sx={{ m: 1 }} />
        <TransactionDatePicker
          date={endDate}
          setDate={setEndDate}
          minDate={startDate}
          maxDate={new Date()}
        />
      </Box>
    </Paper>
  );
}
