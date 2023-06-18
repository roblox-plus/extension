import { Typography } from '@mui/material';
import { Fragment, useState } from 'react';
import Emoji from '../../../components/emoji';
import ToggleCard from '../components/toggle-card';

export default function ExtensionNotificationSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);

  return (
    <Fragment>
      <Typography variant="h4" sx={{ mt: 1 }}>
        <Emoji emoji="⚙️" /> Extension
      </Typography>
      <ToggleCard
        label="Startup Notifications"
        description="Notifications when Roblox+ starts or updates."
        settingName="startupNotification.on"
        onChange={setEnabled}
      />
      {enabled ? (
        <ToggleCard
          label="Delayed Notification"
          description="Only show the startup notification after you visit Roblox."
          settingName="startupNotification.visit"
        />
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
}
