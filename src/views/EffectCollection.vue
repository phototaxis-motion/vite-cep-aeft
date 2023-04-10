<template>
  <div class="effect-collection">
    <LocalStorageEffetsTool
      v-if="!loading"
      :ref="(el) => { localToolRef = el }"
    ></LocalStorageEffetsTool>
    <!-- Add Button -->
    <a-row>
      <a-button
        size="large"
        class="effect-collection__add-button"
        @click="visibleAddLocalCollection = true"
      >新增快取特效</a-button>
    </a-row>
    <ProjectEffectsTool
      v-if="!loading"
      :ref="(el) => { projectToolRef = el }"
    ></ProjectEffectsTool>
    <a-row>
      <a-button
        size="large"
        class="effect-collection__add-button"
        @click="visibleAddProjectCollection = true"
      >新增專案特效</a-button>
    </a-row>

    <!-- 快取特效新增 -->
    <a-drawer
      height="200"
      title="新增快取特效"
      placement="bottom"
      :visible="visibleAddLocalCollection"
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
            @click="addLocalEffectHandler"
            type="primary"
          >新增 Effect Collection</a-button>
        </div>
      </template>
    </a-drawer>
    <!-- 專案特效新增 -->
    <a-drawer
      height="200"
      title="新增專案特效"
      placement="bottom"
      :visible="visibleAddProjectCollection"
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
            @click="addProjectEffectHandler"
            type="primary"
          >新增 Effect Collection</a-button>
        </div>
      </template>
    </a-drawer>

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
import { getCurrentSelectedEffects, getScriptCopyCurrentLayerEffectsToNewLayer, checkSelectedLayerEffectHasNoCustomValue } from '@/scripts/EffectCollection'
import { ref, inject, computed } from 'vue'
import LocalStorageEffetsTool from '@/components/LocalStorageEffetsTool.vue'
import ProjectEffectsTool from '@/components/ProjectEffectsTool.vue'
import DDTarget from '@/views/2DTarget.vue'

const loading = ref(false)
const localToolRef = ref(null)
const projectToolRef = ref(null)
const alertString = ref('')
const evalScript = inject('evalScript')
const localEffectList = useLocalStorage('effect-collection', {})
const localEffectNames = computed(() => {
  if (localToolRef.value) {
    return localToolRef.value.effectsNames
  }
  return []
})
const projectEffectNames = computed(() => {
  if (projectToolRef.value) {
    return projectToolRef.value.effectsNames
  }
  return []
})

// add effect
const addEffectName = ref('')
const visibleAddLocalCollection = ref(false)
const visibleAddProjectCollection = ref(false)
const addCollectionDrawerCloseHandler = () => {
  visibleAddLocalCollection.value = false
  visibleAddProjectCollection.value = false
  addEffectName.value = ''
}



const addLocalEffectHandler = (e) => {
  loading.value = true
  addEffectName.value = addEffectName.value.trim()
  // prevent empty name
  if (addEffectName.value === '') {
    alertString.value = '特效組名稱不可為空'
    loading.value = false
    return
  }

  // check name is exist
  if (localEffectNames.value.includes(addEffectName.value)) {
    alertString.value = '特效組名稱已存在'
    loading.value = false
    return
  }

  // check Selected Layer Effect Has No Custom Value
  evalScript(checkSelectedLayerEffectHasNoCustomValue, (res) => {
    if (res === 'false') {
      alertString.value = '快取無法存取含有自訂值的特效，請先移除自訂值的特效，或是改用專案特效';
      loading.value = false;
      return
    } else if (res === 'true') {
      evalScript(getCurrentSelectedEffects, (res) => {
        if (res.startsWith('Error')) {
          alertString.value = res;
          return
        } else {
          localEffectList.value[addEffectName.value] = JSON.parse(res)
        }
        setTimeout(() => {
          loading.value = false
        }, 500)
      })
    } else {
      alertString.value = '未知錯誤';
      loading.value = false
    }
  })

  visibleAddLocalCollection.value = false
}

const addProjectEffectHandler = (e) => {
  loading.value = true
  addEffectName.value = addEffectName.value.trim()
  // prevent empty name
  if (addEffectName.value === '') {
    alertString.value = '特效組名稱不可為空'
    loading.value = false
    return
  }

  // check name is exist
  if (projectEffectNames.value.includes(addEffectName.value)) {
    alertString.value = '特效組名稱已存在'
    loading.value = false
    return
  }

  // Add effect layer
  evalScript(getScriptCopyCurrentLayerEffectsToNewLayer(addEffectName.value), (res) => {
    if (res.startsWith('Error')) {
      alertString.value = res;
      return
    } else {
      addEffectName.value = ''
    }
  })
  setTimeout(() => {
    loading.value = false
  }, 500)
  visibleAddProjectCollection.value = false
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

}
</style>