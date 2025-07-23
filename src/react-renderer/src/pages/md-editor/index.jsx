import React, { useState } from 'react';
import styles from './index.module.scss';
import ArticleList from './ArticleList';
import EditorPanel from './EditorPanel';
import QuickActions from './QuickActions';
import TemplateModal from './TemplateModal';
import { Layout, Menu, Button, message, notification, Modal, List } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import html2pdf from 'html2pdf.js';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: 'file', label: '文件' },
  { key: 'format', label: '格式' },
  { key: 'theme', label: '主题' },
  { key: 'style', label: '样式' },
  { key: 'feature', label: '功能' },
  { key: 'view', label: '视图' },
  { key: 'setting', label: '设置' },
  { key: 'help', label: '帮助' },
  { key: 'tutorial', label: '教程' },
];

const getInitFolders = () => {
  const local = localStorage.getItem('md-folders');
  if (local) return JSON.parse(local);
  return [];
};

const MdEditor = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [folders, setFolders] = useState(getInitFolders());
  const [content, setContent] = useState('');
  const [lastContent, setLastContent] = useState('');
  const [historyModal, setHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const handleSelect = (id) => {
    setSelectedId(id);
    const article = folders.flatMap(f => f.articles).find(a => a.id === id);
    setContent(article ? article.content : '');
  };

  const handleContentChange = (val) => {
    setContent(val);
    const newFolders = folders.map(f => ({
      ...f,
      articles: f.articles.map(a => a.id === selectedId ? { ...a, content: val } : a)
    }));
    setFolders(newFolders);
    localStorage.setItem('md-folders', JSON.stringify(newFolders));
    saveHistory(val);
  };

  const handleApplyTemplate = (tpl) => {
    if (!selectedId) return;
    setContent(tpl.content);
    const newFolders = folders.map(f => ({
      ...f,
      articles: f.articles.map(a => a.id === selectedId ? { ...a, content: tpl.content } : a)
    }));
    setFolders(newFolders);
    localStorage.setItem('md-folders', JSON.stringify(newFolders));
    setShowTemplate(false);
  };

  // 复制当前文章内容到剪贴板
  const handleCopy = () => {
    if (!content) {
      message.warning('没有可复制的内容');
      return;
    }
    // Electron 环境优先
    if (window.api && typeof window.api.writeText === 'function') {
      window.api.writeText(content).then(() => {
        message.success('内容已复制到剪贴板');
      }).catch(() => {
        fallbackCopyTextToClipboard(content);
      });
      return;
    }
    // 浏览器API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => {
        message.success('内容已复制到剪贴板');
      }, () => {
        fallbackCopyTextToClipboard(content);
      });
    } else {
      fallbackCopyTextToClipboard(content);
    }
  };

  // 兜底方案
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      message.success('内容已复制到剪贴板');
    } catch (err) {
      message.error('复制失败，请检查浏览器权限');
    }
    document.body.removeChild(textArea);
  }

  const handleThemeToggle = () => {
    setIsDark(v => !v);
  };

  const handleExport = (type) => {
    if (!selectedId) {
      message.warning('请先选择文章');
      return;
    }
    const article = folders.flatMap(f => f.articles).find(a => a.id === selectedId);
    if (!article) {
      message.warning('未找到文章');
      return;
    }
    let data = article.content;
    let filename = article.title || '未命名';
    if (type === 'html') {
      data = `<html><body>${data}</body></html>`;
      filename += '.html';
      const blob = new Blob([data], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
      message.success('已导出为HTML');
    } else if (type === 'pdf') {
      // 使用 html2pdf.js 导出 PDF
      const element = document.createElement('div');
      element.innerHTML = data;
      html2pdf().from(element).set({ margin: 0.5, filename: filename + '.pdf' }).save();
      message.success('已导出为PDF');
    } else {
      // 默认导出为 Markdown
      filename += '.md';
      const blob = new Blob([data], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
      message.success('已导出为Markdown');
    }
  };

  const handleFormat = (type) => {
    if (!selectedId) {
      message.warning('请先选择文章');
      return;
    }
    let newContent = content;
    if (type === 'zhihu') {
      newContent = newContent
        .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '\n![$1]($2)\n')
        .replace(/```([\s\S]*?)```/g, '```text\n$1\n```');
      setLastContent(content);
      showUndoNotification();
      message.success('已适配知乎格式');
    } else if (type === 'mp') {
      newContent = newContent
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        .replace(/\|/g, '｜');
      setLastContent(content);
      showUndoNotification();
      message.success('已适配公众号格式');
    } else if (type === 'juejin') {
      newContent = newContent.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '\n![$1]($2)\n');
      setLastContent(content);
      showUndoNotification();
      message.success('已适配掘金格式');
    } else {
      message.info('暂不支持该平台适配');
      return;
    }
    setContent(newContent);
    const newFolders = folders.map(f => ({
      ...f,
      articles: f.articles.map(a => a.id === selectedId ? { ...a, content: newContent } : a)
    }));
    setFolders(newFolders);
    localStorage.setItem('md-folders', JSON.stringify(newFolders));
  };

  // 撤销适配
  const handleUndoFormat = () => {
    if (!lastContent) return;
    setContent(lastContent);
    const newFolders = folders.map(f => ({
      ...f,
      articles: f.articles.map(a => a.id === selectedId ? { ...a, content: lastContent } : a)
    }));
    setFolders(newFolders);
    localStorage.setItem('md-folders', JSON.stringify(newFolders));
    setLastContent('');
    message.success('已撤销适配，恢复原内容');
  };

  // 适配后弹出带撤销按钮的提示
  const showUndoNotification = () => {
    notification.open({
      message: '内容已适配',
      description: '如需恢复适配前内容，可点击"撤销"按钮。',
      btn: <Button type="link" size="small" onClick={handleUndoFormat}>撤销</Button>,
      duration: 5
    });
  };

  const handleSync = () => {
    // 这里可以实现同步/刷新功能
    // 例如从本地或云端重新加载数据
  };

  // 保存历史快照
  const saveHistory = (val) => {
    if (!selectedId) return;
    const key = `history-${selectedId}`;
    const old = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    // 避免重复快照
    if (old.length && old[0].content === val) return;
    const newHistory = [{ content: val, time: now }, ...old].slice(0, 20); // 最多保留20条
    localStorage.setItem(key, JSON.stringify(newHistory));
  };

  // 打开历史版本弹窗
  const openHistory = () => {
    if (!selectedId) return;
    const key = `history-${selectedId}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    setHistoryList(list);
    setHistoryModal(true);
  };

  // 恢复历史版本
  const handleRestoreHistory = (item) => {
    setContent(item.content);
    const newFolders = folders.map(f => ({
      ...f,
      articles: f.articles.map(a => a.id === selectedId ? { ...a, content: item.content } : a)
    }));
    setFolders(newFolders);
    localStorage.setItem('md-folders', JSON.stringify(newFolders));
    setHistoryModal(false);
    message.success('已恢复该历史版本');
  };

  return (
    <Layout className={styles.mdEditorLayout}>
      <Header className={styles.topMenu}>
        <div className={styles.logo}>Markdown Nice</div>
        <Menu
          mode="horizontal"
          items={menuItems}
          className={styles.menuBar}
        />
        <Button
          icon={<AppstoreOutlined />}
          type="primary"
          style={{ marginLeft: 16, borderRadius: 20 }}
          onClick={() => setShowTemplate(true)}
        >
          模板
        </Button>
        <Button
          style={{ marginLeft: 8, borderRadius: 20 }}
          onClick={openHistory}
        >
          历史版本
        </Button>
      </Header>
      <Layout>
        <Sider width={260} className={styles.leftSider}>
          <ArticleList onSelect={handleSelect} selectedId={selectedId} />
        </Sider>
        <Content className={styles.centerContent}>
          <EditorPanel articleId={selectedId} onContentChange={handleContentChange} isDark={isDark} />
        </Content>
        <Sider width={80} className={styles.rightSider} theme="light">
          <QuickActions
            onThemeToggle={handleThemeToggle}
            isDark={isDark}
            onExport={handleExport}
            onFormat={handleFormat}
            onSync={handleSync}
            onCopy={handleCopy}
          />
        </Sider>
      </Layout>
      <TemplateModal
        open={showTemplate}
        onClose={() => setShowTemplate(false)}
        onApply={handleApplyTemplate}
      />
      <Modal
        open={historyModal}
        title="历史版本"
        onCancel={() => setHistoryModal(false)}
        footer={null}
        width={700}
      >
        <List
          dataSource={historyList}
          renderItem={item => (
            <List.Item
              actions={[<Button type="link" onClick={() => handleRestoreHistory(item)}>恢复</Button>]}
            >
              <div style={{ color: '#888', fontSize: 13 }}>{new Date(item.time).toLocaleString()}</div>
              <div style={{ maxHeight: 60, overflow: 'hidden', color: '#222', fontSize: 14, marginTop: 4, whiteSpace: 'pre-wrap' }}>{item.content.slice(0, 120)}{item.content.length > 120 ? '...' : ''}</div>
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  );
};

export default MdEditor; 