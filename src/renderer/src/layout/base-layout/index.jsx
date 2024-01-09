import { Modal, Progress, Spin } from 'ant-design-vue'
import { isNil } from 'lodash'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import styles from './style.module.scss'

const BaseLayout = defineComponent({
  name: 'BaseLayout',
  setup: () => {
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
    })

    return () => {
      return (
        <div class="wrap">
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
        </div>
      )
    }
  }
})

export default BaseLayout
