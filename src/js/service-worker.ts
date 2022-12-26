import { getAuthenticatedUser } from './services/usersService';

getAuthenticatedUser()
  .then((user) => {
    console.log(user);
  })
  .catch((err) => console.error('boop', err));
