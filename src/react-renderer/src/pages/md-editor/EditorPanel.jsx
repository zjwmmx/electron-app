import React, { useEffect, useState, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import styles from './index.module.scss';
import { Modal, Input, InputNumber, Space } from 'antd';

const getInitArticles = () => {
  const local = localStorage.getItem('md-articles');
  if (local) return JSON.parse(local);
  return [];
};

const defaultBlockquoteStyle = {
  background: '#f6f6f6',
  color: '#333',
  lineHeight: 1.8,
};

const EditorPanel = ({ articleId, onContentChange, isDark, content }) => {
  const [articles, setArticles] = useState(getInitArticles());
  const [value, setValue] = useState(content);
  const textareaRef = useRef();
  const [styleMap, setStyleMap] = useState({ blockquote: { ...defaultBlockquoteStyle } });
  const [editingType, setEditingType] = useState(null);
  const [tempStyle, setTempStyle] = useState({ ...defaultBlockquoteStyle });

  useEffect(() => {
    setArticles(getInitArticles());
  }, [articleId]);

  useEffect(() => {
    const article = articles.find(a => a.id === articleId);
    setValue(article ? article.content : '');
  }, [articles, articleId]);

  // 切换文章时自动聚焦
  useEffect(() => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 120);
  }, [articleId]);

  const handleChange = (val) => {
    setValue(val);
    // 更新本地存储
    const newArticles = articles.map(a => a.id === articleId ? { ...a, content: val } : a);
    setArticles(newArticles);
    localStorage.setItem('md-articles', JSON.stringify(newArticles));
    onContentChange && onContentChange(val);
  };

  // 预览区 blockquote 点击事件
  const handleBlockquoteClick = (e) => {
    e.stopPropagation();
    setEditingType('blockquote');
    setTempStyle({ ...styleMap.blockquote });
  };

  // 样式编辑弹窗确认
  const handleStyleOk = () => {
    setStyleMap(prev => ({ ...prev, blockquote: { ...tempStyle } }));
    setEditingType(null);
  };

  // 样式编辑弹窗取消
  const handleStyleCancel = () => {
    setEditingType(null);
  };

  if (!articleId) {
    return <div className={styles.editorPanel} style={{color:'#aaa',textAlign:'center',paddingTop:100}}>请选择左侧文章进行编辑</div>;
  }

  return (
    <div className={styles.editorPanel} data-color-mode={isDark ? 'dark' : 'light'} style={{display:'flex',gap:32}}>
      {/* 编辑区 */}
      <div style={{flex:1,minWidth:0}}>
        <MDEditor
          className={styles.editorContent}
          value={value}
          onChange={handleChange}
          height={800}
          width={'100%'}
          preview="edit"
          enableScroll={true}
          highlightEnable={true}
          textareaProps={{
            placeholder: '开始写作...',
            ref: textareaRef,
            autoFocus: true,
          }}
          data-color-mode={isDark ? 'dark' : 'light'}
        />
      </div>
      {/* 预览区 */}
      <div style={{flex:1,minWidth:0,background:'#fafbfc',borderRadius:8,padding:24,overflow:'auto',height:800}}>
        <MDEditor.Markdown
          source={value}
          style={{background:'none'}}
          components={{
            blockquote: ({ children, ...props }) => (
              <blockquote
                {...props}
                style={{
                  background: styleMap.blockquote.background,
                  color: styleMap.blockquote.color,
                  lineHeight: styleMap.blockquote.lineHeight,
                  borderLeft: '4px solid #ccc',
                  padding: '8px 16px',
                  margin: '8px 0',
                  cursor: 'pointer',
                }}
                onClick={handleBlockquoteClick}
              >
                {children}
              </blockquote>
            ),
          }}
        />
      </div>
      {/* 样式编辑弹窗 */}
      <Modal
        open={editingType === 'blockquote'}
        title="编辑引用块样式"
        onOk={handleStyleOk}
        onCancel={handleStyleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            背景色：<Input type="color" value={tempStyle.background} onChange={e => setTempStyle(s => ({ ...s, background: e.target.value }))} style={{ width: 60, verticalAlign: 'middle' }} />
          </div>
          <div>
            字体颜色：<Input type="color" value={tempStyle.color} onChange={e => setTempStyle(s => ({ ...s, color: e.target.value }))} style={{ width: 60, verticalAlign: 'middle' }} />
          </div>
          <div>
            行高：<InputNumber min={1} max={3} step={0.1} value={tempStyle.lineHeight} onChange={v => setTempStyle(s => ({ ...s, lineHeight: v }))} style={{ width: 80 }} />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default EditorPanel;
