/**
 * 评分引擎 - 计算综合评分、生成反馈报告
 */

export class ScoreEngine {
  constructor(caseData, userAnswers, userJudgment) {
    this.caseData = caseData
    this.userAnswers = userAnswers
    this.userJudgment = userJudgment
    this.standardAnswer = caseData.standard_answer
    this.scoringRules = caseData.scoring_rules
  }

  calculateScore() {
    const result = {
      totalScore: 0,
      breakdown: {
        result: this.calculateResultScore(),
        process: this.calculateProcessScore(),
        law: this.calculateLawScore(),
        analysis: this.calculateAnalysisScore()
      }
    }
    
    result.totalScore = 
      result.breakdown.result.score +
      result.breakdown.process.score +
      result.breakdown.law.score +
      result.breakdown.analysis.score
    
    return result
  }

  calculateResultScore() {
    let score = 0
    let maxScore = this.scoringRules.result_score
    let comment = ''
    
    const judgmentCorrect = this.userJudgment.guilty === this.standardAnswer.judgment
    
    if (judgmentCorrect) {
      score = maxScore
      comment = '判决结果正确'
      
      const sentenceRange = this.caseData.judgment_options.sentencing_range
      if (this.userJudgment.sentenceMonths >= sentenceRange.min_months &&
          this.userJudgment.sentenceMonths <= sentenceRange.max_months) {
        comment = '判决结果正确，量刑适当'
      }
    } else {
      score = 0
      comment = '判决结果错误'
    }
    
    return { score, max: maxScore, comment }
  }

  calculateProcessScore() {
    let score = 0
    let maxScore = this.scoringRules.process_score
    
    const totalQuestions = this.caseData.legal_issues.length
    let correctCount = 0
    
    this.caseData.legal_issues.forEach(question => {
      const userAnswer = this.userAnswers[question.id]
      if (userAnswer && userAnswer.correct) {
        correctCount++
      }
    })
    
    const accuracy = correctCount / totalQuestions
    score = Math.round(maxScore * accuracy)
    
    let comment = ''
    if (accuracy >= 0.9) {
      comment = '推理过程准确，法律判断正确'
    } else if (accuracy >= 0.7) {
      comment = '推理过程基本合理，部分问题判断有误'
    } else if (accuracy >= 0.5) {
      comment = '推理过程有待改进，多处判断有误'
    } else {
      comment = '推理过程存在较大问题，需要加强学习'
    }
    
    return {
      score,
      max: maxScore,
      comment,
      details: {
        correctCount,
        totalQuestions,
        accuracy: (accuracy * 100).toFixed(1) + '%'
      }
    }
  }

  calculateLawScore() {
    let score = 0
    let maxScore = this.scoringRules.law_score
    
    if (!this.userJudgment.laws || this.userJudgment.laws.length === 0) {
      return { score: 0, max: maxScore, comment: '未引用相关法条' }
    }
    
    const correctLaws = this.standardAnswer.legal_basis.map(law => {
      const match = law.match(/第(\d+)条/)
      return match ? match[1] : null
    }).filter(Boolean)
    
    const userLaws = this.userJudgment.laws.map(law => {
      const match = law.match(/第(\d+)条/)
      return match ? match[1] : null
    }).filter(Boolean)
    
    let matchCount = 0
    userLaws.forEach(userLaw => {
      if (correctLaws.includes(userLaw)) {
        matchCount++
      }
    })
    
    const matchRate = matchCount / correctLaws.length
    score = Math.round(maxScore * matchRate)
    
    let comment = ''
    if (matchRate >= 1) {
      comment = '法条引用准确完整'
    } else if (matchRate >= 0.5) {
      comment = '法条引用部分正确，有遗漏'
    } else {
      comment = '法条引用不准确'
    }
    
    return {
      score,
      max: maxScore,
      comment,
      details: {
        correctLaws,
        userLaws,
        matchRate: (matchRate * 100).toFixed(1) + '%'
      }
    }
  }

  calculateAnalysisScore() {
    let score = 0
    let maxScore = this.scoringRules.analysis_score
    
    if (this.userJudgment.circumstances && this.userJudgment.circumstances.length > 0) {
      const correctCircumstances = this.caseData.judgment_options.special_circumstances
        .filter(c => c.correct)
        .map(c => c.id)
      
      let matchCount = 0
      this.userJudgment.circumstances.forEach(c => {
        if (correctCircumstances.includes(c)) {
          matchCount++
        }
      })
      
      const accuracy = matchCount / correctCircumstances.length
      score = Math.round(maxScore * accuracy)
    }
    
    return {
      score,
      max: maxScore,
      comment: score >= maxScore * 0.8 ? '特殊情节认定准确' : '特殊情节认定有遗漏或错误'
    }
  }

  generateFeedback() {
    const scoreResult = this.calculateScore()
    
    return {
      score: scoreResult.totalScore,
      breakdown: scoreResult.breakdown,
      standardAnalysis: {
        judgment: this.standardAnswer.judgment,
        conviction: this.standardAnswer.conviction,
        sentence: this.standardAnswer.sentence,
        legal_basis: this.standardAnswer.legal_basis,
        reasoning: this.standardAnswer.reasoning
      },
      corrections: this.generateCorrections(),
      knowledgeReview: this.generateKnowledgeReview(),
      relatedCases: this.getRelatedCases()
    }
  }

  generateCorrections() {
    const corrections = []
    
    this.caseData.legal_issues.forEach(question => {
      const userAnswer = this.userAnswers[question.id]
      if (!userAnswer || !userAnswer.correct) {
        const correctOption = question.options.find(o => o.correct)
        const wrongOption = userAnswer ? question.options.find(o => o.id === userAnswer.optionId) : null
        
        corrections.push({
          type: 'legal_issue',
          question: question.question,
          userAnswer: wrongOption ? wrongOption.text : '未作答',
          correctAnswer: correctOption.text,
          explanation: correctOption.reasoning || correctOption.feedback
        })
      }
    })
    
    if (this.userJudgment.guilty !== this.standardAnswer.judgment) {
      corrections.push({
        type: 'judgment',
        userAnswer: this.userJudgment.guilty,
        correctAnswer: this.standardAnswer.judgment,
        explanation: this.standardAnswer.reasoning
      })
    }
    
    return corrections
  }

  generateKnowledgeReview() {
    const reviews = []
    const weakPoints = []
    
    this.caseData.legal_issues.forEach(question => {
      const userAnswer = this.userAnswers[question.id]
      if (!userAnswer || !userAnswer.correct) {
        weakPoints.push(question.type)
      }
    })
    
    if (weakPoints.includes('定性问题')) {
      reviews.push({
        topic: '罪名认定',
        suggestion: '建议复习相关罪名的构成要件，注意区分相似罪名',
        relatedLaw: '刑法分则相关条文'
      })
    }
    
    if (weakPoints.includes('量刑情节')) {
      reviews.push({
        topic: '量刑情节认定',
        suggestion: '建议系统学习自首、坦白、立功等量刑情节',
        relatedLaw: '刑法第67、68条'
      })
    }
    
    return reviews
  }

  getRelatedCases() {
    return []
  }
}