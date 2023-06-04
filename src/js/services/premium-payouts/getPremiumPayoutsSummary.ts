import { addListener, sendMessage } from '@tix-factory/messaging';
import PremiumPayoutType from '../../enums/premiumPayoutType';
import PremiumPayout from '../../types/premiumPayout';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'premiumPayoutsService.getPremiumPayoutsSummary';
const cache = new ExpirableDictionary<PremiumPayout[]>(
  messageDestination,
  60 * 1000
);

// The type for the message being passed to the background.
type BackgroundMessage = {
  universeId: number;

  startDate: string;

  endDate: string;
};

const serializeDate = (date: Date) => {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(
    2,
    '0'
  )}-${`${date.getDate()}`.padStart(2, '0')}`;
};

// Fetches the Robux balance of the currently authenticated user.
const getPremiumPayoutsSummary = (
  universeId: number,
  startDate: Date,
  endDate: Date
): Promise<PremiumPayout[]> => {
  return sendMessage(messageDestination, {
    universeId,
    startDate: serializeDate(startDate),
    endDate: serializeDate(endDate),
  } as BackgroundMessage);
};

// Loads the Robux balance of the currently authenticated user.
const loadPremiumPayoutsSummary = async (
  universeId: number,
  startDate: string,
  endDate: string
): Promise<PremiumPayout[]> => {
  const response = await fetch(
    `https://engagementpayouts.roblox.com/v1/universe-payout-history?universeId=${universeId}&startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    throw 'Failed to load premium payouts';
  }

  const result = await response.json();
  const payouts: PremiumPayout[] = [];

  for (let date in result) {
    const payout = result[date];
    if (payout.eligibilityType !== 'Eligible') {
      continue;
    }

    payouts.push({
      date,
      engagementScore: payout.engagementScore,
      payoutInRobux: payout.payoutInRobux,
      payoutType: payout.payoutType as PremiumPayoutType,
    });
  }

  return payouts;
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(
      `${message.universeId}_${message.startDate}_${message.endDate}`,
      () =>
        // Queue up the fetch request, when not in the cache
        loadPremiumPayoutsSummary(
          message.universeId,
          message.startDate,
          message.endDate
        )
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getPremiumPayoutsSummary;
