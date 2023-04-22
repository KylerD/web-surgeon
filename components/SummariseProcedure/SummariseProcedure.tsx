import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FormEvent, useState } from "react";
import { Spinner } from "../Spinner";
import { SummariseResponse } from "@/models/SummariseResponse";
import { SummaryBreakdown } from "./SummaryBreakdown";


export function SummariseProcedure() {
  const [summarising, setSummarising] = useState(false);
  const [summariseResponse, setSummariseResponse] = useState<SummariseResponse>();

  const summariseUrl = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (summarising) return;

    setSummarising(true);

    const urlEle = document.getElementById('url') as HTMLInputElement;
    const url = urlEle.value;

    if (!url) {
      setSummarising(false);
      return;
    }

    const response = await fetch('/api/summarise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    setSummarising(false);

    if (response.ok) {
      const summariseResponse: SummariseResponse = await response.json();
      setSummariseResponse(summariseResponse);
    }
  }

  return (
    <>
      <div className="hero my-auto">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-8xl font-bold text-primary">Summarise</h1>
            <p className="py-6 text-xl">Enter a URL you would like to summarise</p>

            <form onSubmit={summariseUrl}>
              <div className="form-control">
                <div className="input-group">
                  <input
                    id="url"
                    type="text"
                    placeholder="Search…"
                    className="input input-bordered w-full"
                    required
                  />
                  <button className="btn btn-square btn-primary">
                    {summarising ?
                      <Spinner
                        width={6}
                        height={6}
                        textColor={'text-white'}
                        fillColor={`fill-blue-600`}
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
      </div >

      {summariseResponse &&
        <SummaryBreakdown summariseResponse={summariseResponse} />
      }
    </>
  )
}