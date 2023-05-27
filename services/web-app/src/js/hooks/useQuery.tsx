// https://v5.reactrouter.com/web/example/query-parameters
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  return useMemo<{ [i: string]: string }>(() => {
    const queryParams = new URLSearchParams(search);
    const query: { [i: string]: string } = {};

    queryParams.forEach((value, key) => {
      query[key] = value;
    });

    return query;
  }, [search]);
}

export default useQuery;
