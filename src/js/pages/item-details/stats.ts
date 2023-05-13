const getItemTypeStat = (): HTMLElement | null => {
  // Game pass details page has this format.
  const itemTypeStat = document.querySelector(
    '.item-details .item-type-field-container'
  );

  if (itemTypeStat instanceof HTMLElement) {
    return itemTypeStat;
  }

  // Item details page has this format sometimes.
  const itemTypeSpan = document.querySelector('#type-content:last');
  if (itemTypeSpan instanceof HTMLElement) {
    return itemTypeSpan.parentElement;
  }

  return null;
};

const createStat = (label: string, value: string) => {
  const itemTypeStat = getItemTypeStat();
  if (!itemTypeStat) {
    return;
  }

  const container = document.createElement('div');
  container.setAttribute('class', 'clearfix item-field-container');

  const labelElement = document.createElement('div');
  labelElement.setAttribute(
    'class',
    'text-subheader text-label text-overflow field-label'
  );
  labelElement.innerText = label;

  const valueElement = document.createElement('span');
  valueElement.setAttribute('class', 'field-content');
  valueElement.innerText = value;

  container.appendChild(labelElement);
  container.appendChild(valueElement);
  itemTypeStat.after(container);
};

export { createStat };
