import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react';
import { UserProvider } from '@auth0/nextjs-auth0/client';


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics />
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </>
  )
}
