import { Fragment, useState } from 'react';
import SettingsSection from '../components/settings-section';
import ToggleCard from '../components/toggle-card';

export default function FriendNotificationSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);

  return (
    <SettingsSection emoji="🧑‍🤝‍🧑" title="Friends">
      <ToggleCard
        label="Trade Notifications"
        description="Notifications when you get a trade, send one, or a trade closes."
        settingName="tradeNotifier"
      />

      <ToggleCard
        label="Friend Notifications"
        description="Get notified when your friends come online, or play a game."
        settingName="friendNotifier.on"
        onChange={setEnabled}
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
    </SettingsSection>
  );
}
