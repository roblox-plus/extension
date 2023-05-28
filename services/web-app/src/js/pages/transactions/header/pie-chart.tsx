import { useEffect, useMemo, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { HighchartsReact } from 'highcharts-react-official';
import Highcharts from 'highcharts';
import TransactionUploader from './transaction-uploader';
import { getTransactionCountByOwner } from '../../../services/transactions';
import { useNavigate } from 'react-router-dom';
import AgentType from '../../../enums/agentType';
import { transactionsPath } from '../../../constants';
import useSelectedCreator from '../hooks/useSelectedCreator';
import useCreators from '../hooks/useCreators';

type TransactionsPieChartInput = {
  files: File[];
  setFiles: (files: File[]) => void;
};

export default function TransactionsPieChart({
  files,
  setFiles,
}: TransactionsPieChartInput) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedCreator] = useSelectedCreator();
  const creators = useCreators();

  const [chartSeries, setChartSeries] = useState<
    Highcharts.PointOptionsObject[]
  >([]);

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
          data: chartSeries,
        },
      ],
      credits: {
        enabled: false,
      },
    };

    return result;
  }, [chartSeries, theme.palette]);

  useEffect(() => {
    let cancelled = false;
    const series: Highcharts.PointOptionsObject[] = [];

    Promise.all(
      creators.map(async (owner) => {
        const selected =
          owner.type === selectedCreator.type &&
          owner.id === selectedCreator.id;
        const count = await getTransactionCountByOwner(owner.type, owner.id);

        if (count > 0) {
          series.push({
            name: owner.name,
            y: count,
            selected,
            sliced: selected,
            events: {
              click: () => {
                if (owner.type === AgentType.User) {
                  navigate(transactionsPath);
                } else {
                  navigate(`${transactionsPath}/${owner.id}`);
                }
              },
            },
          });
        }
      })
    )
      .then(() => {
        if (cancelled) {
          return;
        }

        setChartSeries(series);
      })
      .catch((err) => {
        console.error('Failed to update transaction counts', err);
      });

    return () => {
      cancelled = true;
    };
  }, [creators, files, selectedCreator, navigate]);

  return (
    <Box>
      <HighchartsReact highcharts={Highcharts} options={chartData} />
      <TransactionUploader files={files} setFiles={setFiles} />
    </Box>
  );
}
