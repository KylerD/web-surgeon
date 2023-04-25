import { EmbeddedSentence } from "./EmbeddedSentence"

export interface AnalysisResponse {
  overview: string
  keywords: string[]
  embeddedSentences: EmbeddedSentence[]
}