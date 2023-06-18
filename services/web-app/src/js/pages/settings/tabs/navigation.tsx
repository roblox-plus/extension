import { Typography } from '@mui/material';
import { Fragment } from 'react';
import Emoji from '../../../components/emoji';
import ToggleCard from '../components/toggle-card';
import NavigationCounterRoundingSetting from './navigation-counter-rounding';

export default function NavigationSettings() {
  return (
    <Fragment>
      <Typography variant="h4">
        <Emoji emoji="🔘" /> Navigation Bar Options
      </Typography>
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
    </Fragment>
  );
}
