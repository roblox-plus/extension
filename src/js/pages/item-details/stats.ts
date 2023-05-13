const getItemTypeStat = (): [HTMLElement | null, string, string, string] => {
  // Game pass details page has this format.
  const itemTypeStat = document.querySelector(
    '.item-details .item-type-field-container'
  );

  if (itemTypeStat instanceof HTMLElement) {
    return [
      itemTypeStat,
      'clearfix item-field-container',
      'text-subheader text-label text-overflow field-label',
      'field-content',
    ];
  }

  // Item details page has this format sometimes.
  const itemTypeSpan = document.querySelectorAll('#type-content');
  if (
    itemTypeSpan.length > 0 &&
    itemTypeSpan[itemTypeSpan.length - 1] instanceof HTMLElement
  ) {
    return [
      itemTypeSpan[itemTypeSpan.length - 1].parentElement,
      'clearfix item-info-row-container',
      'font-header-1 text-subheader text-label text-overflow row-label',
      'font-body text',
    ];
  }

  return [null, '', '', ''];
};

const createStat = (label: string, value: string) => {
  const [itemTypeStat, containerClassName, labelClassName, valueClassName] =
    getItemTypeStat();
  if (!itemTypeStat) {
    return;
  }

  const container = document.createElement('div');
  container.setAttribute('class', containerClassName);

  const labelElement = document.createElement('div');
  labelElement.setAttribute('class', labelClassName);
  labelElement.innerText = label;

  const valueElement = document.createElement('span');
  valueElement.setAttribute('class', valueClassName);
  valueElement.innerText = value;

  container.appendChild(labelElement);
  container.appendChild(valueElement);
  itemTypeStat.after(container);
};

export { createStat };
