import { Fragment } from 'react';
import ToggleCard from '../components/toggle-card';

export default function OtherSettings() {
  return (
    <Fragment>
      <ToggleCard
        label="Badge Achievement Dates"
        description="On game and badge details pages: see when you achieved each badge."
        settingName="badgeAchievementDatesEnabled"
      />
    </Fragment>
  );
}
