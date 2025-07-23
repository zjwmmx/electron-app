import React, { useState, useEffect } from 'react';
import { List, Button, Input, Space, Modal, message, Dropdown, Menu } from 'antd';
import { PlusOutlined, SearchOutlined, FolderOpenOutlined, SettingOutlined, LockOutlined, EditOutlined, DeleteOutlined, FolderAddOutlined, FolderOutlined, DownOutlined, CopyOutlined, ExportOutlined, SwapOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const getInitFolders = () => {
  const local = localStorage.getItem('md-folders');
  if (local) return JSON.parse(local);
  return [
    {
      id: 1,
      name: '默认文件夹',
      articles: [
        { id: 1, title: '60万定律：在一线城市任...', time: '2025-04-29 00:15', locked: true, content: '# 60万定律' },
        { id: 2, title: 'sss', time: '2025-04-28 23:21', locked: true, content: 'sss内容' },
        { id: 3, title: '怀孕', time: '2025-04-28 20:19', locked: true, content: '怀孕内容' },
      ]
    }
  ];
};

const ArticleList = ({ onSelect, selectedId }) => {
  const [folders, setFolders] = useState(getInitFolders());
  const [search, setSearch] = useState('');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [editingArticleTitle, setEditingArticleTitle] = useState('');
  const [expandedFolderId, setExpandedFolderId] = useState(folders[0]?.id || null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [dragFolderId, setDragFolderId] = useState(null);
  const [folderMenu, setFolderMenu] = useState({ visible: false, x: 0, y: 0, folderId: null });
  const [articleMenu, setArticleMenu] = useState({ visible: false, x: 0, y: 0, folderId: null, articleId: null });

  useEffect(() => {
    localStorage.setItem('md-folders', JSON.stringify(folders));
    // 关闭右键菜单时监听全局点击
    const closeMenu = () => {
      setFolderMenu({ ...folderMenu, visible: false });
      setArticleMenu({ ...articleMenu, visible: false });
    };
    if (folderMenu.visible || articleMenu.visible) {
      window.addEventListener('click', closeMenu);
      return () => window.removeEventListener('click', closeMenu);
    }
  }, [folders, folderMenu.visible, articleMenu.visible]);

  // 文件夹操作
  const handleAddFolder = () => {
    const id = Date.now();
    setFolders([...folders, { id, name: '新建文件夹', articles: [] }]);
    setExpandedFolderId(id);
  };
  const handleEditFolder = (id, name) => {
    setEditingFolderId(id);
    setEditingFolderName(name);
  };
  const handleEditFolderOk = () => {
    setFolders(folders.map(f => f.id === editingFolderId ? { ...f, name: editingFolderName } : f));
    setEditingFolderId(null);
    setEditingFolderName('');
  };
  const handleEditFolderCancel = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };
  const handleDeleteFolder = (id) => {
    Modal.confirm({
      title: '确认删除该文件夹及其下所有文章？',
      onOk: () => {
        setFolders(folders.filter(f => f.id !== id));
        if (expandedFolderId === id && folders.length > 1) {
          setExpandedFolderId(folders[0].id);
        }
      }
    });
  };

  // 文章操作
  const handleAddArticle = (folderId) => {
    const id = Date.now();
    setFolders(folders.map(f => f.id === folderId ? {
      ...f,
      articles: [{ id, title: '未命名文章', time: new Date().toLocaleString(), locked: false, content: '' }, ...f.articles]
    } : f));
    onSelect && onSelect(id);
    setExpandedFolderId(folderId);
  };
  const handleDeleteArticle = (folderId, articleId) => {
    Modal.confirm({
      title: '确认删除该文章？',
      onOk: () => {
        setFolders(folders.map(f => f.id === folderId ? {
          ...f,
          articles: f.articles.filter(a => a.id !== articleId)
        } : f));
      }
    });
  };
  const handleEditArticle = (id, title) => {
    setEditingArticleId(id);
    setEditingArticleTitle(title);
  };
  const handleEditArticleOk = () => {
    setFolders(folders.map(f => ({
      ...f,
      articles: f.articles.map(a => a.id === editingArticleId ? { ...a, title: editingArticleTitle } : a)
    })));
    setEditingArticleId(null);
    setEditingArticleTitle('');
  };
  const handleEditArticleCancel = () => {
    setEditingArticleId(null);
    setEditingArticleTitle('');
  };

  // 搜索过滤
  const filteredFolders = folders.map(f => ({
    ...f,
    articles: f.articles.filter(a => a.title.includes(search))
  })).filter(f => f.articles.length > 0 || search === '');

  // 拖拽相关
  const handleDragStart = (e, folderId, articleId) => {
    e.dataTransfer.setData('articleId', articleId);
    e.dataTransfer.setData('fromFolderId', folderId);
  };
  const handleDragOver = (e, folderId) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };
  const handleDragLeave = (e, folderId) => {
    setDragOverFolderId(null);
  };
  const handleDrop = (e, toFolderId) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const articleId = Number(e.dataTransfer.getData('articleId'));
    const fromFolderId = Number(e.dataTransfer.getData('fromFolderId'));
    if (!articleId || !fromFolderId || fromFolderId === toFolderId) return;
    // 找到文章
    const fromFolder = folders.find(f => f.id === fromFolderId);
    const article = fromFolder.articles.find(a => a.id === articleId);
    if (!article) return;
    // 移除原位置，插入目标文件夹顶部
    setFolders(folders.map(f => {
      if (f.id === fromFolderId) {
        return { ...f, articles: f.articles.filter(a => a.id !== articleId) };
      } else if (f.id === toFolderId) {
        return { ...f, articles: [article, ...f.articles] };
      } else {
        return f;
      }
    }));
    message.success('已移动到目标文件夹');
  };

  // 文件夹拖拽排序
  const handleFolderDragStart = (e, folderId) => {
    setDragFolderId(folderId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleFolderDragOver = (e, folderId) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };
  const handleFolderDragLeave = (e, folderId) => {
    setDragOverFolderId(null);
  };
  const handleFolderDrop = (e, targetFolderId) => {
    e.preventDefault();
    setDragOverFolderId(null);
    if (!dragFolderId || dragFolderId === targetFolderId) return;
    const fromIdx = folders.findIndex(f => f.id === dragFolderId);
    const toIdx = folders.findIndex(f => f.id === targetFolderId);
    if (fromIdx === -1 || toIdx === -1) return;
    const newFolders = [...folders];
    const [moved] = newFolders.splice(fromIdx, 1);
    newFolders.splice(toIdx, 0, moved);
    setFolders(newFolders);
    setDragFolderId(null);
  };

  // 右键菜单操作
  const handleFolderContextMenu = (e, folderId) => {
    e.preventDefault();
    setFolderMenu({ visible: true, x: e.clientX, y: e.clientY, folderId });
  };
  const handleArticleContextMenu = (e, folderId, articleId) => {
    e.preventDefault();
    setArticleMenu({ visible: true, x: e.clientX, y: e.clientY, folderId, articleId });
  };

  // 右键菜单项实现
  const handleMenuClick = ({ key }, type) => {
    if (type === 'folder') {
      if (key === 'rename') handleEditFolder(folderMenu.folderId, folders.find(f => f.id === folderMenu.folderId)?.name);
      if (key === 'delete') handleDeleteFolder(folderMenu.folderId);
      if (key === 'add') handleAddArticle(folderMenu.folderId);
    } else if (type === 'article') {
      const { folderId, articleId } = articleMenu;
      if (key === 'rename') handleEditArticle(articleId, folders.find(f => f.id === folderId)?.articles.find(a => a.id === articleId)?.title);
      if (key === 'delete') handleDeleteArticle(folderId, articleId);
      if (key === 'copy') {
        const content = folders.find(f => f.id === folderId)?.articles.find(a => a.id === articleId)?.content;
        navigator.clipboard.writeText(content || '').then(() => message.success('内容已复制到剪贴板'));
      }
      if (key === 'export') {
        const article = folders.find(f => f.id === folderId)?.articles.find(a => a.id === articleId);
        if (article) {
          const blob = new Blob([article.content], { type: 'text/markdown' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = (article.title || '未命名') + '.md';
          a.click();
          URL.revokeObjectURL(a.href);
          message.success('已导出为Markdown');
        }
      }
      if (key === 'move') {
        message.info('请在编辑区右侧使用"移动"功能（可后续实现弹窗选择目标分组）');
      }
    }
    setFolderMenu({ ...folderMenu, visible: false });
    setArticleMenu({ ...articleMenu, visible: false });
  };

  // 文件夹右键菜单
  const folderMenuNode = folderMenu.visible ? (
    <Menu
      onClick={info => handleMenuClick(info, 'folder')}
      style={{ position: 'fixed', left: folderMenu.x, top: folderMenu.y, zIndex: 9999 }}
    >
      <Menu.Item key="add" icon={<PlusOutlined />}>新建文章</Menu.Item>
      <Menu.Item key="rename" icon={<EditOutlined />}>重命名</Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>删除</Menu.Item>
    </Menu>
  ) : null;

  // 文章右键菜单
  const articleMenuNode = articleMenu.visible ? (
    <Menu
      onClick={info => handleMenuClick(info, 'article')}
      style={{ position: 'fixed', left: articleMenu.x, top: articleMenu.y, zIndex: 9999 }}
    >
      <Menu.Item key="rename" icon={<EditOutlined />}>重命名</Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>删除</Menu.Item>
      <Menu.Item key="copy" icon={<CopyOutlined />}>复制内容</Menu.Item>
      <Menu.Item key="export" icon={<ExportOutlined />}>导出为Markdown</Menu.Item>
      <Menu.Item key="move" icon={<SwapOutlined />}>移动到...</Menu.Item>
    </Menu>
  ) : null;

  return (
    <div className={styles.articleList}>
      <div className={styles.articleListHeader}>
        <Space>
          <FolderOpenOutlined />
          <span>分组</span>
        </Space>
        <Button icon={<FolderAddOutlined />} size="small" type="text" onClick={handleAddFolder} />
      </div>
      <Input
        className={styles.articleSearch}
        prefix={<SearchOutlined />}
        placeholder="搜索文章"
        size="small"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div>
        {filteredFolders.map(folder => (
          <div
            key={folder.id}
            style={{ marginBottom: 10, borderRadius: 8, background: dragOverFolderId === folder.id ? '#e6f7ff' : undefined, transition: 'background 0.2s', opacity: dragFolderId === folder.id ? 0.5 : 1 }}
            onDragOver={e => { handleDragOver(e, folder.id); handleFolderDragOver(e, folder.id); }}
            onDragLeave={e => { handleDragLeave(e, folder.id); handleFolderDragLeave(e, folder.id); }}
            onDrop={e => { handleDrop(e, folder.id); handleFolderDrop(e, folder.id); }}
            draggable
            onDragStart={e => handleFolderDragStart(e, folder.id)}
            onContextMenu={e => handleFolderContextMenu(e, folder.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
              <span style={{ cursor: 'pointer', color: '#222' }} onClick={() => setExpandedFolderId(folder.id)}>
                <FolderOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                {editingFolderId === folder.id ? (
                  <Input
                    size="small"
                    value={editingFolderName}
                    onChange={e => setEditingFolderName(e.target.value)}
                    onPressEnter={handleEditFolderOk}
                    onBlur={handleEditFolderCancel}
                    autoFocus
                    style={{ width: 100 }}
                  />
                ) : (
                  <span>{folder.name}</span>
                )}
                <DownOutlined style={{ marginLeft: 6, fontSize: 12, transform: expandedFolderId === folder.id ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
              </span>
              <Button icon={<PlusOutlined />} size="small" type="text" style={{ marginLeft: 8 }} onClick={() => handleAddArticle(folder.id)} />
              <Button icon={<EditOutlined />} size="small" type="text" onClick={() => handleEditFolder(folder.id, folder.name)} />
              <Button icon={<DeleteOutlined />} size="small" type="text" danger onClick={() => handleDeleteFolder(folder.id)} />
            </div>
            {expandedFolderId === folder.id && (
              <List
                className={styles.articleListContent}
                dataSource={folder.articles}
                renderItem={item => (
                  <List.Item
                    className={styles.articleItem + (item.id === selectedId ? ' ' + styles.selected : '')}
                    onClick={() => onSelect && onSelect(item.id)}
                    style={{ cursor: 'pointer', background: item.id === selectedId ? '#e6f7ff' : undefined }}
                    draggable
                    onDragStart={e => handleDragStart(e, folder.id, item.id)}
                    onContextMenu={e => handleArticleContextMenu(e, folder.id, item.id)}
                  >
                    <Space>
                      <LockOutlined style={{ color: '#aaa' }} />
                      {editingArticleId === item.id ? (
                        <Input
                          size="small"
                          value={editingArticleTitle}
                          onChange={e => setEditingArticleTitle(e.target.value)}
                          onPressEnter={handleEditArticleOk}
                          onBlur={handleEditArticleCancel}
                          autoFocus
                          style={{ width: 100 }}
                        />
                      ) : (
                        <span className={styles.articleTitle}>{item.title}</span>
                      )}
                    </Space>
                    <Space>
                      <span className={styles.articleTime}>{item.time}</span>
                      <Button icon={<EditOutlined />} size="small" type="text" onClick={e => { e.stopPropagation(); handleEditArticle(item.id, item.title); }} />
                      <Button icon={<DeleteOutlined />} size="small" type="text" danger onClick={e => { e.stopPropagation(); handleDeleteArticle(folder.id, item.id); }} />
                      <Button icon={<SettingOutlined />} size="small" type="text" onClick={e => e.stopPropagation()} />
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </div>
        ))}
      </div>
      {folderMenuNode}
      {articleMenuNode}
      {/* 文件夹重命名弹窗 */}
      <Modal
        open={!!editingFolderId}
        title="重命名文件夹"
        onOk={handleEditFolderOk}
        onCancel={handleEditFolderCancel}
        okText="确定"
        cancelText="取消"
      >
        <Input value={editingFolderName} onChange={e => setEditingFolderName(e.target.value)} />
      </Modal>
      {/* 文章重命名弹窗 */}
      <Modal
        open={!!editingArticleId}
        title="重命名文章"
        onOk={handleEditArticleOk}
        onCancel={handleEditArticleCancel}
        okText="确定"
        cancelText="取消"
      >
        <Input value={editingArticleTitle} onChange={e => setEditingArticleTitle(e.target.value)} />
      </Modal>
    </div>
  );
};

export default ArticleList;