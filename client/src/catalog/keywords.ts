import keywordData from '../../../shared/state/keywords.json'

export const ALL_KEYWORDS: Keyword[] = keywordData

export interface Keyword {
  key: string
  text: string
  x: Boolean
}
