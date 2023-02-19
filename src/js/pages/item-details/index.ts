import { initializeContextMenu } from './contextMenu';
export * as stats from './stats';

// Listen for the context menu to open
window.addEventListener('DOMNodeInserted', async (event) => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }

  if (
    event.target.classList.contains('popover') &&
    event.target.parentElement?.id === 'item-context-menu'
  ) {
    const contextMenu =
      event.target.parentElement.querySelector('ul.dropdown-menu');
    if (contextMenu instanceof HTMLElement) {
      try {
        await initializeContextMenu(contextMenu);
      } catch (e) {
        console.warn('Unexpected error opening context menu', e);
      }
    }
  }
});
