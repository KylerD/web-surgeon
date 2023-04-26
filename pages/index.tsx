import { Footer } from '@/components/Footer';
import { Mask } from '@/components/Mask';
import { WebAnalyser } from '@/components/WebAnalyser';
import { useState } from 'react';


export default function Home() {
  const [begin, setBegin] = useState(false);

  return (
    <main
      className='w-full bg-cover bg-[url("/background-pattern.svg")]'>

      <div className="flex flex-col justify-between h-full min-h-screen bg-base-200 bg-opacity-80 ">

        {!begin && (
          <div className="hero my-auto">
            <div className="hero-content text-center">
              <div className="max-w-4xl">
                <Mask />

                <h1 className="text-4xl sm:text-8xl font-bold">
                  Operate online with {''}
                  <span className='text-primary'>Web {' '}</span>
                  <span className='text-secondary'>Surgeon</span>
                </h1>

                <div className="flex flex-row space-x-2 items-center w-full justify-center mt-8">
                  <button
                    onClick={() => setBegin(true)}
                    className="btn btn-primary btn-lg btn-outline">
                    <div className="flex flex-row space-x-2 items-center text-white w-72 justify-center text-2xl">
                      <span>Begin</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {begin && (
          <WebAnalyser />
        )}

        <Footer />
      </div>
    </main>
  )
}
