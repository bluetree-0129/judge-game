<template>
  <div class="free-mode">
    <div class="workspace">
      <!-- 左侧标签栏 -->
      <div class="sidebar">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
        </div>
      </div>
      
      <!-- 中间内容区 -->
      <div class="content-area">
        <!-- 案情 -->
        <div v-if="activeTab === 'background'" class="tab-content animate-fade-in">
          <h3>案件背景</h3>
          <p class="summary">{{ caseStore.currentCase.background.summary }}</p>
          <div class="meta">
            <p><strong>案发时间:</strong> {{ caseStore.currentCase.background.occurrence_date }}</p>
            <p><strong>案发地点:</strong> {{ caseStore.currentCase.background.location }}</p>
          </div>
          
          <h4>当事人信息</h4>
          <div class="parties">
            <div class="party-card pixel-card">
              <h5>被告人</h5>
              <p><strong>姓名:</strong> {{ caseStore.currentCase.parties.defendant.name }}</p>
              <p><strong>年龄:</strong> {{ caseStore.currentCase.parties.defendant.age }}岁</p>
              <p><strong>职业:</strong> {{ caseStore.currentCase.parties.defendant.occupation }}</p>
            </div>
            <div class="party-card pixel-card">
              <h5>被害人</h5>
              <p><strong>姓名:</strong> {{ caseStore.currentCase.parties.victim.name }}</p>
              <p><strong>年龄:</strong> {{ caseStore.currentCase.parties.victim.age }}岁</p>
              <p><strong>职业:</strong> {{ caseStore.currentCase.parties.victim.occupation }}</p>
            </div>
          </div>
        </div>
        
        <!-- 证据 -->
        <div v-else-if="activeTab === 'evidence'" class="tab-content animate-fade-in">
          <EvidenceViewer 
            :evidences="caseStore.evidenceList" 
            :case-engine="caseStore.caseEngine"
            @add-to-notes="addToNotes"
          />
        </div>
        
        <!-- 法条 -->
        <div v-else-if="activeTab === 'laws'" class="tab-content animate-fade-in">
          <h3>相关法律</h3>
          <div class="laws-list">
            <div v-for="law in laws" :key="law.id" class="law-card pixel-card">
              <h4>{{ law.number }} {{ law.title }}</h4>
              <p>{{ law.content }}</p>
            </div>
          </div>
        </div>
        
        <!-- 判决 -->
        <div v-else-if="activeTab === 'judgment'" class="tab-content animate-fade-in">
          <h3>做出判决</h3>
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
                  v-for="law in laws" 
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
            
            <button class="btn btn-accent" @click="submitJudgment">提交判决</button>
          </div>
        </div>
      </div>
      
      <!-- 右侧笔记区 -->
      <div class="notes-area">
        <h4>个人笔记</h4>
        <textarea 
          v-model="notes" 
          class="pixel-input notes-input"
          placeholder="在这里记录你的分析思路..."
        ></textarea>
        <div v-if="notesList.length > 0" class="notes-list">
          <div v-for="(note, index) in notesList" :key="index" class="note-item">
            {{ note }}
          </div>
        </div>
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

const tabs = [
  { id: 'background', name: '案情', icon: '📋' },
  { id: 'evidence', name: '证据', icon: '🔍' },
  { id: 'laws', name: '法条', icon: '⚖️' },
  { id: 'judgment', name: '判决', icon: '📝' }
]

const activeTab = ref('background')
const notes = ref('')
const notesList = ref([])

const judgment = ref({
  guilty: '',
  sentenceMonths: caseStore.judgmentOptions?.sentencing_range?.default_months || 12,
  circumstances: [],
  laws: []
})

const judgmentOptions = computed(() => {
  return caseStore.judgmentOptions || {}
})

const laws = computed(() => {
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

function addToNotes(evidence) {
  const note = `[${evidence.type}] ${evidence.name}: ${evidence.content.substring(0, 50)}...`
  notesList.value.push(note)
}

function submitJudgment() {
  caseStore.submitJudgment(judgment.value)
  
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
.workspace {
  display: grid;
  grid-template-columns: 120px 1fr 250px;
  gap: 16px;
  min-height: 600px;
}

.sidebar {
  border: 3px solid #2B3A67;
  background: #2B3A67;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  color: #F5F0E1;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid rgba(255,255,255,0.1);
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }
  
  &.active {
    background: #FFD700;
    color: #2B3A67;
  }
  
  .tab-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }
  
  .tab-name {
    font-size: 12px;
  }
}

.content-area {
  border: 3px solid #2B3A67;
  background: #F5F0E1;
  padding: 24px;
  overflow-y: auto;
}

.tab-content {
  h3 {
    margin-bottom: 16px;
    color: #2B3A67;
  }
  
  .summary {
    line-height: 1.8;
    margin-bottom: 16px;
  }
  
  .meta {
    margin-bottom: 24px;
    
    p {
      margin-bottom: 4px;
    }
  }
}

.parties {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.party-card {
  h5 {
    margin-bottom: 8px;
    color: #2B3A67;
  }
  
  p {
    margin-bottom: 4px;
  }
}

.laws-list {
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
}

.judgment-form {
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
  
  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
}

.notes-area {
  border: 3px solid #2B3A67;
  background: #F5F0E1;
  padding: 16px;
  
  h4 {
    margin-bottom: 12px;
    color: #2B3A67;
  }
  
  .notes-input {
    width: 100%;
    height: 200px;
    resize: vertical;
    margin-bottom: 16px;
  }
  
  .notes-list {
    .note-item {
      padding: 8px;
      margin-bottom: 8px;
      background: #fff;
      border: 2px solid #2B3A67;
      font-size: 12px;
    }
  }
}

@media (max-width: 768px) {
  .workspace {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .tab-item {
    flex-direction: row;
    gap: 8px;
    white-space: nowrap;
  }
  
  .notes-area {
    order: -1;
  }
}
</style>