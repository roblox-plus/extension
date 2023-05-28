import { useMemo } from 'react';
import { Box, LinearProgress, useTheme } from '@mui/material';
import { HighchartsReact } from 'highcharts-react-official';
import Highcharts from 'highcharts';
import TransactionUploader from './transaction-uploader';

type TransactionsPieChartInput = {
  files: File[];
};

export default function TransactionsPieChart({
  files,
}: TransactionsPieChartInput) {
  const theme = useTheme();
  const chartData = useMemo<Highcharts.Options>(() => {
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
          data: [
            {
              name: 'Roblox+',
              y: 1,
            },
            {
              name: 'Trade.',
              y: 2,
            },
          ],
        },
      ],
      credits: {
        enabled: false,
      },
    };

    return result;
  }, []);

  return (
    <Box>
      <HighchartsReact highcharts={Highcharts} options={chartData} />
      <TransactionUploader files={files} />
    </Box>
  );
}
