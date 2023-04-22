import { SummariseResponse } from "@/models/SummariseResponse";

export function SummaryBreakdown({ summariseResponse }: { summariseResponse: SummariseResponse }) {
  return (
    <div className="hero">
      <div className="hero-content text-center">
        <div className="max-w-7xl">
          <h1 className="text-8xl font-bold text-secondary mb-4">Summary</h1>

          <p className="text-2xl mb-4">{summariseResponse.summary}</p>

          <h2 className="text-6xl font-bold text-secondary mb-8">Links</h2>
          <p className="text-2xl mb-4">Here are some additional links that may be useful</p>

          <div className="overflow-x-auto">
            <table className="table w-full">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {summariseResponse.links.map((link, index) => (
                  <tr key={index}>
                    <td className="text-primary">{index}</td>
                    <td className="text-secondary">
                      {link}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}