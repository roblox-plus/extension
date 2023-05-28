import getCreatorGroups from './get-creator-groups';
import getUserGroups from './get-user-groups';
import getUserPrimaryGroup from './get-user-primary-group';

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export { getCreatorGroups, getUserGroups, getUserPrimaryGroup };
