import { Page } from "@/models/Page";
import { Mask } from "./Mask";
import { FormEvent, useState } from "react";
import { Spinner } from "./Spinner";
import { DocumentMagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";


export function PageBreakdown({ page }: { page: Page }) {
  const [querying, setQuerying] = useState(false);
  const [error, setError] = useState(false);
  const [answer, setAnswer] = useState();
  const keywordColors = ['primary', 'secondary', 'accent'];

  const queryPage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (querying) return;

    setQuerying(true);
    setError(false);
    setAnswer(undefined);

    const queryEle = document.getElementById('query') as HTMLInputElement;
    const query = queryEle.value;

    if (!query) {
      setQuerying(false);
      return;
    }

    const response = await fetch(`/api/${page.reference}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    setQuerying(false);

    if (response.ok) {
      const { answer } = await response.json();
      setAnswer(answer);
    } else {
      setError(true);
    }
  }

  return (
    <div className="hero my-auto">
      <div className="hero-content text-center">
        <div className="max-w-7xl">
          <Mask />

          <h1 className="text-4xl sm:text-6xl font-bold text-primary mb-4">{page.title}</h1>
          <div className="flex flex-col sm:flex-row items-center w-full justify-center mb-4">
            {page.keywords.map((keyword, index) => {
              const keywordColor = `badge-${keywordColors[index % keywordColors.length]}`;
              return <div key={index} className={`badge ${keywordColor} badge-outline badge-lg my-1 sm:my-0 sm:mx-2`}>{keyword}</div>
            })}
          </div>

          <p className="text-lg sm:text-2xl mb-4">{page.overview}</p>

          <h2 className="text-2xl sm:text-6xl font-bold text-secondary mb-4">Insights</h2>
          <p className="text-2xl mb-4">Ask Web Surgeon about the page</p>

          {error &&
            <div className="alert alert-error shadow-lg mb-4">
              <div>
                <XCircleIcon className="w-6 h-6" />
                <span>Error! Something went wrong querying the page. Please try again</span>
              </div>
            </div>
          }

          <form onSubmit={queryPage}>
            <div className="form-control max-w-3xl mx-auto">
              <div className="input-group w-full">
                <input
                  id="query"
                  type="text"
                  placeholder="Does it mention cats?"
                  autoComplete="off"
                  className="input input-bordered w-full input-secondary"
                  required
                />
                <button className="btn btn-square btn-secondary btn-outline">
                  {querying ?
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

          {answer &&
            <div className="alert alert-success shadow-lg mt-4 sm:m-4 sm:max-w-3xl sm:mx-auto">
              <p className="text-xl">{answer}</p>
            </div>
          }
        </div>
      </div>
    </div>
  )
}