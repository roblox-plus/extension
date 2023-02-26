import { getUserByName } from '../../services/usersService';
import '../../../css/pages/login.scss';

const usernameInput = document.getElementById('login-username');
const loginButton = document.getElementById(
  'login-button'
) as HTMLButtonElement;

if (loginButton) {
  usernameInput?.addEventListener('change', (event) => {
    if (event.target instanceof HTMLInputElement) {
      const inputBox = event.target;
      const originalUsername = inputBox.value;

      if (originalUsername) {
        getUserByName(originalUsername)
          .then((user) => {
            usernameInput.parentElement?.classList.toggle(
              'has-error',
              !user ||
                user.name.toLowerCase() !== originalUsername.toLowerCase()
            );
          })
          .catch((err) => {
            console.error('Failed to load user', originalUsername, err);
            inputBox.parentElement?.classList.remove('has-error');
          });
      } else {
        inputBox.parentElement?.classList.remove('has-error');
      }
    }
  });
}
