import ReactDOM from 'react-dom/client';
import App from './app';
import button from './button';
import panel from './panel';

const root = ReactDOM.createRoot(panel);

const render = (header: HTMLElement) => {
  header.append(panel);
  root.render(<App />);
};

export { render, button };
