import { useEffect, useMemo, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { HighchartsReact } from 'highcharts-react-official';
import Highcharts from 'highcharts';
import TransactionUploader from './transaction-uploader';
import TransactionOwner from '../../types/transaction-owner';
import { getTransactionCountByOwner } from '../../services/transactions';

type TransactionsPieChartInput = {
  files: File[];
  transactionOwners: TransactionOwner[];
};

export default function TransactionsPieChart({
  files,
  transactionOwners,
}: TransactionsPieChartInput) {
  const theme = useTheme();
  const [transactionCounts, setTransactionCounts] = useState<{
    [name: string]: number;
  }>({});
  const chartData = useMemo<Highcharts.Options>(() => {
    const series: Highcharts.PointOptionsObject[] = [];

    for (let name in transactionCounts) {
      const y = transactionCounts[name];
      if (y) {
        series.push({ name, y });
      }
    }

    const result: Highcharts.Options = {
      chart: {
        //plotShadow: false,
        backgroundColor: 'transparent',
        type: 'pie',
      },
      title: {
        text: 'Transactions',
        style: {
          color: theme.palette.text.primary,
        },
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: false,
          },
        },
      },
      series: [
        {
          name: 'Transactions',
          type: 'pie',
          data: series,
        },
      ],
      credits: {
        enabled: false,
      },
    };

    return result;
  }, [transactionCounts, theme.palette]);

  useEffect(() => {
    let cancelled = false;
    const counts: { [name: string]: number } = {};

    Promise.all(
      transactionOwners.map(async (owner) => {
        counts[owner.name] = await getTransactionCountByOwner(
          owner.type,
          owner.id
        );
      })
    )
      .then(() => {
        if (!cancelled) {
          setTransactionCounts(counts);
        }
      })
      .catch((err) => {
        console.error('Failed to update transaction counts', err);
      });

    return () => {
      cancelled = true;
    };
  }, [transactionOwners, files]);

  return (
    <Box>
      <HighchartsReact highcharts={Highcharts} options={chartData} />
      <TransactionUploader files={files} />
    </Box>
  );
}
