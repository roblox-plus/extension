import {
  isOwnCreatedItem,
  isOwnedStudioItem,
} from './details';
import { createDownloadLink } from './download';

// Creates an individual context menu button
const createContextMenuButton = (
  contextMenu: HTMLElement,
  label: string
): HTMLButtonElement => {
  const listItem = document.createElement('li');
  listItem.classList.add('rplus-list-item');
  contextMenu?.appendChild(listItem);

  const button = document.createElement('button');
  button.innerText = label;
  button.setAttribute('role', 'button');
  listItem.appendChild(button);

  return button;
};

// Any option that needs to be added to the context menu should exist in here.
const addContextMenuOptions = async (contextMenu: HTMLElement) => {
  // Add download button when the item is made by the authenticated user.
  if (isOwnCreatedItem || isOwnedStudioItem) {
    const downloadLink = await createDownloadLink();
    if (downloadLink) {
      const downloadButton = createContextMenuButton(contextMenu, '');
      downloadButton.parentElement?.appendChild(downloadLink);
      downloadButton.remove();
    }
  }
};

export { addContextMenuOptions as initializeContextMenu };
