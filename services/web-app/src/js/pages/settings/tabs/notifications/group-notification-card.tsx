import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import { LoadingState } from '@tix-factory/extension-utils';
import { useEffect, useState } from 'react';
import { getGroupLink } from 'roblox';
import {
  getSettingValue,
  setSettingValue,
} from '../../../../services/settings';
import Group from '../../../../types/group';

type GroupNotificationCardInput = {
  group: Group;
};

export default function GroupNotificationCard({
  group,
}: GroupNotificationCardInput) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [state, setState] = useState<LoadingState>(LoadingState.Loading);

  const update = (value: boolean) => {
    getSettingValue('groupShoutNotifierList')
      .then(async (list) => {
        try {
          if (typeof list !== 'object') {
            list = {};
          }

          if (value) {
            list[group.id] = group.name;
          } else {
            delete list[group.id];
          }

          await setSettingValue('groupShoutNotifierList', list);

          setEnabled(value);
          setState(LoadingState.Success);
        } catch (err) {
          console.error('Failed to update group shout notifier list', err);
          setState(LoadingState.Error);
        }
      })
      .catch((err) => {
        console.error('Failed to load group shout notifier list', err);
        setState(LoadingState.Error);
      });
  };

  useEffect(() => {
    getSettingValue('groupShoutNotifierList')
      .then((list) => {
        setEnabled(list.hasOwnProperty(group.id));
        setState(LoadingState.Success);
      })
      .catch((err) => {
        console.error('Failed to load group shout notifier list', err);
        setState(LoadingState.Error);
      });
  }, []);

  return (
    <Grid item>
      <Link
        title={group.name}
        href={getGroupLink(group.id, group.name).href}
        sx={{ textDecoration: 'none' }}
      >
        <Card
          sx={{
            m: 1,
            position: 'relative',
          }}
        >
          <Checkbox
            sx={{ m: 0.5, right: 0, position: 'absolute' }}
            checked={enabled}
            onChange={(e) => update(e.target.checked)}
            disabled={state !== LoadingState.Success}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              m: 1,
              opacity: enabled ? 1 : 0.5,
            }}
          >
            <CardMedia
              sx={{ height: 100, width: 100 }}
              image={group.icon.imageUrl}
            ></CardMedia>
            <CardContent>
              <Typography
                textOverflow="ellipsis"
                textAlign="center"
                noWrap
                sx={{ width: 100 }}
              >
                {group.name}
              </Typography>
            </CardContent>
          </Box>
        </Card>
      </Link>
    </Grid>
  );
}
