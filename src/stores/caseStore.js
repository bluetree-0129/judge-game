import { defineStore } from 'pinia'
import { CaseEngine } from '@/engines/caseEngine'
import { getCaseById } from '@/data/cases'
import { progressManager } from '@/engines/progressManager'

export const useCaseStore = defineStore('case', {
  state: () => ({
    currentCase: null,
    caseEngine: null,
    gameMode: null,
    currentStep: 0,
    userAnswers: {},
    userJudgment: null,
    scoreResult: null
  }),

  getters: {
    isCaseLoaded: (state) => state.currentCase !== null,
    caseOverview: (state) => {
      if (!state.caseEngine) return null
      return state.caseEngine.getCaseOverview()
    },
    evidenceList: (state) => {
      if (!state.caseEngine) return []
      return state.caseEngine.getEvidenceList()
    },
    legalQuestions: (state) => {
      if (!state.currentCase) return []
      return state.currentCase.legal_issues
    },
    judgmentOptions: (state) => {
      if (!state.caseEngine) return null
      return state.caseEngine.getJudgmentOptions()
    }
  },

  actions: {
    loadCase(caseId) {
      const caseData = getCaseById(caseId)
      if (!caseData) {
        throw new Error('案件不存在')
      }
      
      this.currentCase = caseData
      this.caseEngine = new CaseEngine(caseData)
      this.userAnswers = {}
      this.userJudgment = null
      this.currentStep = 0
      this.scoreResult = null
    },

    setGameMode(mode) {
      this.gameMode = mode
    },

    startCase() {
      if (!this.caseEngine) return null
      progressManager.startCase(this.currentCase.id)
      return this.caseEngine.startCase()
    },

    submitAnswer(questionId, optionId) {
      if (!this.caseEngine) return null
      
      const result = this.caseEngine.submitAnswer(questionId, optionId)
      this.userAnswers = { ...this.caseEngine.userAnswers }
      
      return result
    },

    submitJudgment(judgment) {
      if (!this.caseEngine) return null
      
      const result = this.caseEngine.submitJudgment(judgment)
      this.userJudgment = { ...this.caseEngine.userJudgment }
      
      return result
    },

    submitScore(scoreData) {
      this.scoreResult = scoreData
      progressManager.completeCase(this.currentCase.id, scoreData)
    },

    clearCase() {
      this.currentCase = null
      this.caseEngine = null
      this.gameMode = null
      this.currentStep = 0
      this.userAnswers = {}
      this.userJudgment = null
      this.scoreResult = null
    }
  }
})