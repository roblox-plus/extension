setInterval(() => {
  document
    .querySelectorAll(
      '#MessagesInbox .roblox-message-row a.avatar-card-link:not([rplus])'
    )
    .forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      link.setAttribute('rplus', `${+new Date()}`);

      const userId = Number(
        link
          .querySelector('.thumbnail-2d-container')
          ?.getAttribute('thumbnail-target-id')
      );
      if (!userId) {
        return;
      }

      link.setAttribute('href', `/users/${userId}/profile`);
    });
}, 250);

export {};
