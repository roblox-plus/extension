import launchProtocolUrl from '../../utils/launchProtocolUrl';

// Launches into the experience that the specified user is playing.
const followUser = async (userId: number) => {
  await launchProtocolUrl(`roblox://userId=${userId}`);
};

export { followUser };
