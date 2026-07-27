<template>
  <div class="score-result animate-fade-in">
    <h2>判决完成！</h2>
    
    <div class="score-overview">
      <div class="total-score">
        <span class="score-value">{{ scoreData.score }}</span>
        <span class="score-unit">分</span>
      </div>
      
      <div class="score-breakdown">
        <div class="breakdown-item">
          <span class="item-name">结果分</span>
          <div class="pixel-progress">
            <div 
              class="pixel-progress-bar" 
              :class="getProgressClass(scoreData.breakdown.result.score / scoreData.breakdown.result.max)"
              :style="{ width: (scoreData.breakdown.result.score / scoreData.breakdown.result.max * 100) + '%' }"
            ></div>
          </div>
          <span class="item-score">{{ scoreData.breakdown.result.score }}/{{ scoreData.breakdown.result.max }}</span>
        </div>
        
        <div class="breakdown-item">
          <span class="item-name">过程分</span>
          <div class="pixel-progress">
            <div 
              class="pixel-progress-bar" 
              :class="getProgressClass(scoreData.breakdown.process.score / scoreData.breakdown.process.max)"
              :style="{ width: (scoreData.breakdown.process.score / scoreData.breakdown.process.max * 100) + '%' }"
            ></div>
          </div>
          <span class="item-score">{{ scoreData.breakdown.process.score }}/{{ scoreData.breakdown.process.max }}</span>
        </div>
        
        <div class="breakdown-item">
          <span class="item-name">法条分</span>
          <div class="pixel-progress">
            <div 
              class="pixel-progress-bar" 
              :class="getProgressClass(scoreData.breakdown.law.score / scoreData.breakdown.law.max)"
              :style="{ width: (scoreData.breakdown.law.score / scoreData.breakdown.law.max * 100) + '%' }"
            ></div>
          </div>
          <span class="item-score">{{ scoreData.breakdown.law.score }}/{{ scoreData.breakdown.law.max }}</span>
        </div>
        
        <div class="breakdown-item">
          <span class="item-name">分析分</span>
          <div class="pixel-progress">
            <div 
              class="pixel-progress-bar" 
              :class="getProgressClass(scoreData.breakdown.analysis.score / scoreData.breakdown.analysis.max)"
              :style="{ width: (scoreData.breakdown.analysis.score / scoreData.breakdown.analysis.max * 100) + '%' }"
            ></div>
          </div>
          <span class="item-score">{{ scoreData.breakdown.analysis.score }}/{{ scoreData.breakdown.analysis.max }}</span>
        </div>
      </div>
    </div>
    
    <!-- 评分细则 -->
    <div class="scoring-rules pixel-card">
      <h3>评分细则</h3>
      <div class="rules-content">
        <div class="rule-section">
          <h4>📊 结果分 ({{ scoreData.breakdown.result.max }}分)</h4>
          <ul>
            <li>判决结果正确：{{ scoreData.breakdown.result.max }}分</li>
            <li>判决结果错误：0分</li>
          </ul>
          <p class="rule-comment">{{ scoreData.breakdown.result.comment }}</p>
        </div>
        
        <div class="rule-section">
          <h4>🧠 过程分 ({{ scoreData.breakdown.process.max }}分)</h4>
          <ul>
            <li>根据法律问题回答正确率评分</li>
            <li>答对所有问题：{{ scoreData.breakdown.process.max }}分</li>
            <li>答对70%以上：{{ Math.round(scoreData.breakdown.process.max * 0.7) }}分以上</li>
            <li>答对50%-70%：{{ Math.round(scoreData.breakdown.process.max * 0.5) }}-{{ Math.round(scoreData.breakdown.process.max * 0.7) }}分</li>
            <li>答对不足50%：{{ Math.round(scoreData.breakdown.process.max * 0.5) }}分以下</li>
          </ul>
          <p class="rule-comment">{{ scoreData.breakdown.process.comment }}</p>
          <p class="rule-detail">本次答题：{{ scoreData.breakdown.process.details?.correctCount || 0 }}/{{ scoreData.breakdown.process.details?.totalQuestions || 0 }} 题正确，正确率 {{ scoreData.breakdown.process.details?.accuracy || '0%' }}</p>
        </div>
        
        <div class="rule-section">
          <h4>📜 法条分 ({{ scoreData.breakdown.law.max }}分)</h4>
          <ul>
            <li>引用所有正确法条：{{ scoreData.breakdown.law.max }}分</li>
            <li>引用部分正确法条：按匹配比例计分</li>
            <li>未引用法条：0分</li>
          </ul>
          <p class="rule-comment">{{ scoreData.breakdown.law.comment }}</p>
          <p v-if="scoreData.breakdown.law.details" class="rule-detail">
            正确法条：{{ scoreData.breakdown.law.details.correctLaws?.join('、') || '无' }}<br>
            你引用：{{ scoreData.breakdown.law.details.userLaws?.join('、') || '无' }}<br>
            匹配率：{{ scoreData.breakdown.law.details.matchRate || '0%' }}
          </p>
        </div>
        
        <div class="rule-section">
          <h4>💡 分析分 ({{ scoreData.breakdown.analysis.max }}分)</h4>
          <ul>
            <li>正确认定所有特殊情节：{{ scoreData.breakdown.analysis.max }}分</li>
            <li>认定部分正确：按匹配比例计分</li>
            <li>未认定或认定错误：0分</li>
          </ul>
          <p class="rule-comment">{{ scoreData.breakdown.analysis.comment }}</p>
        </div>
      </div>
    </div>
    
    <!-- 标准答案 -->
    <div class="standard-answer pixel-card">
      <h3>标准答案</h3>
      <div class="answer-content">
        <p><strong>判决结果:</strong> {{ scoreData.standardAnalysis.judgment }}</p>
        <p><strong>罪名认定:</strong> {{ scoreData.standardAnalysis.conviction }}</p>
        <p><strong>量刑:</strong> {{ scoreData.standardAnalysis.sentence }}</p>
        <div class="legal-basis">
          <strong>法律依据:</strong>
          <ul>
            <li v-for="(law, index) in scoreData.standardAnalysis.legal_basis" :key="index">
              {{ law }}
            </li>
          </ul>
        </div>
        <p class="reasoning"><strong>判决理由:</strong> {{ scoreData.standardAnalysis.reasoning }}</p>
      </div>
    </div>
    
    <!-- 判决对比 -->
    <div class="judgment-comparison pixel-card">
      <h3>判决对比</h3>
      <div class="comparison-grid">
        <div class="comparison-row">
          <span class="label">判决结果</span>
          <span class="user-value" :class="{ correct: caseStore.userJudgment?.guilty === scoreData.standardAnalysis.judgment }">
            {{ caseStore.userJudgment?.guilty || '未选择' }}
          </span>
          <span class="arrow">→</span>
          <span class="correct-value">{{ scoreData.standardAnalysis.judgment }}</span>
        </div>
        <div class="comparison-row">
          <span class="label">量刑</span>
          <span class="user-value" :class="{ correct: caseStore.userJudgment?.sentenceMonths && isSentenceApproximate(caseStore.userJudgment.sentenceMonths) }">
            {{ caseStore.userJudgment?.sentenceMonths ? caseStore.userJudgment.sentenceMonths + '个月' : '未选择' }}
          </span>
          <span class="arrow">→</span>
          <span class="correct-value">{{ scoreData.standardAnalysis.sentence }}</span>
        </div>
        <div class="comparison-row">
          <span class="label">特殊情节</span>
          <span class="user-value">{{ caseStore.userJudgment?.circumstances?.length || 0 }}项</span>
          <span class="arrow">→</span>
          <span class="correct-value">{{ getCorrectCircumstancesCount }}项</span>
        </div>
        <div class="comparison-row">
          <span class="label">引用法条</span>
          <span class="user-value">{{ caseStore.userJudgment?.laws?.length || 0 }}条</span>
          <span class="arrow">→</span>
          <span class="correct-value">{{ getCorrectLawsCount }}条</span>
        </div>
      </div>
    </div>
    
    <!-- 错误纠正 -->
    <div v-if="scoreData.corrections.length > 0" class="corrections-section">
      <h3>错误纠正</h3>
      <div class="corrections-list">
        <div 
          v-for="(correction, index) in scoreData.corrections" 
          :key="index"
          class="correction-card pixel-card"
        >
          <p v-if="correction.type === 'legal_issue'">
            <strong>问题:</strong> {{ correction.question }}
          </p>
          <p class="user-answer">
            <strong>你的答案:</strong> {{ correction.userAnswer }}
          </p>
          <p class="correct-answer">
            <strong>正确答案:</strong> {{ correction.correctAnswer }}
          </p>
          <p class="explanation">
            <strong>解析:</strong> {{ correction.explanation }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- 学习建议 -->
    <div v-if="scoreData.knowledgeReview.length > 0" class="knowledge-review">
      <h3>学习建议</h3>
      <div class="review-list">
        <div 
          v-for="(review, index) in scoreData.knowledgeReview" 
          :key="index"
          class="review-card pixel-card"
        >
          <h4>{{ review.topic }}</h4>
          <p>{{ review.suggestion }}</p>
          <p class="related-law"><strong>相关法条:</strong> {{ review.relatedLaw }}</p>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="actions">
      <router-link to="/cases" class="btn">返回案件列表</router-link>
      <button class="btn btn-outline" @click="restartCase">重新挑战</button>
      <router-link to="/progress" class="btn btn-secondary">查看进度</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'

const router = useRouter()
const caseStore = useCaseStore()

const scoreData = computed(() => {
  return caseStore.scoreResult || {
    score: 0,
    breakdown: {
      result: { score: 0, max: 40, comment: '' },
      process: { score: 0, max: 30, comment: '', details: {} },
      law: { score: 0, max: 20, comment: '', details: {} },
      analysis: { score: 0, max: 10, comment: '' }
    },
    standardAnalysis: {},
    corrections: [],
    knowledgeReview: []
  }
})

const getCorrectCircumstancesCount = computed(() => {
  if (!caseStore.currentCase?.judgment_options?.special_circumstances) return 0
  return caseStore.currentCase.judgment_options.special_circumstances.filter(c => c.correct).length
})

const getCorrectLawsCount = computed(() => {
  if (!scoreData.value.standardAnalysis?.legal_basis) return 0
  return scoreData.value.standardAnalysis.legal_basis.length
})

function getProgressClass(ratio) {
  if (ratio >= 0.8) return 'good'
  if (ratio >= 0.6) return 'medium'
  return 'bad'
}

function isSentenceApproximate(userMonths) {
  if (!scoreData.value.standardAnalysis?.sentence) return false
  const match = scoreData.value.standardAnalysis.sentence.match(/(\d+)个月?/)
  if (!match) return false
  const standardMonths = parseInt(match[1])
  return Math.abs(userMonths - standardMonths) <= 3
}

function restartCase() {
  caseStore.clearCase()
  router.push(`/case/${caseStore.currentCase.id}`)
}
</script>

<style lang="scss" scoped>
.score-result {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  
  h2 {
    margin-bottom: 32px;
    color: #2B3A67;
  }
}

.score-overview {
  margin-bottom: 32px;
}

.total-score {
  margin-bottom: 24px;
  
  .score-value {
    font-size: 72px;
    font-weight: bold;
    color: #C41E3A;
  }
  
  .score-unit {
    font-size: 24px;
    color: #666;
  }
}

.score-breakdown {
  max-width: 500px;
  margin: 0 auto;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  .item-name {
    width: 60px;
    text-align: left;
    font-weight: bold;
  }
  
  .pixel-progress {
    flex: 1;
  }
  
  .item-score {
    width: 60px;
    text-align: right;
    font-weight: bold;
  }
}

.scoring-rules {
  text-align: left;
  margin-bottom: 32px;
  
  h3 {
    margin-bottom: 16px;
    color: #2B3A67;
  }
  
  .rules-content {
    .rule-section {
      margin-bottom: 20px;
      
      h4 {
        margin-bottom: 8px;
        color: #2B3A67;
      }
      
      ul {
        padding-left: 24px;
        margin-bottom: 8px;
        
        li {
          margin-bottom: 4px;
          font-size: 14px;
          line-height: 1.6;
        }
      }
      
      .rule-comment {
        padding: 8px 12px;
        background: #e3f2fd;
        border-left: 4px solid #2196f3;
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .rule-detail {
        font-size: 12px;
        color: #666;
        padding: 4px 12px;
      }
    }
  }
}

.standard-answer {
  text-align: left;
  margin-bottom: 32px;
  
  h3 {
    margin-bottom: 16px;
    color: #2B3A67;
  }
  
  .answer-content {
    p {
      margin-bottom: 8px;
    }
    
    .legal-basis {
      margin: 12px 0;
      
      ul {
        padding-left: 24px;
        margin-top: 8px;
        
        li {
          margin-bottom: 4px;
          line-height: 1.6;
        }
      }
    }
    
    .reasoning {
      margin-top: 12px;
      padding: 12px;
      background: #fff;
      border-left: 4px solid #FFD700;
      line-height: 1.6;
    }
  }
}

.judgment-comparison {
  text-align: left;
  margin-bottom: 32px;
  
  h3 {
    margin-bottom: 16px;
    color: #2B3A67;
  }
  
  .comparison-grid {
    display: grid;
    grid-template-columns: 120px 1fr 30px 1fr;
    gap: 12px;
    align-items: center;
    
    .comparison-row {
      display: contents;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        font-weight: bold;
        color: #2B3A67;
      }
      
      .user-value {
        text-align: center;
        color: #C41E3A;
        
        &.correct {
          color: #4CAF50;
        }
      }
      
      .arrow {
        text-align: center;
        color: #999;
      }
      
      .correct-value {
        text-align: center;
        color: #4CAF50;
        font-weight: bold;
      }
    }
  }
}

.corrections-section,
.knowledge-review {
  margin-bottom: 32px;
  
  h3 {
    margin-bottom: 16px;
    color: #2B3A67;
  }
}

.corrections-list,
.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.correction-card {
  text-align: left;
  
  p {
    margin-bottom: 8px;
  }
  
  .user-answer {
    color: #C41E3A;
  }
  
  .correct-answer {
    color: #4CAF50;
  }
  
  .explanation {
    padding: 8px;
    background: #fff;
    margin-top: 8px;
  }
}

.review-card {
  text-align: left;
  
  h4 {
    margin-bottom: 8px;
    color: #2B3A67;
  }
  
  p {
    margin-bottom: 4px;
  }
  
  .related-law {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
</style>
