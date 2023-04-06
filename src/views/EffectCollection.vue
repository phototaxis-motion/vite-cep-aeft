<template>
  <div class="effect-collection">
    <!-- {{ effects }} \ {{ effectList }} -->
    <a-collapse v-model="activeNames">
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
              >套用 Effect Collection</a-button>
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
              >刪除</a-button>
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
    <a-divider />
    <a-drawer
      height="200"
      title="新增特效 Collections"
      placement="bottom"
      :visible="visibleAddCollection"
      @close="addCollectionDrawerCloseHandler"
    >
      <template #footer>
        <div class="effect-collection__add">
          <a-input
            size="large"
            v-model:value="addEffectName"
            placeholder="輸入特效組名稱"
          />
          <a-button
            size="large"
            @click="addEffectHandler"
            type="primary"
          >新增 Effect Collection</a-button>
        </div>
      </template>
    </a-drawer>
    <a-button
      size="large"
      class="effect-collection__add-button"
      @click="visibleAddCollection = true"
    >新增當前選取特效到 Collection</a-button>
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
import { getCurrentSelectedEffects, setCurrentSelectedEffectsByString } from '@/scripts/EffectCollection'
import { ref, inject, computed, onMounted } from 'vue'

const alertString = ref('')
const evalScript = inject('evalScript')

const effectList = useLocalStorage('effect-collection', {})
onMounted(() => {
})

// get all effects
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

// effect panel collapse
const activeNames = ref([])

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
const confirmDeleteHandler = (effectName) => {
  if (effectList.value[effectName]) {
    delete effectList.value[effectName]
  }
}

// add effect
const addEffectName = ref('')
const visibleAddCollection = ref(false)
const addCollectionDrawerCloseHandler = () => {
  visibleAddCollection.value = false
  addEffectName.value = ''
}
const addEffectHandler = (e) => {
  addEffectName.value = addEffectName.value.trim()
  // prevent empty name
  if (addEffectName.value === '') {
    alertString.value = '特效組名稱不可為空'
    return
  }

  // check name is exist
  if (effectList.value[addEffectName.value]) {
    alertString.value = '特效組名稱已存在'
    return
  }

  evalScript(getCurrentSelectedEffects, (res) => {
    if (res.startsWith('Error')) {
      alertString.value = res;
      return
    }
    effectList.value[addEffectName.value] = JSON.parse(res)
  })
}

// { "Wiggle Rotation Frequency": { "Slider": 1 }, "Wiggle Position Amplitude": { "Slider": 10 }, "Wiggle Position Frequency": { "Slider": 1 } } 
</script>

<style lang="scss">
.effect-collection {
  max-height: 100%;
  overflow-y: auto;
  text-align: left;

  &__add {
    display: flex;
    justify-content: center;
    padding: 16px;

    &-button {
      width: 80%;
      display: block;
      margin-left: 10%;
    }
  }

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