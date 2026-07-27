/**
 * 进度管理器 - 管理用户学习进度
 */

const STORAGE_KEY = 'judge_game_progress'

export class ProgressManager {
  constructor() {
    this.progress = this.loadProgress()
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('加载进度失败:', e)
    }
    
    return {
      completedCases: [],
      currentCase: null,
      scores: {},
      totalTime: 0,
      knowledgePoints: {}
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress))
    } catch (e) {
      console.error('保存进度失败:', e)
    }
  }

  startCase(caseId) {
    this.progress.currentCase = caseId
    this.saveProgress()
  }

  completeCase(caseId, scoreData) {
    if (!this.progress.completedCases.includes(caseId)) {
      this.progress.completedCases.push(caseId)
    }
    
    this.progress.scores[caseId] = {
      score: scoreData.score,
      breakdown: scoreData.breakdown,
      completedAt: new Date().toISOString()
    }
    
    this.updateKnowledgePoints(caseId, scoreData)
    this.progress.currentCase = null
    
    this.saveProgress()
  }

  updateKnowledgePoints(caseId, scoreData) {
    const accuracy = scoreData.score / 100
    
    if (scoreData.knowledgePoints) {
      scoreData.knowledgePoints.forEach(kp => {
        if (!this.progress.knowledgePoints[kp.name]) {
          this.progress.knowledgePoints[kp.name] = {
            practiced: 0,
            avgScore: 0
          }
        }
        
        const kpData = this.progress.knowledgePoints[kp.name]
        kpData.avgScore = (kpData.avgScore * kpData.practiced + scoreData.score) / (kpData.practiced + 1)
        kpData.practiced++
      })
    }
  }

  getCaseStatus(caseId) {
    if (this.progress.completedCases.includes(caseId)) {
      return 'completed'
    }
    if (this.progress.currentCase === caseId) {
      return 'in_progress'
    }
    return 'not_started'
  }

  getCaseScore(caseId) {
    return this.progress.scores[caseId] || null
  }

  getOverallStats() {
    const completedCount = this.progress.completedCases.length
    const scores = Object.values(this.progress.scores)
    const avgScore = scores.length > 0 ?
      scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0
    
    return {
      completedCases: completedCount,
      averageScore: Math.round(avgScore),
      totalTime: this.progress.totalTime,
      knowledgePoints: this.progress.knowledgePoints
    }
  }

  getWeakAreas() {
    const weakAreas = []
    const threshold = 70
    
    Object.entries(this.progress.knowledgePoints).forEach(([name, data]) => {
      if (data.avgScore < threshold) {
        weakAreas.push({
          name,
          avgScore: Math.round(data.avgScore),
          practiced: data.practiced
        })
      }
    })
    
    return weakAreas.sort((a, b) => a.avgScore - b.avgScore)
  }

  clearProgress() {
    this.progress = {
      completedCases: [],
      currentCase: null,
      scores: {},
      totalTime: 0,
      knowledgePoints: {}
    }
    this.saveProgress()
  }
}

export const progressManager = new ProgressManager()