import { LoadingState } from '@tix-factory/extension-utils';
import { Thumbnail, User } from 'roblox';

type AuthenticatedUser = {
  // The currently authenticated user.
  user: User | null;

  // The thumbnail for the currently authenticated user.
  thumbnail: Thumbnail;

  // When the premium membership for the user expires, if they have one.
  premiumExpiration: Date | null | undefined;

  // The current state of loading the authenticated user information.
  loadingState: LoadingState;
};

export default AuthenticatedUser;
