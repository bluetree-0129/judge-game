<template>
  <div class="progress-page">
    <nav class="pixel-nav">
      <div class="nav-brand">⚖️ 法官审理案件模拟系统</div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/cases">案件列表</router-link>
        <router-link to="/progress">学习进度</router-link>
      </div>
    </nav>
    
    <div class="page-container">
      <h1 class="page-title">学习进度</h1>
      
      <div class="stats-overview">
        <div class="stat-card pixel-card">
          <h3>已完成案件</h3>
          <p class="stat-value">{{ stats.completedCases }}</p>
        </div>
        <div class="stat-card pixel-card">
          <h3>平均分数</h3>
          <p class="stat-value">{{ stats.averageScore }}</p>
        </div>
        <div class="stat-card pixel-card">
          <h3>总学习时长</h3>
          <p class="stat-value">{{ formatTime(stats.totalTime) }}</p>
        </div>
      </div>
      
      <div class="weak-areas-section" v-if="weakAreas.length > 0">
        <h2>薄弱环节</h2>
        <div class="weak-areas">
          <div v-for="area in weakAreas" :key="area.name" class="weak-area pixel-card">
            <span class="area-name">{{ area.name }}</span>
            <div class="area-score">
              <span class="score-label">平均得分:</span>
              <span class="score-value">{{ area.avgScore }}分</span>
            </div>
            <span class="practiced">练习次数: {{ area.practiced }}</span>
          </div>
        </div>
      </div>
      
      <div class="completed-cases-section" v-if="completedCases.length > 0">
        <h2>已完成案件</h2>
        <div class="completed-cases">
          <div v-for="caseItem in completedCases" :key="caseItem.id" class="completed-case pixel-card">
            <div class="case-info">
              <span class="case-name">{{ caseItem.title }}</span>
              <span class="case-date">{{ formatDate(caseItem.completedAt) }}</span>
            </div>
            <div class="case-score" :class="{ 'high': caseItem.score >= 80, 'medium': caseItem.score >= 60, 'low': caseItem.score < 60 }">
              {{ caseItem.score }}分
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="completedCases.length === 0" class="empty-state">
        <p>还没有完成任何案件，快去开始你的第一个案件吧！</p>
        <router-link to="/cases" class="btn">去案件列表</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { progressManager } from '@/engines/progressManager'
import { getCaseById } from '@/data/cases'

const stats = ref({
  completedCases: 0,
  averageScore: 0,
  totalTime: 0
})

const weakAreas = ref([])
const completedCases = ref([])

onMounted(() => {
  stats.value = progressManager.getOverallStats()
  weakAreas.value = progressManager.getWeakAreas()
  
  // 加载已完成案件详情
  const scores = progressManager.progress.scores
  completedCases.value = Object.entries(scores).map(([id, data]) => {
    const caseData = getCaseById(id)
    return {
      id,
      title: caseData ? caseData.title : '未知案件',
      score: data.score,
      completedAt: data.completedAt
    }
  }).reverse()
})

function formatTime(ms) {
  if (!ms) return '0分钟'
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  }
  return `${minutes}分钟`
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.stat-card {
  text-align: center;
  padding: 24px;
  
  h3 {
    margin-bottom: 16px;
    color: $primary-color;
  }
  
  .stat-value {
    font-size: 36px;
    font-weight: bold;
    color: $accent-color;
  }
}

.weak-areas-section,
.completed-cases-section {
  margin-bottom: 48px;
  
  h2 {
    margin-bottom: 24px;
    color: $primary-color;
  }
}

.weak-areas,
.completed-cases {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.weak-area {
  padding: 16px;
  
  .area-name {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .area-score {
    margin-bottom: 4px;
    
    .score-value {
      color: $accent-color;
      font-weight: bold;
    }
  }
  
  .practiced {
    color: #666;
    font-size: 12px;
  }
}

.completed-case {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  
  .case-info {
    display: flex;
    flex-direction: column;
    
    .case-name {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .case-date {
      color: #666;
      font-size: 12px;
    }
  }
  
  .case-score {
    font-size: 24px;
    font-weight: bold;
    
    &.high { color: #4CAF50; }
    &.medium { color: $secondary-color; }
    &.low { color: $accent-color; }
  }
}

.empty-state {
  text-align: center;
  padding: 48px;
}
</style>