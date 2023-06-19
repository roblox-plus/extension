import SettingsSection from '../../components/settings-section';
import ToggleCard from '../../components/toggle-card';
import NavigationCounterRoundingSetting from './counter-rounding';

export default function NavigationSettings() {
  return (
    <SettingsSection emoji="🔘" title="Navigation Bar Options">
      <ToggleCard
        label="Show DevEx Rates"
        description="When you click your Robux in the navigation bar, the DevEx amount will be visible below your Robux."
        settingName="navigation.showDevexRate"
      />
      <ToggleCard
        label="Automatic Refresh"
        description="Your Robux, private message, trade, and friend request counts will be refreshed periodically, without refreshing the page."
        settingName="navcounter"
      />
      <NavigationCounterRoundingSetting />
    </SettingsSection>
  );
}
