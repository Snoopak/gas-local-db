import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// 🔥 ТИМЧАСОВО ВІДКЛЮЧЕНО Service Worker через конфлікт з CORS proxy
// Після переходу на GitHub CDN можна увімкнути назад
// serviceWorkerRegistration.register();

// Відключаємо Service Worker
serviceWorkerRegistration.unregister();

console.log('✅ Service Worker відключено - імпорт за URL має працювати');