import panel, { openClassName } from './panel';

const widgetButton = document.createElement('button');
widgetButton.setAttribute('type', 'button');
widgetButton.setAttribute('class', 'rbx-menu-icon rplus-icon-32x32');
widgetButton.setAttribute('id', 'navbar-rplus-widget');

widgetButton.addEventListener('dragover', (e) => {
  // This to allow things to be dropped on the button itself.
  e.preventDefault();

  // Open the widget when something is dragged over it.
  panel.classList.add(openClassName);
});

widgetButton.addEventListener('click', () => {
  // When the button is clicked: toggle the open state.
  panel.classList.toggle(
    openClassName,
    !panel.classList.contains(openClassName)
  );
});

export default widgetButton;
