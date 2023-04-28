import { Footer } from '@/components/Footer';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { WebAnalyser } from '@/components/WebAnalyser';


export function App() {
  return (
    <main
      className='w-full bg-cover bg-[url("/background-pattern.svg")]'>
      <div className="flex flex-col justify-between h-full h-screen bg-base-200 bg-opacity-80 ">
        <WebAnalyser />
        <Footer />
      </div>
    </main>
  )
}

export default withPageAuthRequired(App);
