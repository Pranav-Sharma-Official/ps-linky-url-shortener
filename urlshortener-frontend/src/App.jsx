import './App.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { getApps } from './utils/helper'
import { ContextProvider } from './contextApi/ContextApi' 
// 1. Import the QueryClient and QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 2. Initialize a new QueryClient instance (outside the component so it doesn't recreate on every render)
const queryClient = new QueryClient()

function App() {
  const CurrentApp = getApps();

  return (
    // 3. Wrap your entire application with the QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <Router>
          <CurrentApp />
        </Router>
      </ContextProvider>
    </QueryClientProvider>
  )
}

export default App