import {
  Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Typography,
} from '@mui/material';
import React, { Fragment, useState } from 'react';
import { logout } from '../services/authentication';
import useAuthenticatedUser from '../hooks/useAuthenticatedUser';
import { LoadingState } from '@tix-factory/extension-utils';

export default function NavigationAvatar() {
  const authenticatedUser = useAuthenticatedUser();
  const [logoutErrorModalOpen, setLogoutErrorModalOpen] =
    useState<boolean>(false);
  const [logoutDebounce, setLogoutDebounce] = useState<boolean>(false);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<
    (EventTarget & Element) | null
  >(null);

  const toggleAvatarMenu = (event: React.SyntheticEvent) => {
    if (avatarMenuAnchor) {
      setAvatarMenuAnchor(null);
    } else {
      setAvatarMenuAnchor(event.currentTarget);
    }
  };

  const logoutClicked = () => {
    setLogoutDebounce(true);
    setAvatarMenuAnchor(null);

    logout()
      .then(() => {
        // The page will be reloaded by this method call.
      })
      .catch((err) => {
        console.error('Logout failed', err);
        setLogoutDebounce(false);
        setLogoutErrorModalOpen(true);
      });
  };

  const closeLogoutErrorModal = () => {
    setLogoutDebounce(false);
    setLogoutErrorModalOpen(false);
  };

  if (!authenticatedUser.user) {
    return <Fragment />;
  }

  return (
    <Fragment>
      <Modal
        open={logoutErrorModalOpen}
        onClose={closeLogoutErrorModal}
        className="modal"
      >
        <Paper sx={{ p: 1 }}>
          <Typography variant="h4" component="h2" textAlign="center">
            Logout Failed
          </Typography>
          <Alert severity="error" sx={{ marginTop: 1, marginBottom: 1 }}>
            Well that's unfortunately. The log out failed, please click the
            button below to try again.
          </Alert>
          <Button
            color="primary"
            onClick={logoutClicked}
            disabled={logoutDebounce}
          >
            Logout
          </Button>
        </Paper>
      </Modal>
      <Box display="flex" alignItems="center">
        <Typography sx={{ marginRight: 1 }}>
          {authenticatedUser.user.displayName}
        </Typography>
        <IconButton onClick={toggleAvatarMenu} disabled={logoutDebounce}>
          <Avatar
            alt={authenticatedUser.user.name}
            src={authenticatedUser.thumbnail.imageUrl}
          >
            {authenticatedUser.user.name.charAt(0)}
          </Avatar>
        </IconButton>
        <Menu
          keepMounted
          anchorEl={avatarMenuAnchor}
          open={!!avatarMenuAnchor}
          onClose={() => setAvatarMenuAnchor(null)}
        >
          <MenuItem onClick={logoutClicked}>
            <Typography>Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Fragment>
  );
}
