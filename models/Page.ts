export interface InsertPageRequest {
  title: string
  url: string
  overview: string
  keywords: string[]
}

export interface Page {
  id: string
  title: string
  reference: string
  url: string
  overview: string
  keywords: string[]
}