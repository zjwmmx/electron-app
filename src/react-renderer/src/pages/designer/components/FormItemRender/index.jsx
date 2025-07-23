import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Row, Col, Card, Divider, Typography, InputNumber } from 'antd';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useDesignerStore from '../../store';
import styles from './style.module.scss';

const { Text, Title } = Typography;

// 可排序的组件项
const SortableItem = ({ component }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.sortableItem} ${
        useDesignerStore.getState().selectedComponentId === component.id ? styles.selected : ''
      }`}
      data-id={component.id}
    >
      <FormItemRender component={component} />
    </div>
  );
};

// 可放置的单元格组件
const DroppableCell = ({ cellIndex, children, gridId, cell }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${gridId}-${cellIndex}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.cellContent} ${isOver ? styles.isOver : ''}`}
    >
      {cell.children && cell.children.length > 0 ? (
        <SortableContext items={cell.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cell.children.map(child => (
            <SortableItem key={child.id} component={child} />
          ))}
        </SortableContext>
      ) : (
        <div className={styles.emptyCellHint}>
          拖拽组件到此处
        </div>
      )}
    </div>
  );
};

const FormItemRender = ({ component, isPreview = false }) => {
  const { type, props = {}, id } = component;
  const { updateComponent } = useDesignerStore();

  // 当行数或列数改变时，更新单元格配置
  useEffect(() => {
    if (type === 'Grid') {
      const { rows = 1, cols = 2, cells = [] } = props;
      const totalCells = rows * cols;
      
      // 如果单元格数量与行列数不匹配，则更新单元格配置
      if (cells.length !== totalCells) {
        const newCells = Array(totalCells).fill(null).map((_, index) => {
          return cells[index] || { children: [] };
        });
        
        updateComponent(id, {
          props: {
            ...props,
            cells: newCells,
          },
        });
      }
    }
  }, [type, props.rows, props.cols, id]);

  // 渲染栅格布局
  const renderGrid = () => {
    const { rows = 1, cols = 2, gutter = 16, cells = [] } = props;
    const rowArray = Array(rows).fill(null);
    const colArray = Array(cols).fill(null);
    
    return (
      <div className={styles.gridContainer}>
        {rowArray.map((_, rowIndex) => (
          <Row key={rowIndex} gutter={gutter}>
            {colArray.map((_, colIndex) => {
              const cellIndex = rowIndex * cols + colIndex;
              const cell = cells[cellIndex] || { children: [] };
              
              return (
                <Col
                  key={colIndex}
                  span={24 / cols}
                  className={styles.gridCell}
                >
                  <DroppableCell
                    cellIndex={cellIndex}
                    gridId={id}
                    cell={cell}
                  />
                </Col>
              );
            })}
          </Row>
        ))}
      </div>
    );
  };

  // 渲染布局组件
  const renderLayoutComponent = () => {
    switch (type) {
      case 'Grid':
        return renderGrid();
      case 'Card':
        return (
          <Card title={props.title} bordered={props.bordered} className={styles.card}>
            {props.children}
          </Card>
        );
      case 'Divider':
        return <Divider orientation={props.orientation}>{props.text}</Divider>;
      default:
        return null;
    }
  };

  // 渲染展示组件
  const renderDisplayComponent = () => {
    switch (type) {
      case 'Text':
        return <Text type={props.type}>{props.content}</Text>;
      case 'Title':
        return <Title level={props.level}>{props.content}</Title>;
      default:
        return null;
    }
  };

  // 渲染表单组件
  const renderFormComponent = () => {
    const commonProps = {
      disabled: true, // 设计器中的表单组件始终禁用
    };

    switch (type) {
      case 'Input':
        return <Input {...commonProps} placeholder={props.placeholder} />;
      case 'Select':
        return <Select {...commonProps} options={props.options} placeholder={props.placeholder} />;
      case 'DatePicker':
        return <DatePicker {...commonProps} />;
      case 'Button':
        return (
          <Button {...commonProps} type={props.type}>
            {props.text}
          </Button>
        );
      default:
        return null;
    }
  };

  // 根据组件类别选择渲染方法
  const renderComponent = () => {
    if (['Grid', 'Card', 'Divider'].includes(type)) {
      return renderLayoutComponent();
    }
    if (['Text', 'Title'].includes(type)) {
      return renderDisplayComponent();
    }
    return renderFormComponent();
  };

  // 如果是预览模式，直接返回组件
  if (isPreview) {
    return renderComponent();
  }

  // 布局组件和展示组件不需要 Form.Item 包裹
  if (['Grid', 'Card', 'Divider', 'Text', 'Title'].includes(type)) {
    return (
      <div className={styles.componentWrapper} data-id={id}>
        {renderComponent()}
      </div>
    );
  }

  // 表单组件需要 Form.Item 包裹（除了按钮）
  if (type === 'Button') {
    return (
      <div className={styles.buttonWrapper} data-id={id}>
        {renderComponent()}
      </div>
    );
  }

  return (
    <Form.Item
      label={props.label}
      required={props.required}
      className={styles.formItem}
      data-id={id}
    >
      {renderComponent()}
    </Form.Item>
  );
};

export default FormItemRender; 