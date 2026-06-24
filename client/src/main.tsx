import React from 'react'
import ReactDOM from 'react-dom/client'
import "@radix-ui/themes/styles.css";
import App from './App'
import './index.css'
import { AppThemeProvider } from './components/Layout/AppThemeProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
)
