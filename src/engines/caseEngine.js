/**
 * 案件引擎 - 管理案件加载、证据展示、判决流程
 */

export class CaseEngine {
  constructor(caseData) {
    this.caseData = caseData
    this.currentStep = 0
    this.userAnswers = {}
    this.userJudgment = null
    this.startTime = null
    this.stepStartTime = null
  }

  startCase() {
    this.startTime = Date.now()
    this.currentStep = 0
    this.userAnswers = {}
    this.userJudgment = null
    return this.getCaseOverview()
  }

  getCaseOverview() {
    return {
      id: this.caseData.id,
      title: this.caseData.title,
      difficulty: this.caseData.difficulty,
      category: this.caseData.category,
      tags: this.caseData.tags
    }
  }

  getBackground() {
    return this.caseData.background
  }

  getParties() {
    return this.caseData.parties
  }

  getEvidenceList() {
    return this.caseData.evidence.map(e => ({
      id: e.id,
      type: e.type,
      name: e.name,
      source: e.source,
      credibility: e.credibility
    }))
  }

  getEvidenceDetail(evidenceId) {
    const evidence = this.caseData.evidence.find(e => e.id === evidenceId)
    if (!evidence) return null
    
    return {
      ...evidence,
      analysisTips: this.generateEvidenceTips(evidence)
    }
  }

  generateEvidenceTips(evidence) {
    const tips = []
    
    if (evidence.highlights && evidence.highlights.length > 0) {
      tips.push({
        type: 'highlight',
        content: '注意证据中的关键信息'
      })
    }
    
    if (evidence.credibility === 'high') {
      tips.push({
        type: 'credibility',
        content: '该证据证明力较强'
      })
    }
    
    return tips
  }

  getLegalQuestion(questionIndex) {
    const question = this.caseData.legal_issues[questionIndex]
    if (!question) return null
    
    this.stepStartTime = Date.now()
    
    return {
      id: question.id,
      question: question.question,
      type: question.type,
      order: question.order,
      options: question.options.map(o => ({
        id: o.id,
        text: o.text
      }))
    }
  }

  submitAnswer(questionId, optionId) {
    const question = this.caseData.legal_issues.find(q => q.id === questionId)
    if (!question) return { success: false, message: '问题不存在' }
    
    const option = question.options.find(o => o.id === optionId)
    if (!option) return { success: false, message: '选项不存在' }
    
    this.userAnswers[questionId] = {
      optionId: optionId,
      correct: option.correct,
      timeTaken: Date.now() - this.stepStartTime,
      timestamp: Date.now()
    }
    
    if (option.correct) {
      return {
        success: true,
        isCorrect: true,
        hint: '正确！这个认定符合法律规定。'
      }
    } else {
      return {
        success: true,
        isCorrect: false,
        hint: '这个判断可能需要再思考一下，请继续分析。'
      }
    }
  }

  getJudgmentOptions() {
    return this.caseData.judgment_options
  }

  submitJudgment(judgment) {
    this.userJudgment = {
      ...judgment,
      timestamp: Date.now()
    }
    
    return {
      success: true,
      message: '判决已提交'
    }
  }

  getAnswerStats() {
    const total = Object.keys(this.userAnswers).length
    const correct = Object.values(this.userAnswers).filter(a => a.correct).length
    
    return {
      total,
      correct,
      accuracy: total > 0 ? (correct / total * 100).toFixed(1) : 0
    }
  }

  getTotalTime() {
    if (!this.startTime) return 0
    return Date.now() - this.startTime
  }
}