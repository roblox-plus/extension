const headerDetails = document.querySelector('.header-details>ul.details-info');

const createStat = (labelText: string, valueText: string): HTMLElement => {
  const container = document.createElement('li');

  const label = document.createElement('div');
  label.setAttribute('class', 'text-label font-caption-header');
  label.innerText = labelText;

  const valueLink = document.createElement('a');
  valueLink.setAttribute('class', 'text-name');

  const value = document.createElement('span');
  value.setAttribute('class', 'font-header-2');
  value.innerText = valueText;

  container.appendChild(label);
  container.appendChild(valueLink);
  valueLink.appendChild(value);
  headerDetails?.appendChild(container);

  return value;
};

export { createStat };
