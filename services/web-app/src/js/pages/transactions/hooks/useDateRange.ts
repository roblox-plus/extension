import { useMemo } from 'react';
import useQuery from '../../../hooks/useQuery';
import { useSearchParams } from 'react-router-dom';

const getDefaultStartDate = (endDate: Date) => {
  const oneMonthAgo = new Date(endDate.getTime() - 31 * 24 * 60 * 60 * 1000);
  return new Date(
    oneMonthAgo.getFullYear(),
    oneMonthAgo.getMonth(),
    oneMonthAgo.getDate()
  );
};

export default function useDateRange(): [
  Date,
  Date,
  (startDate: Date) => void,
  (endDate: Date) => void
] {
  const { startDate, endDate } = useQuery();
  const [searchParams, setSearchParams] = useSearchParams();

  const parsedEndDate = useMemo<Date>(() => {
    const parsed = new Date(endDate);
    const now = new Date();
    if (isNaN(parsed.getTime())) {
      return now;
    }

    if (parsed > now) {
      return now;
    }

    return parsed;
  }, [endDate]);

  const parsedStartDate = useMemo<Date>(() => {
    const parsed = new Date(startDate);

    if (isNaN(parsed.getTime())) {
      return getDefaultStartDate(parsedEndDate);
    }

    if (parsed > parsedEndDate) {
      return parsedEndDate;
    }

    return parsed;
  }, [startDate, parsedEndDate]);

  const updateQueryParameters = (start: Date, end: Date) => {
    const params = [];
    if (start !== getDefaultStartDate(parsedEndDate)) {
      params.push(`startDate=${start.toLocaleDateString()}`);
    }

    const now = new Date();
    if (end < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      params.push(`endDate=${end.toLocaleDateString()}`);
    }

    if (params.length < 1) {
      setSearchParams('');
    } else {
      setSearchParams(`?${params.join('&')}`);
    }
  };

  const setStartDate = (date: Date) => {
    updateQueryParameters(date, parsedEndDate);
  };

  const setEndDate = (date: Date) => {
    updateQueryParameters(parsedStartDate, date);
  };

  return [parsedStartDate, parsedEndDate, setStartDate, setEndDate];
}
