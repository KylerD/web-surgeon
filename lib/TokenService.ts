import { encode, decode } from 'gpt-3-encoder'

export class TokenService {
  encode(text: string): number[] {
    return encode(text);
  }

  decode(tokens: number[]): string {
    return decode(tokens);
  }

  tokenCount(text: string): number {
    return this.encode(text).length;
  }
}