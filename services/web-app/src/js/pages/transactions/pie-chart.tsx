import { useEffect, useMemo, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { HighchartsReact } from 'highcharts-react-official';
import Highcharts from 'highcharts';
import TransactionUploader from './transaction-uploader';
import TransactionOwner from '../../types/transaction-owner';
import { getTransactionCountByOwner } from '../../services/transactions';
import { useNavigate, useParams } from 'react-router-dom';
import AgentType from '../../enums/agentType';
import { transactionsPath } from '../../constants';

type TransactionsPieChartInput = {
  files: File[];
  transactionOwners: TransactionOwner[];
};

export default function TransactionsPieChart({
  files,
  transactionOwners,
}: TransactionsPieChartInput) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { groupId } = useParams();

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
      transactionOwners.map(async (owner) => {
        const selected =
          (!groupId && owner.type === AgentType.User) ||
          (Number(groupId) === owner.id && owner.type === AgentType.Group);

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
  }, [transactionOwners, files, groupId, navigate]);

  return (
    <Box>
      <HighchartsReact highcharts={Highcharts} options={chartData} />
      <TransactionUploader files={files} />
    </Box>
  );
}
