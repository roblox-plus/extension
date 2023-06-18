import { Typography } from '@mui/material';
import { Fragment } from 'react';
import Emoji from '../../../components/emoji';
import ToggleCard from '../components/toggle-card';
import ExtensionNotificationSettings from './extension-notifications';
import FriendNotificationSettings from './friend-notifications';

export default function NotificationSettings() {
  return (
    <Fragment>
      <Typography variant="h4">
        <Emoji emoji="🛒" /> Marketplace
      </Typography>
      <ToggleCard
        label="Avatar Marketplace Notifications"
        description="Notifications when a creator you follow creates or updates an avatar item."
        settingName="itemNotifier"
      />

      <FriendNotificationSettings />

      <Typography variant="h4" sx={{ mt: 1 }}>
        <Emoji emoji="🔀" /> Trades
      </Typography>
      <ToggleCard
        label="Trade Notifications"
        description="Notifications when you get a trade, send one, or a trade closes."
        settingName="tradeNotifier"
      />

      <ExtensionNotificationSettings />
    </Fragment>
  );
}
