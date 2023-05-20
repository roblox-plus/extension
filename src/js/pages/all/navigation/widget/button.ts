const widgetButton = document.createElement('button');
widgetButton.setAttribute('type', 'button');
widgetButton.setAttribute('class', 'rbx-menu-icon rplus-icon-32x32');
widgetButton.setAttribute('id', 'navbar-rplus-widget');

widgetButton.addEventListener('click', (e) => {
  console.log('boop');
});

export default widgetButton;
