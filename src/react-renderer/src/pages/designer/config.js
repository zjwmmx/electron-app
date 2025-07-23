export const BASE_COMPONENTS = [
  {
    type: 'Grid',
    name: '栅格容器',
    category: 'layout',
    defaultProps: {
      rows: 1,
      cols: 2,
      gutter: 16,
      cells: [], // 用于存储每个单元格的配置
    },
  },
  {
    type: 'Card',
    name: '卡片',
    category: 'layout',
    defaultProps: {
      title: '卡片标题',
      bordered: true,
    },
  },
  {
    type: 'Divider',
    name: '分割线',
    category: 'layout',
    defaultProps: {
      orientation: 'left',
      text: '',
    },
  },
  {
    type: 'Text',
    name: '文本',
    category: 'display',
    defaultProps: {
      content: '文本内容',
      type: 'default',
    },
  },
  {
    type: 'Title',
    name: '标题',
    category: 'display',
    defaultProps: {
      content: '标题文本',
      level: 1,
    },
  },
  {
    type: 'Input',
    name: '输入框',
    category: 'form',
    defaultProps: {
      label: '输入框',
      placeholder: '请输入',
      required: false,
    },
  },
  {
    type: 'Select',
    name: '选择框',
    category: 'form',
    defaultProps: {
      label: '选择框',
      placeholder: '请选择',
      required: false,
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' },
      ],
    },
  },
  {
    type: 'DatePicker',
    name: '日期选择',
    category: 'form',
    defaultProps: {
      label: '日期选择',
      required: false,
    },
  },
  {
    type: 'Button',
    name: '按钮',
    category: 'form',
    defaultProps: {
      text: '提交',
      type: 'primary',
    },
  },
]; 