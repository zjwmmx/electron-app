import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Empty, Form } from 'antd';
import useDesignerStore from '../../store';
import FormItemRender from '../FormItemRender';
import styles from './style.module.scss';

// 可排序+可放置的根组件项
const SortableDroppableItem = ({ component }) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: component.id });
  const { components, selectedComponentId } = useDesignerStore();

  // 合并 sortable 和 droppable 的 ref
  const setRef = (node) => {
    setSortableRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 1 : 1,
    zIndex: isDragging ? 100 : 'auto',
    // background: isDragging ? 'rgba(70, 166, 255, 1)' : undefined,
  };
console.log('components', selectedComponentId)
  // 判断是否需要显示插入线
  // 仅在拖拽时，且当前项为目标插入点时显示
  // 这里假设 isOver 就是插入点（如需更精细可结合 activeId、overId 判断）
  return (
    <div
      ref={setRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.sortableItem} ${
        useDesignerStore.getState().selectedComponentId === component.id ? styles.selected : ''
      }`}
      data-id={component.id}
    >
      {isOver && selectedComponentId?.startsWith('draggable-') && <div className={styles.dropIndicator}></div>}
      <FormItemRender component={component} />
    </div>
  );
};

const Canvas = () => {
  const { components, selectedComponentId, setSelectedComponentId } = useDesignerStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-droppable' });

  const handleComponentClick = (e) => {
    e.stopPropagation();
    const componentEl = e.target.closest('[data-id]');
    console.log('componentEl', componentEl)
    if (componentEl) {
      const id = componentEl.getAttribute('data-id');
      setSelectedComponentId(id);
    }
  };

  const handleCanvasClick = () => {
    setSelectedComponentId(null);
  };

  return (
    <div className={styles.canvas} onClick={handleCanvasClick}>
      <div
        ref={setNodeRef}
        className={`${styles.canvasInner} ${isOver ? styles.isOver : ''}`}
        onClick={handleComponentClick}
      >
        {components.length > 0 ? (
          <Form layout="vertical" className={styles.form}>
            <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {components.map((comp) => (
                <SortableDroppableItem key={comp.id} component={comp} />
              ))}
            </SortableContext>
          </Form>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="拖拽组件到此处开始设计表单"
          />
        )}
      </div>
    </div>
  );
};

export default Canvas; 