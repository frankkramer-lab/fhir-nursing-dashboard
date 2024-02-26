import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // Delete Strict Mode for loading only once
  //<React.StrictMode>
    <App />
  //</React.StrictMode>
);

