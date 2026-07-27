<template>
  <div class="case-detail-page">
    <nav class="pixel-nav">
      <div class="nav-brand">⚖️ 法官审理案件模拟系统</div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/cases">案件列表</router-link>
        <router-link to="/progress">学习进度</router-link>
      </div>
    </nav>
    
    <div class="page-container">
      <div v-if="caseData" class="case-content">
        <div class="case-header-section">
          <h1 class="page-title">{{ caseData.title }}</h1>
          <div class="case-meta">
            <span class="difficulty">
              难度: 
              <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= difficultyLevel }">★</span>
            </span>
            <span class="category">类型: {{ caseData.category }}</span>
          </div>
        </div>
        
        <div class="case-info pixel-card">
          <h3>案件背景</h3>
          <p>{{ caseData.background.summary }}</p>
          
          <div class="parties">
            <div class="party">
              <h4>被告人</h4>
              <p>姓名: {{ caseData.parties.defendant.name }}</p>
              <p>年龄: {{ caseData.parties.defendant.age }}岁</p>
              <p>职业: {{ caseData.parties.defendant.occupation }}</p>
            </div>
            <div class="party">
              <h4>被害人</h4>
              <p>姓名: {{ caseData.parties.victim.name }}</p>
              <p>年龄: {{ caseData.parties.victim.age }}岁</p>
              <p>职业: {{ caseData.parties.victim.occupation }}</p>
            </div>
          </div>
        </div>
        
        <div class="mode-selection">
          <h3>选择游戏模式</h3>
          <div class="mode-cards">
            <div class="mode-card pixel-card" @click="selectMode('linear')">
              <div class="mode-icon">📋</div>
              <h4>线性引导模式</h4>
              <p>适合初学者，逐步引导完成案件分析</p>
              <ul>
                <li>逐步阅读案情</li>
                <li>逐一分析证据</li>
                <li>回答法律问题</li>
                <li>做出最终判决</li>
              </ul>
            </div>
            
            <div class="mode-card pixel-card" @click="selectMode('free')">
              <div class="mode-icon">🔍</div>
              <h4>自由探索模式</h4>
              <p>适合有基础的玩家，自由浏览材料</p>
              <ul>
                <li>自由浏览证据</li>
                <li>自主分析案情</li>
                <li>查阅相关法律</li>
                <li>自主做出判决</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="error-state">
        <p>案件不存在</p>
        <router-link to="/cases" class="btn">返回案件列表</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCaseById } from '@/data/cases'
import { useCaseStore } from '@/stores/caseStore'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const caseStore = useCaseStore()

const caseData = computed(() => {
  return getCaseById(props.id)
})

const difficultyLevel = computed(() => {
  const levels = { easy: 1, medium: 2, hard: 3 }
  return levels[caseData.value?.difficulty] || 1
})

function selectMode(mode) {
  caseStore.loadCase(props.id)
  caseStore.setGameMode(mode)
  router.push(`/case/${props.id}/play`)
}
</script>

<style lang="scss" scoped>
.case-header-section {
  text-align: center;
  margin-bottom: 32px;
}

.case-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  
  .difficulty {
    .star {
      color: #ccc;
      
      &.active {
        color: $secondary-color;
      }
    }
  }
  
  .category {
    color: $accent-color;
  }
}

.case-info {
  margin-bottom: 32px;
  
  h3 {
    margin-bottom: 16px;
    color: $primary-color;
  }
  
  p {
    margin-bottom: 16px;
    line-height: 1.8;
  }
}

.parties {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.party {
  border: $pixel-border-thin;
  padding: 16px;
  background: #fff;
  
  h4 {
    margin-bottom: 12px;
    color: $primary-color;
  }
  
  p {
    margin-bottom: 4px;
  }
}

.mode-selection {
  h3 {
    text-align: center;
    margin-bottom: 24px;
    color: $primary-color;
  }
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.mode-card {
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    transform: scale(1.02);
    border-color: $secondary-color;
  }
  
  .mode-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  h4 {
    margin-bottom: 12px;
    color: $primary-color;
  }
  
  p {
    color: #666;
    margin-bottom: 16px;
  }
  
  ul {
    text-align: left;
    padding-left: 24px;
    
    li {
      margin-bottom: 4px;
      color: #666;
    }
  }
}

.error-state {
  text-align: center;
  padding: 48px;
}
</style>