<script setup>
import { ref, inject, computed } from 'vue'
import { PlusCircleFilled, DisconnectOutlined, LinkOutlined, UpCircleFilled } from '@ant-design/icons-vue';
import { activeProxyScript, deactiveProxyScript, getRenderScriptBySettings } from '@/scripts/proxyMode'

const evalScript = inject('evalScript')

// MODE
const MODES = {
  title: "Modes",
  DRAFT: {
    label: "Draft",
    width: 50,
    renderName: "Draft Settings",
    outputModule: "Draft Output",
  },
  HIGH_WITH_ALPHA: {
    label: "High with Alpha",
    width: 100,
    renderName: "Best Settings",
    outputModule: "High Quality with Alpha"
  },
  HIGH_WITH_NO_ALPHA: {
    label: "High with no Alpha",
    width: 150,
    renderName: "Best Settings",
    outputModule: "High no Alpha Output"
  }
}
const currentMode = ref('DRAFT')
const currentModeLabel = computed(() => MODES[currentMode.value].label)
const menuClickHandler = ({ key }) => {
  currentMode.value = key
}

const addRenderQueue = () => {
  const { renderName, outputModule } = MODES[currentMode.value]
  const script = getRenderScriptBySettings(renderName, outputModule)
  evalScript(script)
}


const connected = ref(true)
const connectLoading = ref(false)
const clickProxyModeHandler = () => {
  connectLoading.value = true
  if (connected.value) {
    evalScript(deactiveProxyScript, (res) => {
      connected.value = res === 'true'
    });
  } else {
    evalScript(activeProxyScript, (res) => {
      connected.value = res === 'true'
    });
  }
  connectLoading.value = false
}

</script>
<template>
  <a-row
    justify="center"
    :gutter="20"
  >
    <a-col :span="10">
      <!-- Settings -->
      <a-dropdown>
        <a
          class="ant-dropdown-link"
          @click.prevent
        >
          {{ currentModeLabel }}
          <UpCircleFilled />
        </a>
        <template #overlay>
          <a-menu @click="menuClickHandler">
            <a-menu-item key="DRAFT">
              {{ MODES.DRAFT.label }}
            </a-menu-item>
            <a-menu-item key="HIGH_WITH_ALPHA">
              {{ MODES.HIGH_WITH_ALPHA.label }}
            </a-menu-item>
            <a-menu-item key="HIGH_WITH_NO_ALPHA">
              {{ MODES.HIGH_WITH_NO_ALPHA.label }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-col>
    <a-col :span="10">
      <!-- add render queue -->
      <a-button
        size="large"
        @click="addRenderQueue"
      >
        <template #icon>
          <plus-circle-filled />
        </template>
      </a-button>
      <!-- set proxy mode -->
      <a-button
        size="large"
        :loading="connectLoading"
        @click="clickProxyModeHandler"
      >
        <template #icon>
          <link-outlined v-if="connected" />
          <disconnect-outlined v-else />
        </template>
      </a-button>
    </a-col>
  </a-row>
</template>


<style lang="scss">
.ant-dropdown-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #000;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;

  .anticon {
    margin-left: auto;
    transition: all 0.3s;
  }

  &.ant-dropdown-open .anticon {
    transform: rotate(180deg);
  }

  &:hover {
    border-color: #40a9ff;
    color: #40a9ff;
  }
}
</style>