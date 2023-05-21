export { default as rap } from './rap';

setTimeout(() => {
  // Allow the thumbnail to be dragged, and copy the URL of the user.
  const thumbnail = document.querySelector(
    '.profile-avatar-thumb>.thumbnail-2d-container'
  );

  if (!thumbnail || !(thumbnail instanceof HTMLElement)) {
    return;
  }

  thumbnail.draggable = true;
  thumbnail.addEventListener('dragstart', (e) => {
    e.dataTransfer?.setData('text/plain', location.href);
  });
}, 1000);
