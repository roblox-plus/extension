import PresenceType from '../enums/presence-type';
import PresenceLocation from './presence-location';

type UserPresence = {
  // What the user is currently doing.
  type: PresenceType;

  // The location where the user is.
  location?: PresenceLocation;
};

export default UserPresence;
