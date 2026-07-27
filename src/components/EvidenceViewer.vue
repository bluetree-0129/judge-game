<template>
  <div class="evidence-viewer">
    <div class="evidence-list">
      <div class="list-header">
        <h3>证据材料</h3>
        <span class="count">{{ evidences.length }} 份</span>
      </div>
      
      <div class="evidence-items">
        <div 
          v-for="(evidence, index) in evidences" 
          :key="evidence.id"
          class="evidence-item"
          :class="{ active: selectedId === evidence.id, viewed: viewedIds.includes(evidence.id) }"
          @click="selectEvidence(evidence.id)"
        >
          <span class="index">{{ index + 1 }}</span>
          <div class="item-info">
            <span class="type">{{ evidence.type }}</span>
            <span class="name">{{ evidence.name }}</span>
          </div>
          <span v-if="viewedIds.includes(evidence.id)" class="viewed-mark">✓</span>
        </div>
      </div>
    </div>
    
    <div class="evidence-detail" v-if="selectedEvidence">
      <div class="detail-header">
        <h4>{{ selectedEvidence.name }}</h4>
        <div class="meta">
          <span class="type">{{ selectedEvidence.type }}</span>
          <span class="source">来源: {{ selectedEvidence.source }}</span>
        </div>
      </div>
      
      <div class="detail-content">
        <p>{{ selectedEvidence.content }}</p>
      </div>
      
      <div v-if="selectedEvidence.highlights && selectedEvidence.highlights.length > 0" class="highlights">
        <h5>关键信息</h5>
        <div 
          v-for="highlight in selectedEvidence.highlights" 
          :key="highlight.text"
          class="highlight-item"
        >
          <span class="highlight-text">{{ highlight.text }}</span>
          <span class="highlight-analysis">{{ highlight.analysis }}</span>
        </div>
      </div>
      
      <div class="evidence-actions">
        <button class="btn btn-outline" @click="addToNotes">添加到笔记</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  evidences: {
    type: Array,
    required: true
  },
  caseEngine: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-notes'])

const selectedId = ref(null)
const viewedIds = ref([])

const selectedEvidence = computed(() => {
  if (!selectedId.value) return null
  return props.caseEngine.getEvidenceDetail(selectedId.value)
})

function selectEvidence(id) {
  selectedId.value = id
  if (!viewedIds.value.includes(id)) {
    viewedIds.value.push(id)
  }
}

function addToNotes() {
  if (selectedEvidence.value) {
    emit('add-to-notes', selectedEvidence.value)
  }
}

// 自动选择第一个证据
if (props.evidences.length > 0) {
  selectEvidence(props.evidences[0].id)
}
</script>

<style lang="scss" scoped>
.evidence-viewer {
  display: flex;
  gap: 20px;
  height: 100%;
  min-height: 400px;
}

.evidence-list {
  width: 280px;
  border: 3px solid #2B3A67;
  background: #F5F0E1;
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 2px solid #2B3A67;
    background: #2B3A67;
    color: #F5F0E1;
    
    h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .count {
      font-size: 12px;
      opacity: 0.8;
    }
  }
  
  .evidence-items {
    padding: 8px;
  }
  
  .evidence-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    border: 2px solid transparent;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: #FFD700;
    }
    
    &.active {
      border-color: #2B3A67;
      background: #e8e3d4;
    }
    
    &.viewed {
      opacity: 0.8;
    }
    
    .index {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2B3A67;
      color: #F5F0E1;
      font-size: 12px;
      margin-right: 12px;
    }
    
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .type {
        font-size: 12px;
        color: #C41E3A;
      }
      
      .name {
        font-size: 14px;
        color: #2B3A67;
      }
    }
    
    .viewed-mark {
      color: #4CAF50;
      font-size: 16px;
    }
  }
}

.evidence-detail {
  flex: 1;
  border: 3px solid #2B3A67;
  background: #F5F0E1;
  display: flex;
  flex-direction: column;
  
  .detail-header {
    padding: 16px;
    border-bottom: 2px solid #2B3A67;
    
    h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #2B3A67;
    }
    
    .meta {
      display: flex;
      gap: 16px;
      
      .type {
        color: #C41E3A;
        font-weight: bold;
      }
      
      .source {
        color: #666;
      }
    }
  }
  
  .detail-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    
    p {
      margin: 0;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }
  
  .highlights {
    padding: 16px;
    background: #fff;
    border-top: 2px solid #2B3A67;
    
    h5 {
      margin: 0 0 12px 0;
      color: #2B3A67;
    }
    
    .highlight-item {
      padding: 12px;
      margin-bottom: 8px;
      border-left: 4px solid #FFD700;
      background: #F5F0E1;
      
      .highlight-text {
        display: block;
        color: #2B3A67;
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .highlight-analysis {
        display: block;
        color: #666;
        font-size: 12px;
      }
    }
  }
  
  .evidence-actions {
    padding: 12px 16px;
    border-top: 2px solid #2B3A67;
    
    .btn {
      width: 100%;
      padding: 10px;
    }
  }
}

@media (max-width: 768px) {
  .evidence-viewer {
    flex-direction: column;
  }
  
  .evidence-list {
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>