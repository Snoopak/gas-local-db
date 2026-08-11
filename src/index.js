import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

// 🟢 РЕЄСТРАЦІЯ SERVICE WORKER
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .then((reg) => {
        console.log('🚀 Service Worker успішно зареєстровано:', reg.scope);
      })
      .catch((err) => {
        console.error('❌ Помилка реєстрації Service Worker:', err);
      });
  });
}