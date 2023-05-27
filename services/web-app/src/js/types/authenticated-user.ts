import LoadingState from '../enums/loadingState';
import Thumbnail from './thumbnail';
import User from './user';

type AuthenticatedUser = {
  // The currently authenticated user.
  user: User | null;

  // The thumbnail for the currently authenticated user.
  thumbnail: Thumbnail;

  // The current state of loading the authenticated user information.
  loadingState: LoadingState;
};

export default AuthenticatedUser;
