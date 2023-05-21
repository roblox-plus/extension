import ReactDOM from 'react-dom/client';
import ItemDetailsTabs from './app';

const render = (tabsContainer: HTMLElement) => {
  const root = ReactDOM.createRoot(tabsContainer);
  root.render(<ItemDetailsTabs />);
};

export { render };
