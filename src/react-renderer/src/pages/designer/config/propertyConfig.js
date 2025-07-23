// 定义每种组件类型的属性配置
export const PROPERTY_CONFIG = {
  Grid: [
    {
      key: 'rows',
      name: '行数',
      type: 'number',
      component: 'InputNumber',
      min: 1,
      max: 10,
    },
    {
      key: 'cols',
      name: '列数',
      type: 'number',
      component: 'InputNumber',
      min: 1,
      max: 12,
    },
    {
      key: 'gutter',
      name: '间距',
      type: 'number',
      component: 'InputNumber',
      min: 0,
      max: 48,
      step: 8,
    },
  ],
  Card: [
    {
      key: 'title',
      name: '标题',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'bordered',
      name: '显示边框',
      type: 'boolean',
      component: 'Switch',
    },
  ],
  Divider: [
    {
      key: 'text',
      name: '文本内容',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'orientation',
      name: '文本位置',
      type: 'enum',
      component: 'Select',
      options: [
        { label: '左侧', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右侧', value: 'right' },
      ],
    },
  ],
  Text: [
    {
      key: 'content',
      name: '文本内容',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'type',
      name: '文本类型',
      type: 'enum',
      component: 'Select',
      options: [
        { label: '默认', value: 'default' },
        { label: '次要', value: 'secondary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
      ],
    },
  ],
  Title: [
    {
      key: 'content',
      name: '标题内容',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'level',
      name: '标题级别',
      type: 'number',
      component: 'Select',
      options: [
        { label: '一级标题', value: 1 },
        { label: '二级标题', value: 2 },
        { label: '三级标题', value: 3 },
        { label: '四级标题', value: 4 },
        { label: '五级标题', value: 5 },
      ],
    },
  ],
  Input: [
    {
      key: 'label',
      name: '标签',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'placeholder',
      name: '占位提示',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'required',
      name: '必填',
      type: 'boolean',
      component: 'Switch',
    },
    {
      key: 'disabled',
      name: '禁用',
      type: 'boolean',
      component: 'Switch',
    },
  ],
  Select: [
    {
      key: 'label',
      name: '标签',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'placeholder',
      name: '占位提示',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'required',
      name: '必填',
      type: 'boolean',
      component: 'Switch',
    },
    {
      key: 'disabled',
      name: '禁用',
      type: 'boolean',
      component: 'Switch',
    },
    {
      key: 'options',
      name: '选项',
      type: 'array',
      component: 'OptionEditor',
      defaultValue: [],
    },
  ],
  DatePicker: [
    {
      key: 'label',
      name: '标签',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'required',
      name: '必填',
      type: 'boolean',
      component: 'Switch',
    },
    {
      key: 'disabled',
      name: '禁用',
      type: 'boolean',
      component: 'Switch',
    },
  ],
  Button: [
    {
      key: 'text',
      name: '按钮文本',
      type: 'string',
      component: 'Input',
    },
    {
      key: 'type',
      name: '按钮类型',
      type: 'enum',
      component: 'Select',
      options: [
        { label: '主按钮', value: 'primary' },
        { label: '次按钮', value: 'default' },
        { label: '虚线按钮', value: 'dashed' },
        { label: '文本按钮', value: 'text' },
        { label: '链接按钮', value: 'link' },
      ],
    },
    {
      key: 'disabled',
      name: '禁用',
      type: 'boolean',
      component: 'Switch',
    },
  ],
}; 