import { default as getAuthenticatedUser } from './getAuthenticatedUser';

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export { getAuthenticatedUser };
