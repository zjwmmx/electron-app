import React, { useState } from 'react';
import { Layout, Card, Button, Space, message } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import styles from './index.module.scss';

const { Header, Content } = Layout;

const Editor: React.FC = () => {
  const [value, setValue] = useState<string>('# 开始写作...');

  const handleSave = () => {
    // TODO: 实现保存功能
    message.success('保存成功');
  };

  const handleExport = () => {
    // TODO: 实现导出功能
    message.success('导出成功');
  };

  return (
    <Layout className={styles.editorLayout}>
      <Header className={styles.header}>
        <Space>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
          <Button onClick={handleExport}>导出</Button>
        </Space>
      </Header>
      <Content className={styles.content}>
        <Card className={styles.editorCard}>
          <MDEditor
            value={value}
            onChange={(val) => setValue(val || '')}
            height={800}
            preview="live"
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default Editor;
