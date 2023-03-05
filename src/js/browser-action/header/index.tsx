import {
  Alert,
  AppBar,
  Box,
  Button,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import PresenceThumbnail from '../../components/presence-thumbnail';
import PresenceType from '../../enums/presenceType';
import { getLimitedInventory } from '../../services/inventoryService';
import { getTranslationResource } from '../../services/localizationService';
import { getUserPresence } from '../../services/presenceService';
import User from '../../types/user';
import UserPresence from '../../types/userPresence';
import { getUserProfileLink } from '../../utils/linkify';

type HeaderInput = {
  user: User;
};

export default function ({ user }: HeaderInput) {
  const [rap, setRAP] = useState<number>(NaN);
  const [collectibleCount, setCollectibleCount] = useState<number>(NaN);
  const [presence, setPresence] = useState<UserPresence>({
    type: PresenceType.Offline,
  });
  const [error, setError] = useState<boolean>(false);
  const [joinGameText, setJoinGameText] = useState<string>('Join');

  useEffect(() => {
    let cancel = false;

    getLimitedInventory(user.id)
      .then((inventory) => {
        if (cancel) {
          return;
        }

        let rap = 0;
        inventory.forEach((item) => {
          if (!isNaN(item.recentAveragePrice)) {
            rap += item.recentAveragePrice;
          }
        });

        setRAP(rap);
        setCollectibleCount(inventory.length);
        setError(false);
      })
      .catch((err) => {
        if (cancel) {
          return;
        }

        console.error('Failed to load inventory', user, err);
        setError(true);
      });

    getUserPresence(user.id)
      .then((p) => {
        if (cancel) {
          return;
        }

        setPresence(p);
      })
      .catch((err) => {
        console.error('Failed to load user presence', user, err);
      });

    return () => {
      cancel = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!presence.location) {
      return;
    }

    getTranslationResource('Feature.PeopleList', 'Action.Join')
      .then(setJoinGameText)
      .catch((err) => {
        console.warn('Failed to load join game text.', err);
      });
  }, [presence.location]);

  const joinGame = () => {
    console.log('boop');
  };

  return (
    <AppBar className="browser-action-header" sx={{ flexDirection: 'row' }}>
      <Box>
        <PresenceThumbnail userId={user.id} />
        {presence.location && (
          <Box sx={{ padding: 1 }}>
            <Button
              onClick={joinGame}
              color="success"
              variant="outlined"
              fullWidth
            >
              {joinGameText}
            </Button>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ paddingTop: 2, textAlign: 'center' }}>
          <Link
            href={getUserProfileLink(user.id).href}
            title={`@${user.name}`}
            target="_blank"
            underline="none"
            color="inherit"
          >
            {user.displayName}
          </Link>
        </Box>
        {!error && (
          <List sx={{ display: 'flex', flexDirection: 'row' }}>
            {!isNaN(rap) && (
              <ListItem sx={{ paddingTop: 0, textAlign: 'center' }}>
                <ListItemText
                  primary="RAP"
                  secondary={`R\$${rap.toLocaleString()}`}
                />
              </ListItem>
            )}
            {!isNaN(collectibleCount) && (
              <ListItem sx={{ paddingTop: 0, textAlign: 'center' }}>
                <ListItemText
                  primary="Collectibles"
                  secondary={collectibleCount.toLocaleString()}
                />
              </ListItem>
            )}
          </List>
        )}
        {error && (
          <Alert severity="error">Failed to load limited inventory.</Alert>
        )}
      </Box>
    </AppBar>
  );
}
