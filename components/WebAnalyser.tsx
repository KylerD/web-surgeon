import { DocumentMagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { FormEvent, useState } from "react";
import { Spinner } from "./Spinner";
import { useRouter } from "next/router";
import { Mask } from "./Mask";


export function WebAnalyser() {
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const analyse = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (analysing) return;

    setAnalysing(true);
    setError(false);

    const urlEle = document.getElementById('url') as HTMLInputElement;
    const url = urlEle.value;

    if (!url) {
      setAnalysing(false);
      return;
    }

    const response = await fetch('/api/analyse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (response.ok) {
      const { reference } = await response.json();
      return router.push(`/${reference}`);
    } else {
      setAnalysing(false);
      setError(true);
    }
  }


  return (
    <div className="hero my-auto">
      <div className="hero-content text-center">
        <div className="max-w-6xl">
          <Mask />

          <h1 className="text-4xl sm:text-8xl font-bold text-primary">Begin Analysis</h1>
          <p className="py-6 text-xl">
            Enter a URL and {' '}
            <span className="text-primary">Web {' '}</span>
            <span className="text-secondary">Surgeon {' '}</span>
            will analyse the web page
          </p>

          {error &&
            <div className="alert alert-error shadow-lg mb-4">
              <div>
                <XCircleIcon className="w-6 h-6" />
                <span>Error! Something went wrong processing your page. Please try again</span>
              </div>
            </div>
          }

          <form onSubmit={analyse}>
            <div className="form-control w-full">
              <div className="input-group w-full">
                <input
                  id="url"
                  type="text"
                  placeholder="https://www.example.com/"
                  className="input input-bordered w-full input-secondary"
                  required
                />
                <button className="btn btn-square btn-secondary btn-outline">
                  {analysing ?
                    <Spinner
                      width={6}
                      height={6}
                      textColor={'text-white'}
                      fillColor={`fill-primary`}
                    />
                    :
                    <DocumentMagnifyingGlassIcon className="w-6 h-6" />
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}