type PresenceLocation = {
  // The place ID of the location where the user currently is.
  placeId: number;

  // The universe ID of the location where the user currently is.
  universeId: number;

  // The name of the location where the user currently is.
  name: string;

  // The ID of the server the user is currently in.
  serverId?: string;
};

export default PresenceLocation;
