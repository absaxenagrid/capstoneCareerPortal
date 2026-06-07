import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { useStore } from './store'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
})

function Root() {
  const initTheme = useStore(s => s.initTheme)
  useEffect(() => { initTheme() }, [initTheme])
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Root />
        <Toaster
          position="top-right"
          toastOptions={{ duration: 3000, style: { fontSize: '14px', borderRadius: '8px' } }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
