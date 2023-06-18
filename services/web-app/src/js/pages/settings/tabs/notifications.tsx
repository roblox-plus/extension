import { Fragment } from 'react';
import SettingsSection from '../components/settings-section';
import ToggleCard from '../components/toggle-card';
import ExtensionNotificationSettings from './extension-notifications';
import FriendNotificationSettings from './friend-notifications';
import GroupNotificationSettings from './group-notifications';

export default function NotificationSettings() {
  return (
    <Fragment>
      <SettingsSection emoji="🛒" title="Marketplace">
        <ToggleCard
          label="Avatar Marketplace Notifications"
          description="Notifications when a creator you follow creates or updates an avatar item."
          settingName="itemNotifier"
        />
      </SettingsSection>

      <FriendNotificationSettings />

      <SettingsSection emoji="🔀" title="Trades">
        <ToggleCard
          label="Trade Notifications"
          description="Notifications when you get a trade, send one, or a trade closes."
          settingName="tradeNotifier"
        />
      </SettingsSection>

      <GroupNotificationSettings />

      <ExtensionNotificationSettings />
    </Fragment>
  );
}
