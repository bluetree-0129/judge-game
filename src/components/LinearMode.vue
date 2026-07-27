<template>
  <div class="linear-mode">
    <!-- 步骤导航 -->
    <div class="step-nav">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="step-item"
        :class="{ active: currentStep === index, completed: currentStep > index }"
      >
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-name">{{ step.name }}</span>
      </div>
    </div>
    
    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 案件概览 -->
      <div v-if="currentStep === 0" class="step-panel animate-fade-in">
        <h2>案件概览</h2>
        <div class="overview-content">
          <h3>{{ caseStore.currentCase.title }}</h3>
          <p class="summary">{{ caseStore.currentCase.background.summary }}</p>
          <div class="meta">
            <p><strong>案发时间:</strong> {{ caseStore.currentCase.background.occurrence_date }}</p>
            <p><strong>案发地点:</strong> {{ caseStore.currentCase.background.location }}</p>
          </div>
        </div>
        <button class="btn" @click="nextStep">开始阅读案情</button>
      </div>
      
      <!-- 阅读案情 -->
      <div v-else-if="currentStep === 1" class="step-panel animate-fade-in">
        <h2>阅读案情</h2>
        <div class="parties-info">
          <div class="party-card pixel-card">
            <h4>被告人</h4>
            <p><strong>姓名:</strong> {{ caseStore.currentCase.parties.defendant.name }}</p>
            <p><strong>年龄:</strong> {{ caseStore.currentCase.parties.defendant.age }}岁</p>
            <p><strong>职业:</strong> {{ caseStore.currentCase.parties.defendant.occupation }}</p>
            <p><strong>前科:</strong> {{ caseStore.currentCase.parties.defendant.criminal_record }}</p>
          </div>
          <div class="party-card pixel-card">
            <h4>被害人</h4>
            <p><strong>姓名:</strong> {{ caseStore.currentCase.parties.victim.name }}</p>
            <p><strong>年龄:</strong> {{ caseStore.currentCase.parties.victim.age }}岁</p>
            <p><strong>职业:</strong> {{ caseStore.currentCase.parties.victim.occupation }}</p>
          </div>
        </div>
        <button class="btn" @click="nextStep">查看证据</button>
      </div>
      
      <!-- 证据分析 -->
      <div v-else-if="currentStep === 2" class="step-panel animate-fade-in">
        <h2>证据分析</h2>
        <EvidenceViewer 
          :evidences="caseStore.evidenceList" 
          :case-engine="caseStore.caseEngine"
        />
        <button class="btn" @click="nextStep">回答法律问题</button>
      </div>
      
      <!-- 法律问题 -->
      <div v-else-if="currentStep === 3" class="step-panel animate-fade-in">
        <h2>法律问题</h2>
        <div class="questions">
          <div 
            v-for="(question, qIndex) in caseStore.legalQuestions" 
            :key="question.id"
            class="question-item"
          >
            <h4>问题 {{ qIndex + 1 }}: {{ question.question }}</h4>
            <div class="options">
              <div 
                v-for="option in question.options" 
                :key="option.id"
                class="pixel-option"
                :class="{ 
                  selected: answers[question.id] === option.id,
                  correct: showAnswers && isCorrect(question.id, option.id),
                  wrong: showAnswers && answers[question.id] === option.id && !isCorrect(question.id, option.id)
                }"
                @click="selectAnswer(question.id, option.id)"
              >
                {{ option.text }}
              </div>
            </div>
            <div v-if="feedbacks[question.id]" class="feedback" :class="{ correct: feedbacks[question.id].isCorrect }">
              {{ feedbacks[question.id].hint }}
            </div>
          </div>
        </div>
        <button class="btn" @click="nextStep" :disabled="!allQuestionsAnswered">查阅法条</button>
      </div>
      
      <!-- 查阅法条 -->
      <div v-else-if="currentStep === 4" class="step-panel animate-fade-in">
        <h2>查阅法条</h2>
        <div class="laws-section">
          <div v-for="law in relatedLaws" :key="law.id" class="law-card pixel-card">
            <h4>{{ law.number }} {{ law.title }}</h4>
            <p>{{ law.content }}</p>
          </div>
        </div>
        <button class="btn" @click="nextStep">做出判决</button>
      </div>
      
      <!-- 做出判决 -->
      <div v-else-if="currentStep === 5" class="step-panel animate-fade-in">
        <h2>做出判决</h2>
        <div class="judgment-form">
          <div class="form-group">
            <label>判决结果:</label>
            <div class="options">
              <div 
                v-for="option in judgmentOptions.guilty_options" 
                :key="option"
                class="pixel-option"
                :class="{ selected: judgment.guilty === option }"
                @click="judgment.guilty = option"
              >
                {{ option }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>量刑 (月):</label>
            <input 
              v-model.number="judgment.sentenceMonths" 
              type="number" 
              class="pixel-input"
              :min="judgmentOptions.sentencing_range.min_months"
              :max="judgmentOptions.sentencing_range.max_months"
            />
            <span class="range-hint">
              范围: {{ judgmentOptions.sentencing_range.min_months }} - {{ judgmentOptions.sentencing_range.max_months }} 个月
            </span>
          </div>
          
          <div class="form-group">
            <label>特殊情节:</label>
            <div class="checkboxes">
              <label 
                v-for="circumstance in judgmentOptions.special_circumstances" 
                :key="circumstance.id"
                class="pixel-checkbox"
              >
                <input 
                  type="checkbox" 
                  :value="circumstance.id"
                  v-model="judgment.circumstances"
                />
                {{ circumstance.name }} ({{ circumstance.effect }})
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>引用法条:</label>
            <div class="law-selection">
              <label 
                v-for="law in relatedLaws" 
                :key="law.id"
                class="pixel-checkbox"
              >
                <input 
                  type="checkbox" 
                  :value="law.number"
                  v-model="judgment.laws"
                />
                {{ law.number }} {{ law.title }}
              </label>
            </div>
          </div>
        </div>
        <button class="btn btn-accent" @click="submitJudgment">提交判决</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCaseStore } from '@/stores/caseStore'
