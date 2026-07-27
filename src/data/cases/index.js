import case_001 from './case_001.json'
import case_002 from './case_002.json'
import case_003 from './case_003.json'
import case_004 from './case_004.json'
import case_005 from './case_005.json'
import case_006 from './case_006.json'
import case_007 from './case_007.json'
import case_008 from './case_008.json'
import case_009 from './case_009.json'
import case_010 from './case_010.json'
import case_011 from './case_011.json'

export const cases = [
  case_001,
  case_002,
  case_003,
  case_004,
  case_005,
  case_006,
  case_007,
  case_008,
  case_009,
  case_010,
  case_011
]

export const caseIndex = {
  'case_001': case_001,
  'case_002': case_002,
  'case_003': case_003,
  'case_004': case_004,
  'case_005': case_005,
  'case_006': case_006,
  'case_007': case_007,
  'case_008': case_008,
  'case_009': case_009,
  'case_010': case_010,
  'case_011': case_011
}

export function getCaseById(id) {
  return caseIndex[id] || null
}

export function getCasesByDifficulty(difficulty) {
  return cases.filter(c => c.difficulty === difficulty)
}

export function getCasesByCategory(category) {
  return cases.filter(c => c.category === category)
}