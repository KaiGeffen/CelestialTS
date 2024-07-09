import keywordData from "./keywords.json"


export const keywords: Keyword[] = keywordData

export interface Keyword {
  key: string
  text: string
  x: Boolean
}
