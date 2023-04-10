<template>
  <div class="local-storage-effects-tool">
    <!-- title -->
    <a-divider orientation="left">永久快取</a-divider>
    <a-collapse
      v-model="activeNames"
      v-if="effects.length"
    >
      <a-collapse-panel
        v-for="(effect, index) in effects"
        :key="index"
        :header="effect && effect.name"
        :name="index"
      >
        <template #extra>
          <a-space>
            <!-- add to layer -->
            <a-popconfirm
              title="新增特效到當前選擇的圖層？"
              @confirm="$event => { confirmAddToLayerHandler(effect && effect.name) }"
              ok-text="是"
              cancel-text="否"
            >
              <a-button
                type="primary"
                size="small"
                @click="$event => $event.stopPropagation()"
              >Paste</a-button>
            </a-popconfirm>
            <!-- delete from list -->
            <a-popconfirm
              title="確定要刪除這個特效組？"
              @confirm="$event => { confirmDeleteHandler(effect && effect.name) }"
              ok-text="是"
              cancel-text="否"
            >
              <a-button
                danger
                size="small"
                @click="$event => $event.stopPropagation()"
              >Delete</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template #default>
          <a-descriptions
            size="small"
            v-for="setting in effect && effect.settings"
            :key="setting.matchName"
            :title="setting.name"
          >
            <a-descriptions-item
              v-for="item in setting.children"
              :key="item.matchName"
              :label="item.name"
              :style="{ display: item.name === 'Compositing Options' ? 'none' : 'block' }"
            >
              {{ item.value }}
            </a-descriptions-item>
          </a-descriptions>
        </template>
      </a-collapse-panel>
    </a-collapse>
    <a-empty
      :image="simpleEmptyImage"
      v-else
    />

    <a-alert
      v-if="alertString"
      :message="alertString"
      type="error"
      show-icon
      closable
      @close="$event => alertString = ''"
    />
  </div>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core'
import { setCurrentSelectedEffectsByString } from '@/scripts/EffectCollection'
import { ref, inject, computed } from 'vue'
import { Empty } from 'ant-design-vue';

const simpleEmptyImage = Empty.PRESENTED_IMAGE_SIMPLE;
const evalScript = inject('evalScript');
const effectList = useLocalStorage('effect-collection', {})
const alertString = ref('')
const activeNames = ref([])
const effectsNames = computed(() => {
  return Object.keys(effectList.value)
})
const effects = computed(() => {
  const effects = []
  // object entries
  Object.entries(effectList.value).forEach(([key, value]) => {
    effects.push({
      name: key,
      settings: value
    })
  })
  return effects
})

const confirmDeleteHandler = (effectName) => {
  if (effectList.value[effectName]) {
    delete effectList.value[effectName]
  }
}
const confirmAddToLayerHandler = (effectName) => {
  const effect = effectList.value[effectName]
  if (effect) {
    const effectString = JSON.stringify(effect); // array to string
    try {
      evalScript(setCurrentSelectedEffectsByString(effectString), (res) => {
        if (res.startsWith('Error')) {
          alertString.value = res;
          return
        }
      })
    } catch (error) {
      alertString.value = error
    }
  }
}
defineExpose({
  effectsNames
})
</script>

<style lang="scss">
.local-storage-effects-tool {
  padding-bottom: 16px;

  .ant-descriptions {
    margin-bottom: 4px;
  }

  .ant-descriptions-header {
    margin-bottom: 0;

    .ant-descriptions-title {
      font-size: 12px;
      line-height: 1.2;
    }
  }

  .ant-descriptions-item {
    padding: 0 !important;


    &-label {
      font-size: 12px;
      line-height: 1.2;
    }

    &-content {
      font-size: 12px;
      line-height: 1.2;
    }
  }
}
</style>