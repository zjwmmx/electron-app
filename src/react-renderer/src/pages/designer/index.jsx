import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Layout } from 'antd';
import ComponentPalette from './components/ComponentPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import useDesignerStore from './store';
import { BASE_COMPONENTS } from './config';
import styles from './style.module.scss';
import FormItemRender from './components/FormItemRender';

const ComponentPreview = ({ component }) => {
  if (!component) return null;
  return (
    <div className={styles.dragOverlayPreview}>
      <FormItemRender component={component} isPreview={true} />
    </div>
  );
};

const Designer = () => {
  const { addComponent, updateComponent, components, setSelectedComponentId } = useDesignerStore();
  const [activeId, setActiveId] = useState(null);

  // 配置拖拽传感器
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event) => {
    console.log('event', event)
    setActiveId(event.active.id);
    setSelectedComponentId(event.active.id)
  };

  const findDropIndex = (id) => {
    let newIndex = -1;

    if (id === 'canvas-droppable') {
      newIndex = components.length;
    } else {
      newIndex = components.findIndex(c => c.id === id);
    }
    return newIndex;
  }

  const handleDragEnd = (event) => {
    const { over, active } = event;
    
    if (over) {
      // 拖拽到栅格单元格
      if (over.id.startsWith('cell-')) {
        const [_, gridId, cellIndex] = over.id.split('-');
        const gridComponent = useDesignerStore.getState().components.find(c => c.id === gridId);
        if (gridComponent) {
          const newCells = [...gridComponent.props.cells];
          const targetCell = newCells[parseInt(cellIndex)];
          if (active.id.startsWith('draggable-')) {
            const componentType = active.id.replace('draggable-', '');
            const componentData = {
              type: componentType,
              props: active.data.current.defaultProps,
              id: `${componentType}_${Date.now()}`,
            };
            newCells[parseInt(cellIndex)] = {
              ...targetCell,
              children: [...(targetCell.children || []), componentData],
            };
          } else {
            const sourceCell = newCells.find(cell => cell.children?.some(child => child.id === active.id));
            if (sourceCell) {
              const draggedComponent = sourceCell.children.find(child => child.id === active.id);
              sourceCell.children = sourceCell.children.filter(child => child.id !== active.id);
              if (sourceCell === targetCell) {
                const oldIndex = targetCell.children.findIndex(child => child.id === active.id);
                const newIndex = targetCell.children.findIndex(child => child.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                  const arr = [...targetCell.children];
                  const [movedItem] = arr.splice(oldIndex, 1);
                  arr.splice(newIndex, 0, movedItem);
                  targetCell.children = arr;
                }
              } else {
                targetCell.children = [...(targetCell.children || []), draggedComponent];
              }
            }
          }
          updateComponent(gridId, {
            props: {
              ...gridComponent.props,
              cells: newCells,
            },
          });
        }
      } else {
        // 画布根级排序
        if (active.id.startsWith('draggable-')) {
          // 新组件
          const componentType = active.id.replace('draggable-', '');
          const componentData = {
            type: componentType,
            props: active.data.current.defaultProps,
          };
          const newIndex = findDropIndex(over.id);

          addComponent(componentData, null, newIndex);
        } else if (components.some(c => c.id === active.id)) {
          // 画布内排序
          const oldIndex = components.findIndex(c => c.id === active.id);
          const newIndex = findDropIndex(over.id);
          
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newComponents = [...components];
            const [movedItem] = newComponents.splice(oldIndex, 1);
            // 拖到自己身上不动，拖到最后插入到最后，拖到其他节点插入到目标前
            if (over.id === 'canvas-droppable') {
              newComponents.push(movedItem);
            } else {
              newComponents.splice(newIndex, 0, movedItem);
            }
            useDesignerStore.setState({ components: newComponents });
          }
        }
      }
    }
    setActiveId(null);
  };

  const activeComponent = activeId
    ? BASE_COMPONENTS.find((c) => `draggable-${c.type}` === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Layout className={styles.designer}>
        <Layout.Sider width={220} className={styles.sider}>
          <ComponentPalette />
        </Layout.Sider>
        <Layout.Content className={styles.content}>
          <Canvas />
        </Layout.Content>
        <Layout.Sider width={300} className={styles.sider}>
          <PropertiesPanel />
        </Layout.Sider>
      </Layout>
      <DragOverlay dropAnimation={null}>
        {activeId ? <ComponentPreview component={activeComponent} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Designer;