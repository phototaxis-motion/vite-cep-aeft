<template>
  <div
    class="page-effects-preset"
    :style="{
      pointerEvents: loading ? 'none' : 'auto',
      opacity: loading ? 0.5 : 1,
    }"
  >
    <template v-if="isDev">
      {{ localEffectList }} <br> {{ localEffectValidated }} <br> {{ localEffectConfig }}
    </template>
    <a-switch
      v-model:checked="switchMode"
      checked-children="Edit"
      un-checked-children="Edit"
    >Mode</a-switch>

    <!-- Apply Mode -->
    <a-row
      :gutter="8"
      v-if="currentMode === 'apply'"
    >
      <a-col
        v-for="effect in localEffectValidated"
        :key="effect.value.filePath"
      >
        <a-button
          size="large"
          :disabled="!effect.value.active"
          :title="effect.value.active ? '' : 'File not exist!'"
          @click="$event => applyEffect(effect.value.filePath, effect.value.name)"
        >{{ effect.value.name }}</a-button>
      </a-col>
    </a-row>
    <!-- Setting Mode -->
    <a-row
      :gutter="8"
      v-else-if="currentMode === 'setting'"
    >
      <a-col
        v-for="effect in localEffectValidated"
        :key="effect.value.filePath"
      >
        <a-tag
          size="large"
          closable
          @close="$event => removeEffect(effect.value)"
        >
          {{ effect.value.name }} / {{ effect.value.id }}
        </a-tag>
      </a-col>
    </a-row>

    <a-row
      justify="center"
      style="padding: 20px;"
    >
      <a-col>
        <a-input
          v-model:value="editNameInput"
          :placeholder="nextId"
        />
      </a-col>
      <a-col>
        <a-button @click="saveHandler">Save Current</a-button>
      </a-col>
    </a-row>
    <a-divider></a-divider>
    <a-button
      @click="testHandler"
      v-if="isDev"
    >Reset</a-button>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { checkFileExist, getUserPresetFolder, exportEffectsPreset, PresetType, applyPreset as applyPresetScript, deleteFile } from '@/scripts/EffectsPreset'
import { message } from 'ant-design-vue'

const isDev = import.meta.env.DEV
const evalScript = inject('evalScript')
const alertMessage = ref('')
const editNameInput = ref('')
const activeNames = ref([])
const loading = ref(false)
const currentMode = ref('apply')
const switchMode = computed({
  get: () => currentMode.value === 'setting',
  set: (val) => {
    if (val) {
      currentMode.value = 'setting'
    } else {
      currentMode.value = 'apply'
    }
  },
})
const localEffectList = useLocalStorage('effect-preset', {})
const localEffectConfig = useLocalStorage('effect-config', {
  id: 0,
  prefix: 'effect_',
})
const nextId = computed(() => {
  const { id, prefix } = localEffectConfig.value
  return `${prefix}${id}`
})

const localEffectValidated = computed(() => {
  const effects = []
  // object entries
  Object.entries(localEffectList.value).forEach(([key, value]) => {
    let ObjectRef = ref(new PresetType({ ...value }))
    effects.push(ObjectRef)

    evalScript(checkFileExist(value.filePath), (res) => {
      if (res.startsWith('Error')) {
        ObjectRef.value.active = false
      } else if (res === 'true') {
        ObjectRef.value.active = true
      }
    })
  })
  return effects
})

// Remove
const testHandler = () => {
  // clear List
  localEffectList.value = {}
  localEffectConfig.value.id = 0
  localEffectConfig.value = {
    id: 0,
    prefix: 'effect_',
  }
  // localEffectList.value['test'] = {
  //   name: 'test',
  //   filePath: 'test',
  //   id: 0,
  // }
}
const saveHandler = async () => {
  loading.value = true

  // config
  const folderPath = await new Promise((resolve) => {
    evalScript(`${getUserPresetFolder}.absoluteURI`, (res) => {
      resolve(decodeURI(res))
    })
  })
  const exportScript = exportEffectsPreset(`${folderPath}/${nextId.value}.ffx`)

  await new Promise((resolve) => {
    evalScript(exportScript, (res) => {
      if (res.startsWith('Error')) {
        alertMessage.value = res
      } else if (res === 'true') {
        localEffectList.value[nextId.value] = {
          name: editNameInput.value || nextId.value,
          filePath: `${folderPath}/${nextId.value}.ffx`,
          id: nextId.value,
        }

        localEffectConfig.value.id++
      } else {
        alertMessage.value = 'Unknown Error'
      }
      resolve()
    })
  })
  editNameInput.value = ''
  loading.value = false
}
const applyEffect = async (filePath, effectName) => {
  const script = applyPresetScript(filePath);
  loading.value = true
  try {
    await new Promise((resolve) => {
      evalScript(script, (res) => {
        if (res.startsWith('Error')) {
          alertMessage.value = res
        } else if (res === 'true') {
          message.success(`Apply "${effectName}" Success`)
        } else {
          message.error(`Apply "${effectName}" Failed`)
        }
        resolve()
      })
    })
  } catch (e) {
    alertMessage.value = e
  } finally {
    loading.value = false
  }
}
const removeEffect = async (effect) => {
  const saveObj = { ...localEffectList.value }
  saveObj[effect.id] = undefined;
  delete saveObj[effect.id];
  await new Promise((resolve) => {
    evalScript(deleteFile(effect.filePath), (res) => {
      if (res.startsWith('Error')) {
        alertMessage.value = res
      } else if (res === 'true') {
        message.success(`Delete "${effect.name}" Success`)
      } else {
        message.error(`Delete "${effect.name}" Failed`)
      }
      resolve()
    })
  })

  localEffectList.value = saveObj
}
</script>

<style lang="scss" scoped>.page-effects-preset {
  padding: 40px 20px;
}</style>