import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Row, Col, Tag, Tabs, Tooltip, Form, Input, Upload, message, Select, Space, Dropdown, Menu } from 'antd';
import { CheckOutlined, StarOutlined, StarFilled, EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, EyeOutlined, SearchOutlined, ImportOutlined, ExportOutlined, SortAscendingOutlined, SortDescendingOutlined, TagOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';

const defaultTemplates = [
  {
    id: 1,
    name: '重彩',
    desc: '适合公众号、知乎等平台，色彩丰富，结构清晰',
    preview: 'https://mdnice.com/static/img/theme/1.png',
    content: '# 重彩模板\n\n> 这里是重彩模板示例内容...',
    category: '公众号'
  },
  {
    id: 2,
    name: '丘比特忙',
    desc: '简洁明快，适合日常写作',
    preview: 'https://mdnice.com/static/img/theme/2.png',
    content: '# 丘比特忙模板\n\n> 这里是丘比特忙模板示例内容...',
    category: '日常'
  },
  {
    id: 3,
    name: '雁栖湖',
    desc: '适合技术文章，结构分明',
    preview: 'https://mdnice.com/static/img/theme/3.png',
    content: '# 雁栖湖模板\n\n> 这里是雁栖湖模板示例内容...',
    category: '技术'
  },
];

const categories = [
  { label: '全部', value: 'all' },
  { label: '公众号', value: '公众号' },
  { label: '技术', value: '技术' },
  { label: '日常', value: '日常' },
  { label: '其他', value: '其他' }
];

const getFavoriteIds = () => JSON.parse(localStorage.getItem('favorite-templates') || '[]');
const setFavoriteIds = (ids) => localStorage.setItem('favorite-templates', JSON.stringify(ids));
const getMyTemplates = () => JSON.parse(localStorage.getItem('my-templates') || '[]');
const setMyTemplates = (list) => localStorage.setItem('my-templates', JSON.stringify(list));

const sortOptions = [
  { label: '最新创建', value: 'newest' },
  { label: '最早创建', value: 'oldest' },
  { label: '名称升序', value: 'nameAsc' },
  { label: '名称降序', value: 'nameDesc' },
  { label: '使用次数', value: 'usage' }
];

const TemplateModal = ({ open, onClose, onApply }) => {
  const [favoriteIds, setFavoriteIdsState] = useState(getFavoriteIds());
  const [tab, setTab] = useState('all');
  const [myTemplates, setMyTemplatesState] = useState(getMyTemplates());
  const [editModal, setEditModal] = useState(false);
  const [editTpl, setEditTpl] = useState(null);
  const [form] = Form.useForm();
  const [previewModal, setPreviewModal] = useState(false);
  const [previewTpl, setPreviewTpl] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTags, setSelectedTags] = useState([]);
  const [previewTheme, setPreviewTheme] = useState('light');

  useEffect(() => {
    setFavoriteIdsState(getFavoriteIds());
    setMyTemplatesState(getMyTemplates());
  }, [open]);

  const handleFavorite = (id) => {
    let ids = getFavoriteIds();
    if (ids.includes(id)) {
      ids = ids.filter(f => f !== id);
    } else {
      ids = [id, ...ids];
    }
    setFavoriteIds(ids);
    setFavoriteIdsState(ids);
  };

  // 新建/编辑模板
  const openEdit = (tpl = null) => {
    setEditTpl(tpl);
    setEditModal(true);
    if (tpl) {
      form.setFieldsValue(tpl);
    } else {
      form.resetFields();
    }
  };
  const handleEditOk = () => {
    form.validateFields().then(values => {
      let list = getMyTemplates();
      if (editTpl) {
        // 编辑
        list = list.map(t => t.id === editTpl.id ? { ...editTpl, ...values } : t);
      } else {
        // 新建
        const id = Date.now();
        list = [{ ...values, id }, ...list];
      }
      setMyTemplates(list);
      setMyTemplatesState(list);
      setEditModal(false);
      message.success(editTpl ? '模板已更新' : '模板已创建');
    });
  };
  const handleEditCancel = () => {
    setEditModal(false);
  };
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除该模板？',
      onOk: () => {
        const list = getMyTemplates().filter(t => t.id !== id);
        setMyTemplates(list);
        setMyTemplatesState(list);
        message.success('模板已删除');
      }
    });
  };

  // 打开预览
  const openPreview = (tpl) => {
    setPreviewTpl(tpl);
    setPreviewModal(true);
  };
  const closePreview = () => {
    setPreviewModal(false);
    setPreviewTpl(null);
  };

  // 处理模板导入
  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const templates = JSON.parse(e.target.result);
        if (Array.isArray(templates)) {
          const list = getMyTemplates();
          const newTemplates = templates.map(t => ({
            ...t,
            id: Date.now() + Math.random()
          }));
          setMyTemplates([...newTemplates, ...list]);
          setMyTemplatesState([...newTemplates, ...list]);
          message.success('模板导入成功');
        } else {
          message.error('无效的模板文件格式');
        }
      } catch (err) {
        message.error('模板文件解析失败');
      }
    };
    reader.readAsText(file);
    return false;
  };

  // 处理模板导出
  const handleExport = () => {
    const templates = getMyTemplates();
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 获取所有标签
  const getAllTags = () => {
    const tags = new Set();
    [...defaultTemplates, ...myTemplates].forEach(tpl => {
      if (tpl.tags) {
        tpl.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  };

  // 排序模板
  const sortTemplates = (templates) => {
    return [...templates].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0);
        default:
          return 0;
      }
    });
  };

  // 过滤模板
  const filterTemplates = (templates) => {
    return templates.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         t.desc.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchTags = selectedTags.length === 0 || 
                       (t.tags && selectedTags.every(tag => t.tags.includes(tag)));
      return matchSearch && matchCategory && matchTags;
    });
  };

  // 处理模板使用
  const handleApply = (tpl) => {
    // 更新使用次数
    if (tpl.id > 1000) { // 只统计自定义模板
      const list = getMyTemplates();
      const updatedList = list.map(t => {
        if (t.id === tpl.id) {
          return { ...t, usageCount: (t.usageCount || 0) + 1 };
        }
        return t;
      });
      setMyTemplates(updatedList);
      setMyTemplatesState(updatedList);
    }
    onApply(tpl);
  };

  // 渲染标签选择器
  const renderTagSelector = () => {
    const allTags = getAllTags();
    return (
      <Select
        mode="multiple"
        placeholder="选择标签"
        value={selectedTags}
        onChange={setSelectedTags}
        style={{ width: 200 }}
        maxTagCount={3}
        options={allTags.map(tag => ({ label: tag, value: tag }))}
      />
    );
  };

  // 渲染排序下拉菜单
  const renderSortMenu = () => (
    <Menu
      items={sortOptions.map(opt => ({
        key: opt.value,
        label: opt.label,
        onClick: () => setSortBy(opt.value)
      }))}
    />
  );

  const allTemplates = [...defaultTemplates, ...myTemplates];
  const favoriteTemplates = allTemplates.filter(t => favoriteIds.includes(t.id));
  const myTabTemplates = [...favoriteTemplates, ...myTemplates.filter(t => !favoriteIds.includes(t.id))];

  const filteredDefaultTemplates = sortTemplates(filterTemplates(defaultTemplates));
  const filteredMyTemplates = sortTemplates(filterTemplates(myTabTemplates));

  return (
    <Modal
      open={open}
      title="选择排版模板"
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="搜索模板"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories}
            style={{ width: 120 }}
          />
          {renderTagSelector()}
          <Dropdown overlay={renderSortMenu()} trigger={['click']}>
            <Button icon={sortBy.includes('Desc') ? <SortDescendingOutlined /> : <SortAscendingOutlined />}>
              {sortOptions.find(opt => opt.value === sortBy)?.label || '排序'}
            </Button>
          </Dropdown>
        </Space>
        <Space>
          <Upload
            accept=".json"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<ImportOutlined />}>导入模板</Button>
          </Upload>
          <Button icon={<ExportOutlined />} onClick={handleExport}>导出模板</Button>
        </Space>
      </Space>

      <Tabs activeKey={tab} onChange={setTab} items={[
        {
          key: 'all',
          label: '推荐',
          children: (
            <Row gutter={[24, 24]}>
              {filteredDefaultTemplates.map(tpl => (
                <Col span={8} key={tpl.id}>
                  <Card
                    hoverable
                    cover={<img alt={tpl.name} src={tpl.preview} style={{ height: 120, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} onClick={() => openPreview(tpl)} />}
                    actions={[
                      <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApply(tpl)}>
                        使用
                      </Button>,
                      <Tooltip title={favoriteIds.includes(tpl.id) ? '取消收藏' : '收藏'}>
                        <Button
                          icon={favoriteIds.includes(tpl.id) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                          type="text"
                          onClick={() => handleFavorite(tpl.id)}
                        />
                      </Tooltip>,
                      <Tooltip title="预览">
                        <Button icon={<EyeOutlined />} type="text" onClick={() => openPreview(tpl)} />
                      </Tooltip>
                    ]}
                  >
                    <Card.Meta
                      title={<span>{tpl.name} <Tag color="blue">推荐</Tag></span>}
                      description={
                        <div>
                          <div style={{ color: '#888', fontSize: 13 }}>{tpl.desc}</div>
                          <Tag color="purple" style={{ marginTop: 8 }}>{tpl.category}</Tag>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )
        },
        {
          key: 'favorite',
          label: '我的模板',
          children: (
            <>
              <Button icon={<PlusOutlined />} type="dashed" style={{ marginBottom: 16 }} onClick={() => openEdit()}>新建模板</Button>
              <Row gutter={[24, 24]}>
                {filteredMyTemplates.length === 0 && <div style={{ color: '#aaa', padding: 32 }}>暂无收藏或自定义模板</div>}
                {filteredMyTemplates.map(tpl => (
                  <Col span={8} key={tpl.id}>
                    <Card
                      hoverable
                      cover={<img alt={tpl.name} src={tpl.preview} style={{ height: 120, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} onClick={() => openPreview(tpl)} />}
                      actions={[
                        <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApply(tpl)}>
                          使用
                        </Button>,
                        <Tooltip title={favoriteIds.includes(tpl.id) ? '取消收藏' : '收藏'}>
                          <Button
                            icon={favoriteIds.includes(tpl.id) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                            type="text"
                            onClick={() => handleFavorite(tpl.id)}
                          />
                        </Tooltip>,
                        tpl.id > 1000 && (
                          <Tooltip title="编辑模板">
                            <Button icon={<EditOutlined />} type="text" onClick={() => openEdit(tpl)} />
                          </Tooltip>
                        ),
                        tpl.id > 1000 && (
                          <Tooltip title="删除模板">
                            <Button icon={<DeleteOutlined />} type="text" danger onClick={() => handleDelete(tpl.id)} />
                          </Tooltip>
                        ),
                        <Tooltip title="预览">
                          <Button icon={<EyeOutlined />} type="text" onClick={() => openPreview(tpl)} />
                        </Tooltip>
                      ].filter(Boolean)}
                    >
                      <Card.Meta
                        title={<span>{tpl.name} <Tag color={tpl.id > 1000 ? 'green' : 'gold'}>{tpl.id > 1000 ? '自定义' : '我的收藏'}</Tag></span>}
                        description={
                          <div>
                            <div style={{ color: '#888', fontSize: 13 }}>{tpl.desc}</div>
                            <Tag color="purple" style={{ marginTop: 8 }}>{tpl.category}</Tag>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )
        }
      ]} />

      {/* 模板内容预览弹窗 */}
      <Modal
        open={previewModal}
        title={previewTpl ? `模板预览 - ${previewTpl.name}` : '模板预览'}
        onCancel={closePreview}
        footer={[
          <Button key="theme" onClick={() => setPreviewTheme(theme => theme === 'light' ? 'dark' : 'light')}>
            切换{previewTheme === 'light' ? '暗色' : '亮色'}主题
          </Button>,
          <Button key="close" onClick={closePreview}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div style={{ 
          background: previewTheme === 'light' ? '#f6f7fb' : '#1f1f1f',
          borderRadius: 8,
          padding: 24,
          minHeight: 400
        }}>
          <MDEditor.Markdown 
            source={previewTpl?.content || ''} 
            style={{ 
              background: 'none',
              color: previewTheme === 'light' ? 'inherit' : '#fff'
            }} 
          />
        </div>
      </Modal>

      {/* 新建/编辑模板弹窗 */}
      <Modal
        open={editModal}
        title={editTpl ? '编辑模板' : '新建模板'}
        onCancel={handleEditCancel}
        onOk={handleEditOk}
        okText="保存"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}> <Input /> </Form.Item>
          <Form.Item name="desc" label="模板描述"> <Input /> </Form.Item>
          <Form.Item name="category" label="模板分类" rules={[{ required: true, message: '请选择模板分类' }]}>
            <Select options={categories.filter(c => c.value !== 'all')} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="输入标签后按回车"
              tokenSeparators={[',']}
            />
          </Form.Item>
          <Form.Item name="preview" label="预览图片URL" rules={[{ required: true, message: '请输入图片URL' }]}> <Input /> </Form.Item>
          <Form.Item name="content" label="模板内容" rules={[{ required: true, message: '请输入模板内容' }]}> <Input.TextArea rows={6} /> </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default TemplateModal; 