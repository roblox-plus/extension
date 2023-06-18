import { Typography } from '@mui/material';
import { LoadingState } from '@tix-factory/extension-utils';
import { Fragment, useEffect, useState } from 'react';
import Emoji from '../../../components/emoji';
import { getSettingValue, setSettingValue } from '../../../services/settings';
import ToggleCard from '../components/toggle-card';

export default function FriendNotificationSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [gameNotificationsEnabled, setGameNotificationsEnabled] =
    useState(false);
  const [onlineNotificationsEnabled, setOnlineNotificationsEnabled] =
    useState(false);
  const [offlineNotificationsEnabled, setOfflineNotificationsEnabled] =
    useState(false);
  const [state, setState] = useState<LoadingState>(LoadingState.Loading);

  useEffect(() => {
    getSettingValue('friendNotifier')
      .then((data) => {
        if (data?.on) {
          setEnabled(true);
        }

        if (data?.game !== false) {
          setGameNotificationsEnabled(true);
        }

        if (data?.online) {
          setOnlineNotificationsEnabled(true);
        }

        if (data?.offline) {
          setOfflineNotificationsEnabled(true);
        }

        setState(LoadingState.Success);
      })
      .catch((err) => {
        console.error('Failed to load friend notifier settings');
        setState(LoadingState.Error);
      });
  }, []);

  if (state === LoadingState.Loading) {
    return <Fragment />;
  }

  const getChangeHandler = (
    key: string,
    setToggleState: (value: boolean) => void
  ): ((value: boolean) => Promise<void>) => {
    return async (value) => {
      const data = await getSettingValue('friendNotifier');
      if (typeof data !== 'object') {
        await setSettingValue('friendNotifier', {
          [key]: value,
        });
      } else {
        await setSettingValue(
          'friendNotifier',
          Object.assign({}, data, {
            [key]: value,
          })
        );
      }

      setToggleState(value);
    };
  };

  return (
    <Fragment>
      <Typography variant="h4" sx={{ mt: 1 }}>
        <Emoji emoji="🧑‍🤝‍🧑" /> Friends
      </Typography>
      <ToggleCard
        label="Friend Notifications"
        description="Get notified when your friends come online, or play a game."
        defaultValue={enabled}
        onChange={getChangeHandler('on', setEnabled)}
        disabled={state !== LoadingState.Success}
      />
      {enabled ? (
        <Fragment>
          <ToggleCard
            label="Game Notifications"
            description="Get notifications when the friends you follow join a game."
            defaultValue={gameNotificationsEnabled}
            onChange={getChangeHandler('game', setGameNotificationsEnabled)}
            disabled={state !== LoadingState.Success}
          />
          <ToggleCard
            label="Online Notifications"
            description="Get notifications when the friends you follow come online."
            defaultValue={onlineNotificationsEnabled}
            onChange={getChangeHandler('online', setOnlineNotificationsEnabled)}
            disabled={state !== LoadingState.Success}
          />
          <ToggleCard
            label="Offline Notifications"
            description="Get notifications when the friends you follow go offline."
            defaultValue={offlineNotificationsEnabled}
            onChange={getChangeHandler(
              'offline',
              setOfflineNotificationsEnabled
            )}
            disabled={state !== LoadingState.Success}
          />
        </Fragment>
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
}
