import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AuthContext, useAuth } from '@/context/auth'
import 'reflect-metadata'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  }
});

export default function App({ Component, pageProps }: AppProps) {
  const auth = useAuth();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={auth}>
            <Component {...pageProps} />
        </AuthContext.Provider>
      </QueryClientProvider>
    </>
  )
}
