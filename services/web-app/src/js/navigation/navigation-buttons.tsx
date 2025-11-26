import { ArrowBack } from '@mui/icons-material';
import { Button, Link } from '@mui/material';
import { Fragment } from 'react';

export default function NavigationButtons() {
  return (
    <Fragment>
      <Link href="https://www.roblox.com/home" sx={{ textDecoration: 'none' }}>
        <Button startIcon={<ArrowBack />} sx={{ color: 'text.primary' }}>
          Back to Roblox
        </Button>
      </Link>
    </Fragment>
  );
}
