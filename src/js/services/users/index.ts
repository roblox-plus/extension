import getAuthenticatedUser from './getAuthenticatedUser';
import getUserByName from './get-user-by-name';
import getUserById from './get-user-by-id';

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export { getAuthenticatedUser, getUserByName, getUserById };
