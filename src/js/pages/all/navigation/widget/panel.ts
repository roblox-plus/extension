const openClassName = 'rplus-widget-open';
const panel = document.createElement('div');
panel.setAttribute('id', 'rplus-widget');

panel.addEventListener('dragover', (e) => {
  // Allow the area to be dragged/dropped in.
  e.preventDefault();
});

export default panel;
export { openClassName };
