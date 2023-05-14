import { Fragment, useEffect } from 'react';
import Chart from './chart';
import useSelectedDates from './date-hook';

type AppInputs = {
  userId: number;

  container: HTMLElement;
};

export default function App({ userId, container }: AppInputs) {
  const [startDate, endDate] = useSelectedDates();

  useEffect(() => {
    const interval = setInterval(() => {
      container.classList.toggle(
        'hidden',
        !document.querySelector('#transactions-page-container div.summary')
      );
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Fragment>
      <h3>{'Robux History'}</h3>
      <div className="section-content">
        <div className="robux-history-chart">
          <Chart startDate={startDate} endDate={endDate} userId={userId} />
        </div>
      </div>
    </Fragment>
  );
}
