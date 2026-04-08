import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import styles from './CreateKnowledgeBaseModal.module.css';

const CreateKnowledgeBaseModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    table_name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate table_name from name 
    if (name === 'name' && (!formData.table_name || formData.table_name === formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''))) {
      const generatedTable = value
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
        
      setFormData(prev => ({ ...prev, [name]: value, table_name: generatedTable }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      onClose();
      setFormData({ name: '', table_name: '', description: '' });
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create Knowledge Base</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name <span className={styles.required}>*</span></label>
            <input 
              type="text"
              name="name"
              className={styles.input}
              placeholder="E.g., Tài liệu Pháp lý 2024"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={255}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Table Name <span className={styles.required}>*</span></label>
            <input 
              type="text"
              name="table_name"
              className={styles.input}
              placeholder="E.g., phap_ly_2024"
              value={formData.table_name}
              onChange={handleChange}
              required
              maxLength={255}
              pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
              title="Table name must start with a letter or underscore, and only contain letters, numbers, and underscores."
            />
            <span className={styles.hint}>
              Đây là tên bảng vật lý dùng để chứa Vector DB (bắt buộc duy nhất, không dấu, không khoảng trắng).
            </span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea 
              name="description"
              className={styles.textarea}
              placeholder="Mô tả tóm tắt nội dung..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting || !formData.name || !formData.table_name}>
              {isSubmitting ? (
                <><Loader2 size={16} className={styles.spinner} /> Creating...</>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKnowledgeBaseModal;
