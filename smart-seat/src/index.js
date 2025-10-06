import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  }

  body {
    background-color: #f8fafc;
  }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = globalStyles;
document.head.appendChild(styleElement);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();