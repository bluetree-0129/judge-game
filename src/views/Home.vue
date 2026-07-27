<template>
  <div class="home-page">
    <nav class="pixel-nav">
      <div class="nav-brand">⚖️ 法官审理案件模拟系统</div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/cases">案件列表</router-link>
        <router-link to="/progress">学习进度</router-link>
      </div>
    </nav>
    
    <div class="page-container">
      <div class="hero-section animate-fade-in">
        <h1 class="page-title">欢迎来到法官审理案件模拟系统</h1>
        <p class="subtitle">通过真实案例学习法律，提升司法实务能力</p>
        
        <div class="features">
          <div class="feature-card pixel-card">
            <div class="feature-icon">📋</div>
            <h3>真实案例</h3>
            <p>基于真实案件改编，确保法律准确性</p>
          </div>
          <div class="feature-card pixel-card">
            <div class="feature-icon">🎯</div>
            <h3>模拟判决</h3>
            <p>扮演法官，体验完整的审理流程</p>
          </div>
          <div class="feature-card pixel-card">
            <div class="feature-icon">📊</div>
            <h3>智能评分</h3>
            <p>多维度评估，精准定位薄弱环节</p>
          </div>
        </div>
        
        <div class="cta-section">
          <router-link to="/cases" class="btn btn-lg">开始学习</router-link>
        </div>
      </div>
      
      <div v-if="recentCases.length > 0" class="recent-section animate-fade-in">
        <h2>最近学习</h2>
        <div class="recent-cases">
          <div v-for="caseItem in recentCases" :key="caseItem.id" class="recent-case pixel-card">
            <span class="case-name">{{ caseItem.title }}</span>
            <span class="case-score" :class="{ 'high': caseItem.score >= 80, 'medium': caseItem.score >= 60, 'low': caseItem.score < 60 }">
              {{ caseItem.score }}分
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { progressManager } from '@/engines/progressManager'
import { getCaseById } from '@/data/cases'

const recentCases = ref([])

onMounted(() => {
  // 加载最近完成的案件
  const scores = progressManager.progress.scores
  const recentIds = Object.keys(scores).slice(-3)
  
  recentCases.value = recentIds.map(id => {
    const caseData = getCaseById(id)
    return {
      id,
      title: caseData ? caseData.title : '未知案件',
      score: scores[id].score
    }
  })
})
</script>

<style lang="scss" scoped>
.hero-section {
  text-align: center;
  padding: 40px 0;
  
  .subtitle {
    font-size: 16px;
    color: #666;
    margin-bottom: 40px;
  }
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  
  .feature-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  h3 {
    margin-bottom: 8px;
    color: $primary-color;
  }
  
  p {
    color: #666;
    font-size: 14px;
  }
}

.cta-section {
  margin-top: 40px;
  
  .btn-lg {
    padding: 16px 48px;
    font-size: 18px;
  }
}

.recent-section {
  margin-top: 48px;
  
  h2 {
    margin-bottom: 24px;
    color: $primary-color;
  }
}

.recent-cases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.recent-case {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  
  .case-name {
    font-weight: bold;
  }
  
  .case-score {
    font-size: 20px;
    font-weight: bold;
    
    &.high { color: #4CAF50; }
    &.medium { color: $secondary-color; }
    &.low { color: $accent-color; }
  }
}
</style>