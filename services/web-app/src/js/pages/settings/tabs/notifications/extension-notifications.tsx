import { Fragment, useState } from 'react';
import SettingsSection from '../../components/settings-section';
import ToggleCard from '../../components/toggle-card';

export default function ExtensionNotificationSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);

  return (
    <SettingsSection emoji="⚙️" title="Extension">
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
    </SettingsSection>
  );
}
