import { create } from 'zustand';
import { nanoid } from 'nanoid';

const useDesignerStore = create((set, get) => ({
  // 表单配置
  formConfig: {
    name: '未命名表单',
    description: '',
  },

  // 组件树结构
  components: [],

  // 当前选中的组件ID
  selectedComponentId: null,

  // 更新表单配置
  updateFormConfig: (config) =>
    set((state) => ({
      formConfig: {
        ...state.formConfig,
        ...config,
      },
    })),

  // 添加组件到指定位置
  addComponent: (componentData, parentId = null, index = -1) =>
    set((state) => {
      const newComponent = {
        id: nanoid(),
        ...componentData,
        children: [],
      };

      // 如果没有指定父组件，添加到根级别
      if (!parentId) {
        const newComponents = [...state.components];
        if (index === -1) {
          newComponents.push(newComponent);
        } else {
          newComponents.splice(index, 0, newComponent);
        }
        return { components: newComponents };
      }

      // 递归查找父组件并添加子组件
      const updateComponentTree = (components) => {
        return components.map((comp) => {
          if (comp.id === parentId) {
            const children = [...comp.children];
            if (index === -1) {
              children.push(newComponent);
            } else {
              children.splice(index, 0, newComponent);
            }
            return { ...comp, children };
          }
          if (comp.children.length > 0) {
            return { ...comp, children: updateComponentTree(comp.children) };
          }
          return comp;
        });
      };

      return {
        components: updateComponentTree(state.components),
      };
    }),

  // 更新组件
  updateComponent: (id, data) =>
    set((state) => {
      const updateComponentInTree = (components) => {
        return components.map((comp) => {
          if (comp.id === id) {
            return { ...comp, ...data };
          }
          if (comp.children.length > 0) {
            return { ...comp, children: updateComponentInTree(comp.children) };
          }
          return comp;
        });
      };

      return {
        components: updateComponentInTree(state.components),
      };
    }),

  // 删除组件
  removeComponent: (id) =>
    set((state) => {
      const removeComponentFromTree = (components) => {
        return components.filter((comp) => {
          if (comp.id === id) {
            return false;
          }
          if (comp.children.length > 0) {
            comp.children = removeComponentFromTree(comp.children);
          }
          return true;
        });
      };

      return {
        components: removeComponentFromTree(state.components),
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
      };
    }),

  // 移动组件
  moveComponent: (dragId, dropId, dropIndex = -1) =>
    set((state) => {
      let draggedComponent = null;
      let draggedParentId = null;
      let draggedIndex = -1;

      // 查找被拖拽的组件和其父组件
      const findDraggedComponent = (components, parentId = null) => {
        for (let i = 0; i < components.length; i++) {
          if (components[i].id === dragId) {
            draggedComponent = components[i];
            draggedParentId = parentId;
            draggedIndex = i;
            return true;
          }
          if (components[i].children.length > 0) {
            if (findDraggedComponent(components[i].children, components[i].id)) {
              return true;
            }
          }
        }
        return false;
      };

      findDraggedComponent(state.components);

      if (!draggedComponent) {
        return state;
      }

      // 从原位置移除组件
      const removeFromOriginal = (components) => {
        if (draggedParentId === null) {
          return components.filter((_, index) => index !== draggedIndex);
        }
        return components.map((comp) => {
          if (comp.id === draggedParentId) {
            return {
              ...comp,
              children: comp.children.filter((_, index) => index !== draggedIndex),
            };
          }
          if (comp.children.length > 0) {
            return { ...comp, children: removeFromOriginal(comp.children) };
          }
          return comp;
        });
      };

      // 添加到新位置
      const addToTarget = (components) => {
        if (dropId === null) {
          const newComponents = [...components];
          if (dropIndex === -1) {
            newComponents.push(draggedComponent);
          } else {
            newComponents.splice(dropIndex, 0, draggedComponent);
          }
          return newComponents;
        }

        return components.map((comp) => {
          if (comp.id === dropId) {
            const children = [...comp.children];
            if (dropIndex === -1) {
              children.push(draggedComponent);
            } else {
              children.splice(dropIndex, 0, draggedComponent);
            }
            return { ...comp, children };
          }
          if (comp.children.length > 0) {
            return { ...comp, children: addToTarget(comp.children) };
          }
          return comp;
        });
      };

      const componentsAfterRemove = removeFromOriginal(state.components);
      const finalComponents = addToTarget(componentsAfterRemove);

      return {
        components: finalComponents,
      };
    }),

  // 设置选中组件
  setSelectedComponentId: (id) =>
    set({
      selectedComponentId: id,
    }),
}));

export default useDesignerStore; 