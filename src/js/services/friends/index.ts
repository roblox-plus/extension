import { default as getUserFriends } from './getUserFriends';
import { default as getFriendRequestCount } from './getFriendRequestCount';

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export { getUserFriends, getFriendRequestCount };
