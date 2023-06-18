import { Alert, Link, Typography } from '@mui/material';
import { Fragment } from 'react';
import { Link as InternalLink } from 'react-router-dom';
import Emoji from '../../../components/emoji';
import { aboutPath } from '../../../constants';
import useAuthenticatedUser from '../../../hooks/useAuthenticatedUser';
import ToggleCard from '../components/toggle-card';

export default function MainSettings() {
  const authenticatedUser = useAuthenticatedUser();

  return (
    <Fragment>
      <Typography variant="h4">
        <Emoji emoji="🎉" /> All Pages
      </Typography>
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

      <Typography variant="h4" sx={{ mt: 1 }}>
        <Emoji emoji="👤" /> Profile Page
      </Typography>
      <ToggleCard
        label="RAP on Profile"
        description="Show the value of the inventory of the user on their profile."
        settingName="profileRAP"
      />

      <Typography variant="h4" sx={{ mt: 1 }}>
        <Emoji emoji="🎮" /> Game Details Page
      </Typography>
      <ToggleCard
        label="Badge Achievement Dates"
        description="On game and badge details pages: see when you achieved each badge."
        settingName="badgeAchievementDatesEnabled"
      />

      <Typography variant="h4" sx={{ mt: 1 }}>
        <Emoji emoji="🔨" /> Creator Features
      </Typography>
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
            Keeps track of your Robux history, while you're on Roblox. The chart
            of your history can be viewed on your{' '}
            <Link href="https://www.roblox.com/transactions">
              transactions page
            </Link>
            .
          </Fragment>
        }
        settingName="robuxHistoryEnabled"
        disabled={authenticatedUser.premiumExpiration === undefined}
      />
    </Fragment>
  );
}
