import { Alert, CircularProgress, Paper, useTheme } from '@mui/material';
import { useMemo } from 'react';
import Highcharts from 'highcharts';
import useDateRange from '../hooks/useDateRange';
import useTransactions from '../hooks/useTransactions';
import LoadingState from '../../../enums/loadingState';
import HighchartsReact from 'highcharts-react-official';
import isResaleTransaction from '../../../utils/is-resale-transaction';

const getBucketedDate = (date: Date, startDate: Date, endDate: Date) => {
  if (endDate.getTime() - startDate.getTime() > 8 * 24 * 60 * 60 * 1000) {
    // More than 1 week selected, bucket by day.
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // Less than 1 week selected, bucket by hour.
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours()
  );
};

export default function VolumeChart() {
  const [startDate, endDate] = useDateRange();
  const [transactions, loadingState] = useTransactions();
  const theme = useTheme();

  const chartData = useMemo<Highcharts.Options>(() => {
    const series: Highcharts.SeriesOptionsType[] = [];
    const seriesByType: { [type: string]: [number, number][] } = {};

    // These are sorted by transaction created time, ascending.
    transactions.forEach((transaction) => {
      const seriesName = isResaleTransaction(transaction)
        ? 'Resales'
        : transaction.transaction_type;
      const date = getBucketedDate(transaction.created, startDate, endDate);
      const seriesData = seriesByType[seriesName];

      if (seriesData) {
        const lastDataPoint = seriesData[seriesData.length - 1];
        if (lastDataPoint[0] !== date.getTime()) {
          seriesData.push([date.getTime(), 1]);
        } else {
          lastDataPoint[1]++;
        }
      } else {
        series.push({
          name: seriesName,
          type: 'line',
          data: (seriesByType[seriesName] = [[date.getTime(), 1]]),
        });
      }
    });

    const result: Highcharts.Options = {
      chart: {
        backgroundColor: 'transparent',
      },
      credits: {
        enabled: false,
      },
      title: {
        text: 'Transaction Volume',
        style: {
          color: theme.palette.text.primary,
        },
      },
      legend: {
        enabled: false,
        itemStyle: {
          color: theme.palette.text.primary,
        },
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false,
          },
        },
      },
      xAxis: {
        type: 'datetime',
        tickLength: 0,
        labels: {
          format: '{value:%m/%d}',
        },
        min: (transactions.length > 0
          ? transactions[0].created
          : startDate
        ).getTime(),
        max: (transactions.length > 0
          ? transactions[transactions.length - 1].created
          : endDate
        ).getTime(),
      },
      yAxis: {
        title: {
          text: '',
        },
      },
      series,
      time: {
        useUTC: false,
      },
    };

    return result;
  }, [transactions, startDate, endDate]);

  return (
    <Paper className="transactions-panel" sx={{ m: 1, p: 1 }}>
      {loadingState === LoadingState.Loading ? (
        <CircularProgress />
      ) : loadingState === LoadingState.Error ? (
        <Alert severity="error">Failed to load chart data.</Alert>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={chartData} />
      )}
    </Paper>
  );
}
