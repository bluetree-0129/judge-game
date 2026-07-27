<template>
  <div class="case-card" :class="statusClass">
    <div class="case-header">
      <h3 class="case-title">{{ caseData.title }}</h3>
      <span class="difficulty">
        <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= difficultyLevel }">★</span>
      </span>
    </div>
    
    <div class="case-body">
      <div class="case-meta">
        <span class="category">{{ caseData.category }}</span>
        <span class="status">{{ statusText }}</span>
      </div>
      
      <div class="case-tags">
        <span v-for="tag in caseData.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
      
      <div v-if="score" class="case-score">
        <span class="score-label">得分:</span>
        <span class="score-value">{{ score.score }}</span>
      </div>
    </div>
    
    <div class="case-footer">
      <button 
        v-if="status === 'not_started'" 
        class="btn"
        @click="$emit('start', caseData.id)"
      >
        开始审理
      </button>
      <button 
        v-else-if="status === 'in_progress'" 
        class="btn btn-outline"
        @click="$emit('continue', caseData.id)"
      >
        继续审理
      </button>
      <button 
        v-else 
        class="btn btn-outline"
        @click="$emit('restart', caseData.id)"
      >
        重新挑战
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { progressManager } from '@/engines/progressManager'

const props = defineProps({
  caseData: {
    type: Object,
    required: true
  }
})

defineEmits(['start', 'continue', 'restart'])

const status = computed(() => {
  return progressManager.getCaseStatus(props.caseData.id)
})

const statusClass = computed(() => {
  return `status-${status.value}`
})

const statusText = computed(() => {
  const texts = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'completed': '已完成'
  }
  return texts[status.value]
})

const difficultyLevel = computed(() => {
  const levels = { easy: 1, medium: 2, hard: 3 }
  return levels[props.caseData.difficulty] || 1
})

const score = computed(() => {
  return progressManager.getCaseScore(props.caseData.id)
})
</script>

<style lang="scss" scoped>
.case-card {
  border: 3px solid #2B3A67;
  background: #F5F0E1;
  padding: 20px;
  transition: all 0.2s;
  
  &.status-completed {
    border-color: #4CAF50;
  }
  
  &.status-in_progress {
    border-color: #FFD700;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.case-title {
  margin: 0;
  font-size: 18px;
  color: #2B3A67;
}

.difficulty {
  .star {
    color: #ccc;
    
    &.active {
      color: #FFD700;
    }
  }
}

.case-body {
  margin-bottom: 16px;
}

.case-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  
  .category {
    color: #C41E3A;
    font-weight: bold;
  }
  
  .status {
    color: #666;
  }
}

.case-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  .tag {
    background: #2B3A67;
    color: #F5F0E1;
    padding: 2px 8px;
    font-size: 12px;
  }
}

.case-score {
  margin-top: 8px;
  
  .score-value {
    color: #C41E3A;
    font-weight: bold;
    font-size: 20px;
  }
}

.case-footer {
  .btn {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }
}
</style>