// https://v5.reactrouter.com/web/example/query-parameters
import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

function useQuery(): [
  { [i: string]: string },
  (key: string, value: string) => void
] {
  const { search } = useLocation();
  const [, setSearchParams] = useSearchParams();
  const searchParams = useMemo<{ [i: string]: string }>(() => {
    const queryParams = new URLSearchParams(search);
    const query: { [i: string]: string } = {};

    queryParams.forEach((value, key) => {
      query[key] = value;
    });

    return query;
  }, [search]);

  const setQueryParameter = (key: string, value: string) => {
    const newParameters = Object.assign({}, searchParams);

    if (value) {
      newParameters[key] = value;
    } else {
      delete newParameters[key];
    }

    if (Object.keys(newParameters).length > 0) {
      setSearchParams(`?${new URLSearchParams(newParameters)}`);
    } else {
      setSearchParams('');
    }
  };

  return [searchParams, setQueryParameter];
}

export default useQuery;
