import React from 'react';
import { Empty, Form, Input, Select, Switch, InputNumber, Space, Button } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import useDesignerStore from '../../store';
import { PROPERTY_CONFIG } from '../../config/propertyConfig';
import OptionEditor from '../OptionEditor';
import styles from './style.module.scss';

const PropertyField = ({ config, value, onChange }) => {
  switch (config.component) {
    case 'Input':
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`请输入${config.name}`}
        />
      );
    case 'InputNumber':
      return (
        <InputNumber
          value={value}
          onChange={onChange}
          min={config.min}
          max={config.max}
          step={config.step}
          style={{ width: '100%' }}
        />
      );
    case 'Select':
      return (
        <Select
          value={value}
          onChange={onChange}
          options={config.options}
          placeholder={`请选择${config.name}`}
          style={{ width: '100%' }}
        />
      );
    case 'Switch':
      return <Switch checked={value} onChange={onChange} />;
    case 'OptionEditor':
      return <OptionEditor value={value} onChange={onChange} />;
    default:
      return null;
  }
};

const GridOperations = ({ component, updateComponent }) => {
  const { props } = component;
  const { rows = 1, cols = 2, cells = [] } = props;

  const handleAddRow = () => {
    const newRows = rows + 1;
    const newCells = [...cells];
    // 在现有cells数组末尾添加新行的单元格
    for (let i = 0; i < cols; i++) {
      newCells.push({ children: [] });
    }
    updateComponent(component.id, {
      props: {
        ...props,
        rows: newRows,
        cells: newCells,
      },
    });
  };

  const handleRemoveRow = () => {
    if (rows > 1) {
      const newRows = rows - 1;
      const newCells = cells.slice(0, newRows * cols);
      updateComponent(component.id, {
        props: {
          ...props,
          rows: newRows,
          cells: newCells,
        },
      });
    }
  };

  const handleAddColumn = () => {
    const newCols = cols + 1;
    const newCells = [];
    // 重新组织cells数组，为每行添加一个新列
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < newCols; j++) {
        const oldCellIndex = i * cols + j;
        newCells.push(j < cols ? cells[oldCellIndex] || { children: [] } : { children: [] });
      }
    }
    updateComponent(component.id, {
      props: {
        ...props,
        cols: newCols,
        cells: newCells,
      },
    });
  };

  const handleRemoveColumn = () => {
    if (cols > 1) {
      const newCols = cols - 1;
      const newCells = [];
      // 重新组织cells数组，移除每行的最后一列
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < newCols; j++) {
          const oldCellIndex = i * cols + j;
          newCells.push(cells[oldCellIndex] || { children: [] });
        }
      }
      updateComponent(component.id, {
        props: {
          ...props,
          cols: newCols,
          cells: newCells,
        },
      });
    }
  };

  return (
    <div className={styles.gridOperations}>
      <div className={styles.operationGroup}>
        <div className={styles.operationTitle}>行操作</div>
        <Space>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={handleAddRow}
            title="添加行"
          >
            添加行
          </Button>
          <Button
            type="text"
            icon={<MinusOutlined />}
            onClick={handleRemoveRow}
            disabled={rows <= 1}
            title="删除行"
          >
            删除行
          </Button>
        </Space>
      </div>
      <div className={styles.operationGroup}>
        <div className={styles.operationTitle}>列操作</div>
        <Space>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={handleAddColumn}
            title="添加列"
          >
            添加列
          </Button>
          <Button
            type="text"
            icon={<MinusOutlined />}
            onClick={handleRemoveColumn}
            disabled={cols <= 1}
            title="删除列"
          >
            删除列
          </Button>
        </Space>
      </div>
    </div>
  );
};

const PropertiesPanel = () => {
  const { components, selectedComponentId, updateComponent } = useDesignerStore();
  const selectedComponent = components.find((c) => c.id === selectedComponentId);

  if (!selectedComponent) {
    return (
      <div className={styles.propertiesPanel}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="选择组件以配置属性"
        />
      </div>
    );
  }

  const propertyConfigs = PROPERTY_CONFIG[selectedComponent.type] || [];

  const handlePropertyChange = (key, value) => {
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [key]: value,
      },
    });
  };

  return (
    <div className={styles.propertiesPanel}>
      <Form layout="vertical">
        {propertyConfigs.map((config) => (
          <Form.Item
            key={config.key}
            label={config.name}
            className={styles.formItem}
          >
            <PropertyField
              config={config}
              value={selectedComponent.props[config.key]}
              onChange={(value) => handlePropertyChange(config.key, value)}
            />
          </Form.Item>
        ))}
        {selectedComponent.type === 'Grid' && (
          <GridOperations
            component={selectedComponent}
            updateComponent={updateComponent}
          />
        )}
      </Form>
    </div>
  );
};

export default PropertiesPanel; 