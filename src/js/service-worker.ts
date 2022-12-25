import { getUserById } from './services/usersService';

getUserById(48103520)
  .then((user) => {
    console.log(user);
  })
  .catch((err) => console.error('boop', err));

console.log('Hello, world!');
