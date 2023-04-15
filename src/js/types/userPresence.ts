import PresenceType from '../enums/presenceType';

type PresenceLocation = {
  // The ID of the location where the user currently is.
  id: number;

  // The name of the location where the user currently is.
  name: string;
};

type UserPresence = {
  // What the user is currently doing.
  type: PresenceType;

  // The location where the user is.
  location?: PresenceLocation;
};

export default UserPresence;
