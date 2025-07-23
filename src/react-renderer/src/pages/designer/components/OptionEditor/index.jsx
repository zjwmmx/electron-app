import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './style.module.scss';

const OptionEditor = ({ value = [], onChange }) => {
  const handleAdd = () => {
    onChange([...value, { label: '', value: '' }]);
  };

  const handleRemove = (index) => {
    const newOptions = [...value];
    newOptions.splice(index, 1);
    onChange(newOptions);
  };

  const handleChange = (index, key, val) => {
    const newOptions = [...value];
    newOptions[index] = {
      ...newOptions[index],
      [key]: val,
    };
    onChange(newOptions);
  };

  return (
    <div className={styles.optionEditor}>
      {value.map((option, index) => (
        <div key={index} className={styles.optionItem}>
          <Space>
            <Form.Item label="选项文本" className={styles.formItem}>
              <Input
                value={option.label}
                onChange={(e) => handleChange(index, 'label', e.target.value)}
                placeholder="请输入选项文本"
              />
            </Form.Item>
            <Form.Item label="选项值" className={styles.formItem}>
              <Input
                value={option.value}
                onChange={(e) => handleChange(index, 'value', e.target.value)}
                placeholder="请输入选项值"
              />
            </Form.Item>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleRemove(index)}
              className={styles.deleteBtn}
            />
          </Space>
        </div>
      ))}
      <Button
        type="dashed"
        onClick={handleAdd}
        icon={<PlusOutlined />}
        className={styles.addButton}
      >
        添加选项
      </Button>
    </div>
  );
};

export default OptionEditor; 