import Thumbnail from './thumbnail';

type Group = {
  // The group ID.
  id: number;

  // The group name.
  name: string;

  // The group icon.
  icon: Thumbnail;

  // Whether or not the group is the primary group for the authenticated user.
  primary: boolean;

  // Whether or not the authenticated user has management permissions in the group.
  manager: boolean;
};

export default Group;
