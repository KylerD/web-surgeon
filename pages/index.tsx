import { Footer } from '@/components/Footer';
import { Mask } from '@/components/Mask';
import Link from 'next/link';
import Script from 'next/script';


export default function Home() {

  return (
    <main
      className='w-full bg-cover bg-[url("/background-pattern.svg")]'>
      <div className="flex flex-col justify-between h-screen bg-base-200 bg-opacity-80">
        <div id="wcb" className="carbonbadge wcb-d mt-2"></div>
        <div className="hero sm:my-auto">

          <div className="hero-content text-center">
            <div className="max-w-4xl">
              <Mask />

              <h1 className="text-4xl sm:text-8xl font-bold">
                Operate online with {''}
                <span className='text-primary'>Web {' '}</span>
                <span className='text-secondary'>Surgeon</span>
              </h1>

              <div className="flex flex-row space-x-2 items-center w-full justify-center mt-8">
                <Link
                  className="btn btn-primary btn-lg btn-outline w-48 sm:w-72"
                  href='/api/auth/login'>
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <Script src="https://unpkg.com/website-carbon-badges@1.1.3/b.min.js" defer={true} />
    </main>
  )
}
