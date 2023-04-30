import launchProtocolUrl from '../../utils/launchProtocolUrl';
import buildProtocolUrl from './buildProtocolUrl';

// Launches into the experience that the specified user is playing.
const followUser = async (userId: number) => {
  const url = await buildProtocolUrl({
    followUserId: userId,
  });

  await launchProtocolUrl(url);
};

export { followUser };
