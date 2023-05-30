import { Typography } from '@mui/material';
import { Fragment } from 'react';
import VolumeChart from './volume';

export default function TransactionsCharts() {
  return (
    <Fragment>
      <Typography variant="h4" sx={{ width: '100%', float: 'left', pl: 1 }}>
        Charts
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ width: '100%', float: 'left', pl: 1 }}
      >
        These charts represent aggregated data about your transactions, also
        visible in the summary.
      </Typography>
      <VolumeChart />
    </Fragment>
  );
}
