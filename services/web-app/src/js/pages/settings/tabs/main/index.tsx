import { Alert, Link } from '@mui/material';
import { Fragment } from 'react';
import { Link as InternalLink } from 'react-router-dom';
import { aboutPath } from '../../../../constants';
import useAuthenticatedUser from '../../../../hooks/useAuthenticatedUser';
import SettingsSection from '../../components/settings-section';
import ToggleCard from '../../components/toggle-card';

export default function MainSettings() {
  const authenticatedUser = useAuthenticatedUser();

  return (
    <Fragment>
      <SettingsSection emoji="🎉" title="All Pages">
        <ToggleCard
          label="Twemojis"
          description={
            <Fragment>
              Replace emojis on the website with{' '}
              <Link href="https://twemoji.twitter.com">twemojis</Link>.
            </Fragment>
          }
          settingName="twemoji"
        />
      </SettingsSection>

      <SettingsSection emoji="👤" title="Profile Page">
        <ToggleCard
          label="RAP on Profile"
          description="Show the value of the inventory of the user on their profile."
          settingName="profileRAP"
        />
      </SettingsSection>

      <SettingsSection emoji="🎮" title="Game Details Page">
        <ToggleCard
          label="Badge Achievement Dates"
          description="On game and badge details pages: see when you achieved each badge."
          settingName="badgeAchievementDatesEnabled"
        />
      </SettingsSection>

      <SettingsSection emoji="🔨" title="Creator Features">
        <Alert severity="info">
          These features are for{' '}
          <InternalLink to={`${aboutPath}/premium`}>
            <Link component="span">Roblox+ Premium</Link>
          </InternalLink>{' '}
          subscribers only.
        </Alert>
        <ToggleCard
          label="Created Item Sales Counter"
          description="Adds a sales count label on item details pages for items that you created."
          settingName="itemSalesCounter"
          disabled={authenticatedUser.premiumExpiration === undefined}
        />
        <ToggleCard
          label="Premium Payouts Summary"
          description="Adds premium payout summary to premium tab, on the developer stats pages in the creator dashboard."
          settingName="premiumPayoutsSummary"
          disabled={authenticatedUser.premiumExpiration === undefined}
        />
        <ToggleCard
          label="Track Robux History"
          description={
            <Fragment>
              Keeps track of your Robux history, while you're on Roblox. The
              chart of your history can be viewed on your{' '}
              <Link href="https://www.roblox.com/transactions">
                transactions page
              </Link>
              .
            </Fragment>
          }
          settingName="robuxHistoryEnabled"
          disabled={authenticatedUser.premiumExpiration === undefined}
        />
      </SettingsSection>
    </Fragment>
  );
}
