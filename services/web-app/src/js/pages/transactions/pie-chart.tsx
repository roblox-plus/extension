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

  const [transactionCounts, setTransactionCounts] = useState<{
    [name: string]: [TransactionOwner, number];
  }>({});

  const chartData = useMemo<Highcharts.Options>(() => {
    const series: Highcharts.PointOptionsObject[] = [];

    for (let name in transactionCounts) {
      const value = transactionCounts[name];
      if (value) {
        const owner = value[0];
        const selected =
          (!groupId && owner.type === AgentType.User) ||
          (Number(groupId) === owner.id && owner.type === AgentType.Group);

        series.push({
          name,
          y: value[1],
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
  }, [transactionCounts, theme.palette, groupId, navigate]);

  useEffect(() => {
    let cancelled = false;
    const counts: { [name: string]: [TransactionOwner, number] } = {};

    Promise.all(
      transactionOwners.map(async (owner) => {
        const count = await getTransactionCountByOwner(owner.type, owner.id);
        counts[owner.name] = [owner, count];
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
