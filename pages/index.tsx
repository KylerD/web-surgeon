import { Footer } from '@/components/Footer';
import { SummariseProcedure } from '@/components/SummariseProcedure/SummariseProcedure';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

enum Procedure {
  Summarise = 'Summarise',
}

export default function Home() {
  const [procedure, setProcedure] = useState<Procedure>();

  return (
    <main className='flex flex-col justify-between min-h-screen bg-base-200'>
      {!procedure && (
        <div className="hero bg-gradient-to-r from-base-200 to-base-800 my-auto">
          <div className="hero-content text-center">
            <div className="max-w-4xl">
              <h1 className="text-8xl font-bold">
                Operate online with {''}
                <span className='text-primary'>Web {' '}</span>
                <span className='text-secondary'>Surgeon</span>
              </h1>

              <div className="flex flex-row space-x-2 items-center w-full justify-center mt-8">
                <button
                  onClick={() => setProcedure(Procedure.Summarise)}
                  className="btn btn-primary btn-lg">
                  <div className="flex flex-row space-x-2 items-center text-white">
                    <span>Summarise</span>
                    <DocumentMagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {procedure === Procedure.Summarise && (
        <SummariseProcedure />
      )}

      <Footer />
    </main>
  )
}
