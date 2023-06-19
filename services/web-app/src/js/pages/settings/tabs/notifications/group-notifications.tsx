import { Grid } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { getAuthenticatedUserGroups } from '../../../../services/groups';
import {
  getSettingValue,
  setSettingValue,
} from '../../../../services/settings';
import Group from '../../../../types/group';
import SettingsSection from '../../components/settings-section';
import ToggleCard from '../../components/toggle-card';
import GroupNotificationCard from './group-notification-card';

export default function GroupNotificationSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [groupsListVisible, setGroupsListVisible] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    getAuthenticatedUserGroups()
      .then(setGroups)
      .catch((err) => {
        console.error('Failed to load groups the user is in', err);
      });
  }, []);

  return (
    <SettingsSection emoji="👥" title="Groups">
      <ToggleCard
        label="Group Shout Notifications"
        description="Notifications when a group you're in changes their shout."
        settingName="groupShoutNotifier"
        onChange={setEnabled}
      />
      {enabled ? (
        <Fragment>
          <ToggleCard
            label="Selected Groups Only"
            description="Only get notifications for groups that you select."
            loadValue={() => {
              return new Promise(async (resolve, reject) => {
                try {
                  const mode = await getSettingValue('groupShoutNotifier_mode');
                  resolve(mode === 'whitelist');
                } catch (err) {
                  reject(err);
                }
              });
            }}
            setValue={async (value) => {
              await setSettingValue(
                'groupShoutNotifier_mode',
                value ? 'whitelist' : ''
              );
            }}
            onChange={setGroupsListVisible}
          />
          {groupsListVisible && groups.length > 0 ? (
            <Grid
              container
              sx={{ maxWidth: 800, justifyContent: 'space-around' }}
            >
              {groups.map((group) => (
                <GroupNotificationCard key={group.id} group={group} />
              ))}
            </Grid>
          ) : (
            <Fragment />
          )}
        </Fragment>
      ) : (
        <Fragment />
      )}
    </SettingsSection>
  );
}
