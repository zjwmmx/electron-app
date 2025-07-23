import React from 'react';
import { Button, Space, Divider, Tooltip, message } from 'antd';
import { SyncOutlined, SettingOutlined, BulbOutlined, FileMarkdownOutlined, FileTextOutlined, FilePdfOutlined, CopyOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const QuickActions = ({
  onThemeToggle,
  isDark,
  onExport,
  onFormat,
  onSync,
  onCopy
}) => {
  return (
    <div className={styles.quickActions}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Tooltip title="同步/刷新">
          <Button icon={<SyncOutlined />} shape="circle" onClick={onSync} />
        </Tooltip>
        <Divider />
        <Tooltip title="知乎适配">
          <Button shape="circle" onClick={() => onFormat('zhihu')}>知</Button>
        </Tooltip>
        <Tooltip title="公众号适配">
          <Button shape="circle" onClick={() => onFormat('mp')}>公</Button>
        </Tooltip>
        <Tooltip title="掘金适配">
          <Button shape="circle" onClick={() => onFormat('juejin')}>掘</Button>
        </Tooltip>
        <Divider />
        <Tooltip title={isDark ? '切换为亮色模式' : '切换为暗色模式'}>
          <Button icon={<BulbOutlined />} shape="circle" onClick={onThemeToggle} />
        </Tooltip>
        <Tooltip title="导出为 Markdown">
          <Button icon={<FileMarkdownOutlined />} shape="circle" onClick={() => onExport('markdown')} />
        </Tooltip>
        <Tooltip title="导出为 HTML">
          <Button icon={<FileTextOutlined />} shape="circle" onClick={() => onExport('html')} />
        </Tooltip>
        <Tooltip title="导出为 PDF">
          <Button icon={<FilePdfOutlined />} shape="circle" onClick={() => onExport('pdf')} />
        </Tooltip>
        <Tooltip title="复制内容">
          <Button icon={<CopyOutlined />} shape="circle" onClick={onCopy} />
        </Tooltip>
        <Divider />
        <Tooltip title="更多设置">
          <Button icon={<SettingOutlined />} shape="circle" />
        </Tooltip>
      </Space>
    </div>
  );
};

export default QuickActions;
