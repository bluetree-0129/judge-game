<template>
  <div class="case-play-page">
    <nav class="pixel-nav">
      <div class="nav-brand">⚖️ 法官审理案件模拟系统</div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/cases">案件列表</router-link>
        <router-link to="/progress">学习进度</router-link>
      </div>
    </nav>
    
    <div class="page-container">
      <div v-if="!caseStore.isCaseLoaded" class="error-state">
        <p>案件未加载</p>
        <router-link :to="`/case/${id}`" class="btn">返回案件详情</router-link>
      </div>
      
      <div v-else class="game-content">
        <!-- 评分结果（优先于游戏模式） -->
        <template v-if="caseStore.scoreResult">
          <ScoreResult />
        </template>
        
        <!-- 线性模式 -->
        <template v-else-if="caseStore.gameMode === 'linear'">
          <LinearMode :case-id="id" />
        </template>
        
        <!-- 自由探索模式 -->
        <template v-else-if="caseStore.gameMode === 'free'">
          <FreeMode :case-id="id" />
        </template>
        
        <div v-else class="error-state">
          <p>未选择游戏模式</p>
          <router-link :to="`/case/${id}`" class="btn">选择模式</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCaseStore } from '@/stores/caseStore'
import LinearMode from '@/components/LinearMode.vue'
import FreeMode from '@/components/FreeMode.vue'
import ScoreResult from '@/components/ScoreResult.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const caseStore = useCaseStore()

onMounted(() => {
  if (!caseStore.isCaseLoaded) {
    caseStore.loadCase(props.id)
  }
})
</script>

<style lang="scss" scoped>
.game-content {
  min-height: 600px;
}

.error-state {
  text-align: center;
  padding: 48px;
}
</style>