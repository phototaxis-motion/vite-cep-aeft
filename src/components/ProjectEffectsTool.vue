<template>
  <div class="project-effects-tool">
    <a-divider orientation="left">專案快取</a-divider>
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
              @confirm="$event => { confirmAddToLayerHandler(effect.name) }"
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
    />
  </div>
</template>
<script setup>
// Rule: one layer one effect collection
import { ref, inject, watch, computed, onMounted } from 'vue'
import { getEffectsJsonByLayerName, scriptGetEffectStorageLayerNames, getScriptCopyEffectsByLayerName, getScriptDeleteLayerInEffectsStorageComp } from '@/scripts/EffectCollection'
import { Empty } from 'ant-design-vue';

const simpleEmptyImage = Empty.PRESENTED_IMAGE_SIMPLE;
const loading = ref(false)
const evalScript = inject('evalScript');
const activeNames = ref([]);
const compLayersNames = ref([]);
const alertString = ref('');
const effectList = ref({});
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

watch(compLayersNames, (nameList) => {
  if (nameList.length === 0) {
    alertString.value = '目前沒有特效組'
  } else {
    for (let i = 0; i < nameList.length; i++) {
      const name = nameList[i];
      evalScript(getEffectsJsonByLayerName(name), (result) => {
        effectList.value[name] = JSON.parse(result);
      })
    }
  }

})
onMounted(() => {
  evalScript(scriptGetEffectStorageLayerNames, (result) => {
    compLayersNames.value = JSON.parse(result);
  })
})
const confirmAddToLayerHandler = (name) => {
  const script = getScriptCopyEffectsByLayerName(name);
  loading.value = true;
  evalScript(script, (result) => {
    loading.value = false;
    if (result.startsWith('Error')) {
      alertString.value = result;
    }
  })
}
const confirmDeleteHandler = (name) => {
  // getScriptDeleteLayerInEffectsStorageComp
  const script = getScriptDeleteLayerInEffectsStorageComp(name);
  loading.value = true;
  evalScript(script, (result) => {
    loading.value = false;
    if (result.startsWith('Error')) {
      alertString.value = result;
    } else {
      // delete from list
      delete effectList.value[name];
      // delete from compLayersNames
      const index = compLayersNames.value.indexOf(name);
      if (index > -1) {
        compLayersNames.value.splice(index, 1);
      }
    }
  })
}

defineExpose({
  effectsNames: compLayersNames
})
// TODO : 按鈕 跟 Refresh
</script>
<style lang="scss">
.project-effects-tool {
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