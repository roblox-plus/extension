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
      <Typography variant="h4" sx={{ mt: 2 }}>
        <Emoji emoji={emoji} /> {title}
      </Typography>
      {children}
    </Fragment>
  );
}
