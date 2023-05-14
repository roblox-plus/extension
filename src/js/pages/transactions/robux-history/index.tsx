import ReactDOM from 'react-dom/client';
import App from './app';

const render = (container: HTMLElement, userId: number) => {
  const root = ReactDOM.createRoot(container);
  root.render(<App userId={userId} container={container} />);
};

export { render };