import { ScoreEngine } from '@/engines/scoreEngine'
import EvidenceViewer from './EvidenceViewer.vue'

const caseStore = useCaseStore()

const steps = [
  { id: 'overview', name: '案件概览' },
  { id: 'background', name: '阅读案情' },
  { id: 'evidence', name: '证据分析' },
  { id: 'questions', name: '法律问题' },
  { id: 'laws', name: '查阅法条' },
  { id: 'judgment', name: '做出判决' }
]

const currentStep = ref(0)
const answers = ref({})
const feedbacks = ref({})
const showAnswers = ref(false)

const judgment = ref({
  guilty: '',
  sentenceMonths: caseStore.judgmentOptions?.sentencing_range?.default_months || 12,
  circumstances: [],
  laws: []
})

const judgmentOptions = computed(() => {
  return caseStore.judgmentOptions || {}
})

const relatedLaws = computed(() => {
  // 从法条数据中获取相关法条
  // 简化实现，返回所有法条
  return [
    {
      id: 'art_264',
      number: '第二百六十四条',
      title: '盗窃罪',
      content: '盗窃公私财物，数额较大的，或者多次盗窃、入户盗窃、携带凶器盗窃、扒窃的，处三年以下有期徒刑、拘役或者管制，并处或者单处罚金；数额巨大或者有其他严重情节的，处三年以上十年以下有期徒刑，并处罚金；数额特别巨大或者有其他特别严重情节的，处十年以上有期徒刑或者无期徒刑，并处罚金或者没收财产。'
    },
    {
      id: 'art_67',
      number: '第六十七条',
      title: '自首与坦白',
      content: '犯罪以后自动投案，如实供述自己的罪行的，是自首。对于自首的犯罪分子，可以从轻或者减轻处罚。其中，犯罪较轻的，可以免除处罚。'
    }
  ]
})

const allQuestionsAnswered = computed(() => {
  return caseStore.legalQuestions.every(q => answers.value[q.id])
})

function nextStep() {
  currentStep.value++
}

function selectAnswer(questionId, optionId) {
  if (showAnswers.value) return
  
  answers.value[questionId] = optionId
  const result = caseStore.submitAnswer(questionId, optionId)
  
  if (result) {
    feedbacks.value[questionId] = {
      isCorrect: result.isCorrect,
      hint: result.hint
    }
  }
}

function isCorrect(questionId, optionId) {
  const question = caseStore.legalQuestions.find(q => q.id === questionId)
  if (!question) return false
  const option = question.options.find(o => o.id === optionId)
  return option?.correct || false
}

function submitJudgment() {
  caseStore.submitJudgment(judgment.value)
  
  // 计算评分
  const scoreEngine = new ScoreEngine(
    caseStore.currentCase,
    caseStore.userAnswers,
    caseStore.userJudgment
  )
  
  const feedback = scoreEngine.generateFeedback()
  caseStore.submitScore(feedback)
}
</script>

<style lang="scss" scoped>
.step-nav {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid #ccc;
  background: #fff;
  opacity: 0.6;
  
  &.active {
    border-color: #2B3A67;
    background: #2B3A67;
    color: #F5F0E1;
    opacity: 1;
  }
  
  &.completed {
    border-color: #4CAF50;
    opacity: 1;
  }
  
  .step-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.2);
    font-size: 12px;
  }
}

.step-panel {
  max-width: 800px;
  margin: 0 auto;
}

.overview-content {
  margin-bottom: 24px;
  
  h3 {
    margin-bottom: 16px;
    color: #2B3A67;
  }
  
  .summary {
    line-height: 1.8;
    margin-bottom: 16px;
  }
  
  .meta {
    p {
      margin-bottom: 4px;
    }
  }
}

.parties-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.party-card {
  h4 {
    margin-bottom: 12px;
    color: #2B3A67;
  }
  
  p {
    margin-bottom: 4px;
  }
}

.question-item {
  margin-bottom: 32px;
  
  h4 {
    margin-bottom: 16px;
    color: #2B3A67;
  }
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feedback {
  margin-top: 12px;
  padding: 12px;
  border-left: 4px solid #C41E3A;
  background: #ffebee;
  
  &.correct {
    border-left-color: #4CAF50;
    background: #e8f5e9;
  }
}

.laws-section {
  margin-bottom: 24px;
}

.law-card {
  margin-bottom: 16px;
  
  h4 {
    margin-bottom: 8px;
    color: #2B3A67;
  }
  
  p {
    line-height: 1.6;
  }
}

.judgment-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 12px;
    color: #2B3A67;
  }
  
  .range-hint {
    display: block;
    margin-top: 4px;
    color: #666;
    font-size: 12px;
  }
}

.checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.law-selection {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>