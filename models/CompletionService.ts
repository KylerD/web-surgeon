export interface CompletionService {
  systemContext: string
  unpredictableSafetyMargin: number;
  getContextMargin(content: string): number
}