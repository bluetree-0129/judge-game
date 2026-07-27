<template>
  <div class="case-list-page">
    <nav class="pixel-nav">
      <div class="nav-brand">⚖️ 法官审理案件模拟系统</div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/cases">案件列表</router-link>
        <router-link to="/progress">学习进度</router-link>
      </div>
    </nav>
    
    <div class="page-container">
      <h1 class="page-title">案件列表</h1>
      
      <div class="filters">
        <div class="filter-group">
          <label>难度筛选:</label>
          <select v-model="filterDifficulty" class="pixel-input">
            <option value="">全部</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>类型筛选:</label>
          <select v-model="filterCategory" class="pixel-input">
            <option value="">全部</option>
            <option value="刑法">刑法</option>
            <option value="民法">民法</option>
            <option value="行政法">行政法</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>状态筛选:</label>
          <select v-model="filterStatus" class="pixel-input">
            <option value="">全部</option>
            <option value="not_started">未开始</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>
      
      <div class="cases-grid">
        <CaseCard
          v-for="caseItem in filteredCases"
          :key="caseItem.id"
          :case-data="caseItem"
          @start="handleStart"
          @continue="handleContinue"
          @restart="handleRestart"
        />
      </div>
      
      <div v-if="filteredCases.length === 0" class="empty-state">
        <p>没有找到符合条件的案件</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { cases } from '@/data/cases'
import { progressManager } from '@/engines/progressManager'
import CaseCard from '@/components/CaseCard.vue'

const router = useRouter()

const filterDifficulty = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

const filteredCases = computed(() => {
  return cases.filter(caseItem => {
    if (filterDifficulty.value && caseItem.difficulty !== filterDifficulty.value) {
      return false
    }
    if (filterCategory.value && caseItem.category !== filterCategory.value) {
      return false
    }
    if (filterStatus.value) {
      const status = progressManager.getCaseStatus(caseItem.id)
      if (status !== filterStatus.value) {
        return false
      }
    }
    return true
  })
})

function handleStart(caseId) {
  router.push(`/case/${caseId}`)
}

function handleContinue(caseId) {
  router.push(`/case/${caseId}/play`)
}

function handleRestart(caseId) {
  router.push(`/case/${caseId}`)
}
</script>

<style lang="scss" scoped>
.filters {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  
  label {
    font-weight: bold;
    white-space: nowrap;
  }
  
  select {
    min-width: 120px;
  }
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: #666;
}
</style>