import { Modal, Progress, Spin } from 'ant-design-vue'
import { isNil } from 'lodash'
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import styles from './style.module.scss'
import {
  NLayout,
  NLayoutHeader,
  NIcon,
  NLayoutSider,
  NMenu,
  NLayoutContent,
  NInput,
  NButton,
  NAvatar,
  NText,
  NTag,
  NDropdown
} from 'naive-ui'
import {
  BookOutline as BookIcon,
  PersonOutline as PersonIcon,
  WineOutline as WineIcon,
  HomeOutline as HomeIcon,
  CashOutline,
  NotificationsOutline,
  ChevronDownSharp
} from '@vicons/ionicons5'
import { userStore } from '../../store/user.store'
import { storeToRefs } from 'pinia'

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const BaseLayout = defineComponent({
  name: 'BaseLayout',
  setup: () => {
    const menu = [
      {
        label: '首页',
        key: 'home',
        icon: renderIcon(HomeIcon)
      },
      {
        key: 'product',
        label: '采购',
        icon: renderIcon(PersonIcon)
      },
      {
        key: 'variable',
        label: '变量',
        icon: renderIcon(WineIcon)
      }
    ]

    const options = [
      {
        label: '退出',
        key: 'logout'
      },
      {
        label: '修改信息',
        key: 'updateAccount'
      }
    ]

    const collapsed = ref(false)
    const currentMenu = ref(null)
    const search = ref('')
    const activeKey = ref(null)

    const store = userStore()
    const { getUserInfo, token } = storeToRefs(store)

    function onMenuChange(key, item) {
      currentMenu.value = item
    }

    function handleSelect(key) {
      if (key === 'logout') {
        window.api.logout()
      }
      console.log(key)
    }

    const color = ref('#1890ff')
    const downloadProgress = ref({})
    const currentStatus = ref(null)

    function formatSize(value) {
      return value ? (value / (1024 * 1024)).toFixed(2) : 0
    }

    const percent = computed(() => {
      const { total, transferred } = downloadProgress.value
      const formatTotal = formatSize(total)
      const formatTransferred = formatSize(transferred)
      return `${formatTransferred}MB/${formatTotal}MB`
    })

    function handleStatusChange(status, msg) {
      currentStatus.value = status

      switch (status) {
        case 'downloading':
          handleDownloadingStatus(msg)
          break

        case 'error':
          handleErrorStatus(msg)
          break

        case 'completed':
          handleCompletedStatus(msg)
          break

        case 'latest':
          handleLatestStatus(msg)
          break

        case 'update-available':
          handleUpdateAvailableStatus(msg)
          break

        default:
          break
      }
    }

    function handleDownloadingStatus(msg) {
      downloadProgress.value = msg
    }

    function handleErrorStatus(msg) {
      Modal.error({ title: '下载失败', content: msg })
    }

    function handleCompletedStatus(msg) {
      Modal.success({
        title: '下载完成',
        content: msg,
        onOk: () => window.api.quitAndInstall()
      })
    }

    function handleLatestStatus(msg) {
      Modal.warning({ title: '已是最新版本', content: msg, okText: '确定' })
    }

    function handleUpdateAvailableStatus(msg) {
      Modal.confirm({
        title: '软件更新',
        content: msg,
        cancelText: '暂不更新',
        okText: '立即更新',
        onOk() {
          window.api.downloadUpdate()
          currentStatus.value = 'pending'
        },
        onCancel() {}
      })
    }

    onMounted(() => {
      window.api.onUpdateStatus(({ status, msg }) => {
        handleStatusChange(status, msg)
      })
      window.store.setStore('color', 'red')
      color.value = window.store.getStore('color')
      store.getUserInfo()
    })

    return () => {
      console.log(currentMenu.value)
      return (
        <NLayout class={styles.layout} has-sider>
          <NLayoutSider
            class={styles.sider}
            collapse-mode="width"
            collapsed-width={64}
            width={150}
            collapsed={collapsed.value}
            show-trigger
            onCollapse={() => (collapsed.value = true)}
            onExpand={() => (collapsed.value = false)}
          >
            <div class={styles.logo}>logo图标</div>
            <NMenu
              class={styles.nav}
              options={menu}
              v-model:value={activeKey.value}
              onUpdate:value={onMenuChange}
              indent={16}
            />
          </NLayoutSider>
          <NLayout>
            <NLayoutHeader bordered>
              <div class={styles.header}>
                <h4>{currentMenu.value?.label}</h4>
                <div class={styles.rt}>
                  {/* <NInput type="text" v-model:value={search.value} placeholder={'请输入用户名'} />
                  <NButton round type="primary" color="#fd721d">
                    +全网采购
                  </NButton>
                  <NButton quaternary round text>
                    首页
                  </NButton>
                  <NButton
                    quaternary
                    round
                    text
                    vSlots={{
                      icon: () => (
                        <NIcon>
                          <CashOutline />
                        </NIcon>
                      )
                    }}
                  >
                    新手指南
                  </NButton>
                  <NButton
                    quaternary
                    round
                    text
                    vSlots={{
                      icon: () => (
                        <NIcon>
                          <NotificationsOutline />
                        </NIcon>
                      )
                    }}
                  >
                    消息
                  </NButton> */}
                  <div>
                    <NDropdown
                      placement="bottom-start"
                      trigger="click"
                      size="large"
                      width="trigger"
                      options={options}
                      onSelect={handleSelect}
                    >
                      <div class={styles.user}>
                        <NAvatar
                          class={styles.avatar}
                          round
                          src={'https://07akioni.oss-cn-beijing.aliyuncs.com/demo1.JPG'}
                        />
                        <div class={styles.info}>
                          <div>
                            <NText depth={3}>13229293233</NText>
                          </div>
                          <div>
                            <NTag type="success" size="small">
                              标签
                            </NTag>
                          </div>
                        </div>
                        <NIcon>
                          <ChevronDownSharp />
                        </NIcon>
                      </div>
                    </NDropdown>
                  </div>
                </div>
              </div>
            </NLayoutHeader>
            <NLayoutContent content-style="padding: 24px;">
              <Spin spinning={['checking', 'pending'].includes(currentStatus.value)}>
                {!isNil(downloadProgress.value.percent) && (
                  <div class={styles.download}>
                    <Progress
                      class={styles.progress}
                      percent={downloadProgress.value.percent.toFixed(0)}
                      showInfo={false}
                    />
                    {percent.value}
                  </div>
                )}
              </Spin>
              <RouterView></RouterView>
            </NLayoutContent>
          </NLayout>
        </NLayout>
      )
    }
  }
})

export default BaseLayout
