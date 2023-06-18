import { Typography } from '@mui/material';
import { Fragment } from 'react';
import Emoji from '../../../components/emoji';

type SettingsSectionInput = {
  emoji: string;
  title: string;
  children: JSX.Element | JSX.Element[];
};

export default function SettingsSection({
  emoji,
  title,
  children,
}: SettingsSectionInput) {
  return (
    <Fragment>
      <Typography
        className="settings-section-header"
        component="h2"
        variant="h5"
        sx={{ mt: 3, mb: 1 }}
      >
        <Emoji emoji={emoji} /> {title}
      </Typography>
      {children}
    </Fragment>
  );
}
