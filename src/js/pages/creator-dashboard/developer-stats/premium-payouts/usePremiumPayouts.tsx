import { useEffect, useState } from 'react';
import { getPremiumPayoutsSummary } from '../../../../services/premium-payouts';
import PremiumPayout from '../../../../types/premiumPayout';
import LoadingState from '../../../../enums/loadingState';

export default function usePremiumPayouts(
  universeId: number,
  startDate: Date | undefined,
  endDate: Date | undefined
): [LoadingState, PremiumPayout[]] {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );
  const [premiumPayouts, setPremiumPayouts] = useState<PremiumPayout[]>([]);

  useEffect(() => {
    if (startDate && endDate) {
      setLoadingState(LoadingState.Loading);

      getPremiumPayoutsSummary(universeId, startDate, endDate)
        .then((payouts) => {
          setPremiumPayouts(payouts);
          setLoadingState(LoadingState.Success);
        })
        .catch((err) => {
          setPremiumPayouts([]);
          setLoadingState(LoadingState.Error);

          console.warn(
            'Failed to load premium payouts for universe',
            universeId,
            startDate,
            endDate,
            err
          );
        });
    } else {
      setPremiumPayouts([]);
      setLoadingState(LoadingState.Error);
    }
  }, [universeId, startDate, endDate]);

  return [loadingState, premiumPayouts];
}
