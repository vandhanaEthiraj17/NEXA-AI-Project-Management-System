import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AppProvider } from './context/AppContext'
import { DataProvider } from './context/DataContext'
import { SocketProvider } from './context/SocketContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <DataProvider>
          <SocketProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </SocketProvider>
        </DataProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
