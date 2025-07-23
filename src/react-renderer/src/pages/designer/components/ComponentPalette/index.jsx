import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, Collapse } from 'antd';
import { BASE_COMPONENTS } from '../../config';
import styles from './style.module.scss';
import { CSS } from '@dnd-kit/utilities'
import { useDndMonitor } from '@dnd-kit/core';
import { useState } from 'react';

const { Panel } = Collapse;

const DraggableComponent = ({ component }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `draggable-${component.type}`,
    data: {
      type: component.type,
      defaultProps: component.defaultProps,
    },
  });

  const style = {
    opacity: isDragging ? 0.4 : 1,
    // transform: CSS.Transform.toString(transform),
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={styles.componentItem}
    >
      {component.name}
    </div>
  );
};

const ComponentPalette = () => {
  // 按类别分组组件
  const groupedComponents = BASE_COMPONENTS.reduce((acc, component) => {
    const category = component.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {});

  const categoryNames = {
    layout: '布局组件',
    form: '表单组件',
    display: '展示组件',
    other: '其他组件',
  };

  const [dragOverId, setDragOverId] = useState(null);

  useDndMonitor({
    onDragOver(event) {
      setDragOverId(event.over?.id || null);
    },
    onDragEnd() {
      setDragOverId(null);
    }
  });

  // 计算插入占位符的位置
  const renderWithPlaceholder = () => {
    const items = [];
    Object.entries(groupedComponents).forEach(([category, components]) => {
      items.push(
        <Panel header={categoryNames[category] || category} key={category}>
          <div className={styles.componentList}>
            {components.map((component) => {
              if (dragOverId === component.type) {
                return <Placeholder key="placeholder" />;
              }
              return <DraggableComponent key={component.type} component={component} />;
            })}
          </div>
        </Panel>
      );
    });
    // 拖到空白区
    if (dragOverId === 'canvas-droppable') {
      items.push(<Placeholder key="placeholder-end" />);
    }
    return items;
  };

  return (
    <div className={styles.componentPalette}>
      <Collapse defaultActiveKey={['layout', 'form', 'display']} ghost>
        {renderWithPlaceholder()}
      </Collapse>
    </div>
  );
};

// 占位节点样式
const Placeholder = () => (
  <div className={styles.placeholder}></div>
);

export default ComponentPalette; 