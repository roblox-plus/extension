import { open } from 'db.js';
import { isBackgroundPage } from '../../constants';
import { addListener, sendMessage } from '../message';
import { getToggleSettingValue } from '../settings';

const messageDestination = 'currencyService.history.';

type RecordUserRobuxMessage = {
  userId: number;
  robux: number;
};

type GetRobuxHistoryMessage = {
  userId: number;
  startDateTime: number;
  endDateTime: number;
};

if (isBackgroundPage) {
  open({
    server: 'currencyBalances',
    version: 1,
    schema: {
      robuxHistory: {
        key: {
          keyPath: ['currencyHolderType', 'currencyHolderId', 'robuxDate'],
        },
        indexes: {
          currencyHolderType: {},
          currencyHolderId: {},
          robuxDate: {},
        },
      },
    },
  })
    .then((database) => {
      console.log('Database connection (for robuxHistory) opened.');
      window.robuxHistoryDatabase = database;

      // Ensure the amount of stored data doesn't get too out of hand.
      // Only store one year of data.
      setInterval(async () => {
        try {
          const now = +new Date();
          const purgeDate = new Date(now - 366 * 24 * 60 * 60 * 1000);
          const robuxHistory = await database.robuxHistory
            .query('robuxDate')
            .range({ lte: purgeDate.getTime() })
            .execute();

          if (robuxHistory.length <= 0) {
            return;
          }

          await Promise.all(
            robuxHistory.map((robuxHistoryRecord) => {
              return database.robuxHistory.remove({
                eq: [
                  robuxHistoryRecord.currencyHolderType,
                  robuxHistoryRecord.currencyHolderId,
                  robuxHistoryRecord.robuxDate,
                ],
              });
            })
          );
        } catch (e) {
          console.warn('Failed to purge Robux history database', e);
        }
      }, 60 * 60 * 1000);
    })
    .catch((err) => {
      console.error('Failed to connect to robuxHistory database.', err);
    });
}

declare global {
  var robuxHistoryDatabase: DbJs.Server;
}

const recordUserRobux = async (userId: number, robux: number) => {
  const enabled = await getToggleSettingValue('robuxHistoryEnabled');
  if (!enabled) {
    return;
  }

  return sendMessage(messageDestination + 'recordUserRobux', {
    userId,
    robux,
  } as RecordUserRobuxMessage);
};

const getUserRobuxHistory = async (
  userId: number,
  startDateTime: Date,
  endDateTime: Date
) => {
  return sendMessage(messageDestination + 'getUserRobuxHistory', {
    userId,
    startDateTime: startDateTime.getTime(),
    endDateTime: endDateTime.getTime(),
  } as GetRobuxHistoryMessage);
};

addListener(
  messageDestination + 'recordUserRobux',
  async (message: RecordUserRobuxMessage) => {
    const now = +new Date();
    const robuxDateTime = new Date(now - (now % 60_000));
    await robuxHistoryDatabase.robuxHistory.update({
      currencyHolderType: 'User',
      currencyHolderId: message.userId,
      robux: message.robux,
      robuxDate: robuxDateTime,
    });
  },
  {
    levelOfParallelism: 1,
  }
);

addListener(
  messageDestination + 'getUserRobuxHistory',
  async (message: GetRobuxHistoryMessage) => {
    const history = await robuxHistoryDatabase.robuxHistory
      .query('robuxDate')
      .range({
        gte: message.startDateTime,
        lte: message.endDateTime,
      })
      .filter(
        (row) =>
          row.currencyHolderType === 'User' &&
          row.currencyHolderId === message.userId
      )
      .execute();
    return history;
  },
  {
    levelOfParallelism: 1,
  }
);

export { recordUserRobux, getUserRobuxHistory };
