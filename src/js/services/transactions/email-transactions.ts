import xsrfFetch from '../../utils/xsrfFetch';
import { addListener, sendMessage } from '../message';

const messageDestination = 'transactionsService.emailTransactions';

// The type for the message being passed to the background.
type BackgroundMessage = {
  targetType: string;
  targetId: number;
  transactionType: string;
  startDate: number;
  endDate: number;
};

// Fetches the groups the user has access privileged roles in.
const emailTransactions = (
  targetType: 'User' | 'Group',
  targetId: number,
  transactionType: 'Sale',
  startDate: Date,
  endDate: Date
): Promise<void> => {
  return sendMessage(messageDestination, {
    targetType,
    targetId,
    transactionType,
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
  } as BackgroundMessage);
};

// Loads the groups the user has access privileged roles in.
const doEmailTransactions = async (
  targetType: string,
  targetId: number,
  transactionType: string,
  startDate: Date,
  endDate: Date
): Promise<void> => {
  const response = await xsrfFetch(
    new URL(`https://economy.roblox.com/v2/sales/sales-report-download`),
    {
      method: 'POST',
      body: JSON.stringify({
        targetType,
        targetId,
        transactionType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    }
  );

  if (!response.ok) {
    throw 'Failed to send transactions email';
  }
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return doEmailTransactions(
      message.targetType,
      message.targetId,
      message.transactionType,
      new Date(message.startDate),
      new Date(message.endDate)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default emailTransactions;
