import { AnalysisResponse } from "@/models/AnalysisResponse";

export function AnalysisBreakdown(
  { analysis, resetAnalysis }: { analysis: AnalysisResponse, resetAnalysis: () => void }
) {

  return (
    <div className="hero my-auto">
      <div className="hero-content text-center">
        <div className="max-w-7xl">
          <h1 className="text-8xl font-bold text-secondary mb-4">Overview</h1>
          <div className="flex flex-row space-x-2 items-center w-full justify-center mb-4">
            <div className="badge badge-primary badge-outline badge-lg">{analysis.keywords[0]}</div>
            <div className="badge badge-secondary badge-outline badge-lg">{analysis.keywords[1]}</div>
            <div className="badge badge-accent badge-outline badge-lg">{analysis.keywords[2]}</div>
          </div>

          <p className="text-2xl mb-4">{analysis.overview}</p>

          <button
            onClick={() => resetAnalysis()}
            className="btn btn-primary btn-lg btn-outline mt-2">
            <div className="flex flex-row space-x-2 items-center text-white w-72 justify-center text-2xl">
              <span>New Analysis</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}