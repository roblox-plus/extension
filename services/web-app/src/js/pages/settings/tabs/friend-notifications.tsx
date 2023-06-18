import { Typography } from '@mui/material';
import { LoadingState } from '@tix-factory/extension-utils';
import { Fragment, useEffect, useState } from 'react';
import Emoji from '../../../components/emoji';
import { getSettingValue, setSettingValue } from '../../../services/settings';
import ToggleCard from '../components/toggle-card';

export default function FriendNotificationSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [state, setState] = useState<LoadingState>(LoadingState.Loading);

  useEffect(() => {
    getSettingValue('friendNotifier')
      .then((data) => {
        if (data?.on) {
          setEnabled(true);
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

  return (
    <Fragment>
      <Typography variant="h4" sx={{ mt: 1 }}>
        <Emoji emoji="🧑‍🤝‍🧑" /> Friends
      </Typography>
      <ToggleCard
        label="Friend Notifications"
        description="Get notified when your friends come online, or play a game."
        defaultValue={enabled}
        onChange={async (value) => {
          const data = await getSettingValue('friendNotifier');
          if (typeof data !== 'object') {
            await setSettingValue('friendNotifier', {
              on: value,
            });
          } else {
            await setSettingValue(
              'friendNotifier',
              Object.assign({}, data, {
                on: value,
              })
            );
          }

          setEnabled(value);
        }}
        disabled={state !== LoadingState.Success}
      />
      {enabled ? (
        <Fragment>
          <ToggleCard
            label="Game Notifications"
            description="Get notifications when the friends you follow join a game."
            defaultValue={true}
            settingName="friendNotifier.game"
          />
          <ToggleCard
            label="Online Notifications"
            description="Get notifications when the friends you follow come online."
            settingName="friendNotifier.online"
          />
          <ToggleCard
            label="Offline Notifications"
            description="Get notifications when the friends you follow go offline."
            settingName="friendNotifier.offline"
          />
        </Fragment>
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
}
