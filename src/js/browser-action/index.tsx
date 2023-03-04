import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import '../../css/browser-action.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
