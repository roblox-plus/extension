import { useEffect, useMemo, useState } from 'react';
import RobuxHistory from '../../../types/robux-history';
import { getUserRobuxHistory } from '../../../services/currency';
import { LoadingState } from '@tix-factory/extension-utils';
import { HighchartsReact } from 'highcharts-react-official';
import Highcharts from 'highcharts';

type ChartInput = {
  userId: number;
  startDate: Date;
  endDate: Date;
};

export default function Chart({ userId, startDate, endDate }: ChartInput) {
  const [robuxHistory, setRobuxHistory] = useState<RobuxHistory[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );

  const chartData = useMemo<Highcharts.Options>(() => {
    // Translate the loaded Robux history, merging the data points, hourly.
    const translatedRobuxHistory: RobuxHistory[] = [];
    const robuxByDate: { [key: number]: RobuxHistory } = {};

    for (let i = 0; i < robuxHistory.length; i++) {
      const v = {
        value: robuxHistory[i].value,
        date: robuxHistory[i].date,
      } as RobuxHistory;

      // Round down to the nearest hour
      const translatedDate = new Date(new Date(v.date).setMinutes(0, 0, 0));

      // Round down to the nearest day
      //const translatedDate = new Date(new Date(v.date).setHours(0, 0, 0, 0));

      const dateKey = translatedDate.getTime();
      const existingRecord = robuxByDate[dateKey];
      if (existingRecord) {
        existingRecord.value = Math.max(existingRecord.value, v.value);
      } else {
        robuxByDate[dateKey] = v;
        translatedRobuxHistory.push(v);
      }
    }

    const result: Highcharts.Options = {
      chart: {
        backgroundColor: 'transparent',
        zooming: {
          type: 'x',
        },
      },
      credits: {
        enabled: false,
      },
      title: {
        text: '',
      },
      legend: {
        enabled: false,
      },
      xAxis: {
        type: 'datetime',
        tickLength: 0,
        labels: {
          format: '{value:%m/%d}',
        },
        min: startDate.getTime(),
        max: endDate.getTime(),
      },
      yAxis: {
        title: {
          text: '',
        },
      },
      series: [
        {
          name: 'Robux',
          type: 'line',
          data: translatedRobuxHistory.map((h) => {
            return [h.date.getTime(), h.value];
          }),
        },
      ],
      time: {
        useUTC: false,
      },
    };

    return result;
  }, [robuxHistory, loadingState, startDate, endDate]);

  useEffect(() => {
    setLoadingState(LoadingState.Loading);

    getUserRobuxHistory(userId, startDate, endDate)
      .then((loadedHistory) => {
        setRobuxHistory(loadedHistory);
        setLoadingState(LoadingState.Success);
      })
      .catch((err) => {
        console.error('Failed to load Robux history', err);
      });
  }, [userId, startDate, endDate]);

  if (loadingState === LoadingState.Loading) {
    return <div className="spinner spinner-default" />;
  }

  if (loadingState === LoadingState.Error) {
    return (
      <div className="section-content-off">
        Failed to load Robux history, refresh the page to try again.
      </div>
    );
  }

  return <HighchartsReact highcharts={Highcharts} options={chartData} />;
}
