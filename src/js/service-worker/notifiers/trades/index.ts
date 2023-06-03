import { getToggleSettingValue } from '../../../services/settings';
import { getAvatarHeadshotThumbnail } from '../../../services/thumbnails';
import User from '../../../types/user';
import fetchDataUri from '../../../utils/fetchDataUri';
import TradeStatusType from '../../../enums/tradeStatusType';
import Trade from '../../../types/trade';
import TradeOffer from '../../../types/trade-offer';

// The prefix for the ID of the notification to display.
const notificationIdPrefix = 'trade-notifier-';

// Type type for the state that is stored for this notifier.
type TradeNotifierState = {
  tradeStatusMap: { [tradeId: number]: TradeStatusType };
  enabledStatusTypes: TradeStatusType[];
};

// Gets the trade status types that should be notified on.
const getEnabledTradeStatusTypes = async (): Promise<TradeStatusType[]> => {
  const enabled = await getToggleSettingValue('tradeNotifier');
  if (enabled) {
    return [
      TradeStatusType.Inbound,
      TradeStatusType.Outbound,
      TradeStatusType.Completed,
      TradeStatusType.Inactive,
    ];
  }

  return [];
  /*
  const values = await getSettingValue('notifiers/trade/status-types');
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((v) => Object.keys(v).includes(v));
  */
};

// Load the trade IDs for a status type.
const getTrades = async (
  tradeStatusType: TradeStatusType
): Promise<number[]> => {
  const response = await fetch(
    `https://trades.roblox.com/v1/trades/${tradeStatusType}?limit=10&sortOrder=Desc`
  );
  const result = await response.json();
  return result.data.map((t: any) => t.id);
};

// Gets an individual trade by its ID.
const getTrade = async (
  id: number,
  tradeStatusType: TradeStatusType
): Promise<Trade> => {
  const response = await fetch(`https://trades.roblox.com/v1/trades/${id}`);
  const result = await response.json();
  const tradePartner: User = result.user;
  const tradePartnerOffer = result.offers.find(
    (o: any) => o.user.id === tradePartner.id
  );
  const authenticatedUserOffer = result.offers.find(
    (o: any) => o.user.id !== tradePartner.id
  );

  return {
    id,
    tradePartner,
    authenticatedUserOffer: {
      robux: authenticatedUserOffer.robux,
      assets: authenticatedUserOffer.userAssets.map((a: any) => {
        return {
          id: a.assetId,
          userAssetId: a.id,
          name: a.name,
          recentAveragePrice: a.recentAveragePrice,
        };
      }),
    },
    partnerOffer: {
      robux: tradePartnerOffer.robux,
      assets: tradePartnerOffer.userAssets.map((a: any) => {
        return {
          id: a.assetId,
          userAssetId: a.id,
          name: a.name,
          recentAveragePrice: a.recentAveragePrice,
        };
      }),
    },
    status: result.status,
    type: tradeStatusType,
  };
};

// Gets the icon URL to display on the notification.
const getNotificationIconUrl = async (trade: Trade): Promise<string> => {
  const thumbnail = await getAvatarHeadshotThumbnail(trade.tradePartner.id);
  if (!thumbnail.imageUrl) {
    return '';
  }

  try {
    return await fetchDataUri(new URL(thumbnail.imageUrl));
  } catch (err) {
    console.error(
      'Failed to fetch icon URL from thumbnail',
      trade,
      thumbnail,
      err
    );
    return '';
  }
};

// Fetches the title for the notification to display to the user, based on current and previous known presence.
const getNotificationTitle = (trade: Trade) => {
  switch (trade.type) {
    case TradeStatusType.Inbound:
      return 'Trade inbound';
    case TradeStatusType.Outbound:
      return 'Trade sent';
    case TradeStatusType.Completed:
      return 'Trade completed';
    default:
      return 'Trade ' + trade.status.toLowerCase();
  }
};

const getOfferValue = (tradeOffer: TradeOffer): string => {
  let value = 0;
  tradeOffer.assets.forEach((asset) => {
    value += asset.recentAveragePrice;
  });

  return (
    `${value.toLocaleString()}` +
    (tradeOffer.robux > 0 ? ` + R\$${tradeOffer.robux.toLocaleString()}` : '')
  );
};

// Handle what happens when a notification is clicked.
chrome.notifications.onClicked.addListener((notificationId) => {
  if (!notificationId.startsWith(notificationIdPrefix)) {
    return;
  }

  // If only we could link to specific trades..
  const tradeId = Number(notificationId.substring(notificationIdPrefix.length));
  chrome.tabs.create({
    url: 'https://www.roblox.com/trades',
    active: true,
  });
});

// Processes the presences, and send the notifications, when appropriate.
export default async (
  previousState: TradeNotifierState | undefined
): Promise<TradeNotifierState | null> => {
  const previousEnabledStatusTypes = previousState?.enabledStatusTypes || [];
  const previousTradeStatusTypes = previousState?.tradeStatusMap || {};
  const newState: TradeNotifierState = {
    tradeStatusMap: {},
    enabledStatusTypes: await getEnabledTradeStatusTypes(),
  };

  await Promise.all(
    newState.enabledStatusTypes.map(async (tradeStatusType) => {
      try {
        const trades = await getTrades(tradeStatusType);
        const tradePromises: Promise<void>[] = [];

        for (let i = 0; i < trades.length; i++) {
          const tradeId = trades[i];

          // Keep track of this trade we have seen, for future reference.
          newState.tradeStatusMap[tradeId] = tradeStatusType;

          // Previously, the notifier type wasn't enabled.
          // Do nothing with the information we now know.
          if (!previousEnabledStatusTypes.includes(tradeStatusType)) {
            continue;
          }

          // We have seen this trade before, in this same status type
          // Because the trades are ordered in descending order, we know there are
          // no other changes further down in this list. We can break.
          if (previousEnabledStatusTypes[tradeId] === tradeStatusType) {
            // And in fact, we have to break.
            // Because if we don't, "new" trades could come in at the bottom of the list.
            break;
          }

          // In all cases, we clear the current notification, to make room for a potential new one.
          const notificationId = notificationIdPrefix + tradeId;
          chrome.notifications.clear(notificationId);

          tradePromises.push(
            getTrade(tradeId, tradeStatusType)
              .then(async (trade) => {
                try {
                  const iconUrl = await getNotificationIconUrl(trade);
                  if (!iconUrl) {
                    // No icon.. no new notification.
                    return;
                  }

                  const title = getNotificationTitle(trade);
                  chrome.notifications.create(notificationId, {
                    type: 'list',
                    iconUrl,
                    title,
                    message:
                      trade.tradePartner.displayName +
                      '\n@' +
                      trade.tradePartner.name,
                    items: [
                      {
                        title: 'Your Value',
                        message: getOfferValue(trade.authenticatedUserOffer),
                      },
                      {
                        title: 'Partner Value',
                        message: getOfferValue(trade.partnerOffer),
                      },
                    ],
                    contextMessage: 'Roblox+ Trade Notifier',
                    isClickable: true,
                  });
                } catch (e) {
                  console.error(
                    'Failed to send notification about trade',
                    trade
                  );
                }
              })
              .catch((err) => {
                console.error(
                  'Failed to load trade information',
                  tradeId,
                  tradeStatusType,
                  err
                );
              })
          );
        }

        await Promise.all(tradePromises);
      } catch (e) {
        console.error(`Failed to check ${tradeStatusType} trade notifier`, e);
      }
    })
  );

  return newState;
};
