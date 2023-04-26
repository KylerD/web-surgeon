export interface InsertPageRequest {
  url: string
  overview: string
  keywords: string[]
}

export interface Page {
  id: string
  reference: string
  url: string
  overview: string
  keywords: string[]
}