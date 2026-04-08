import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './ConfigurationTab.module.css';
import { updateKnowledgeBaseConfig } from '../../../../api/knowledge_baseApi';

// Helper: xây dựng state form từ dữ liệu KB
const getFormFromKb = (kb) => ({
  name: kb?.name || '',
  description: kb?.description || '',
  chunkSize: kb?.chunk_size || 1000,
  chunkOverlap: kb?.chunk_overlap || 150,
  topK: 5,
  threshold: 0.5,
});

const ConfigurationTab = () => {
  const { kb, setKb } = useOutletContext();
  const [formData, setFormData] = useState(getFormFromKb(null));
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Khởi tạo / đồng bộ dữ liệu từ context
  useEffect(() => {
    if (kb) setFormData(getFormFromKb(kb));
  }, [kb]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDiscard = () => {
    if (kb) setFormData(getFormFromKb(kb));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    const size = parseInt(formData.chunkSize);
    const overlap = parseInt(formData.chunkOverlap);

    if (isNaN(size) || size < 300 || size > 2000) {
      setError("Chunk size phải từ 300 đến 2000");
      return;
    }
    if (isNaN(overlap) || overlap < 0 || overlap > 400) {
      setError("Chunk overlap phải từ 0 đến 400");
      return;
    }
    if (overlap >= size) {
      setError("Chunk overlap phải nhỏ hơn Chunk size");
      return;
    }

    setIsSaving(true);
    try {
      await updateKnowledgeBaseConfig(kb.id, { chunk_size: size, chunk_overlap: overlap });
      setKb(prev => ({ ...prev, chunk_size: size, chunk_overlap: overlap }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save config:", err);
      setError(err.response?.data?.detail || "Không thể cập nhật cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.tabContent}>
      {showSuccess && (
        <div className={styles.successToast}>
          <CheckCircle size={18} />
          <span>Cập nhật cấu hình thành công!</span>
        </div>
      )}
      {error && (
        <div className={styles.errorToast}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSave}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>General Settings</h3>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Knowledge Base Name</label>
            <input
              name="name"
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              className={styles.textarea}
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Indexing Configuration</h3>
            <div className={styles.tooltip}>
              <Info size={14} />
              <span>These settings affect how documents are processed.</span>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Chunk Size (Tokens)</label>
              <input
                name="chunkSize"
                type="number"
                className={styles.input}
                value={formData.chunkSize}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Chunk Overlap</label>
              <input
                name="chunkOverlap"
                type="number"
                className={styles.input}
                value={formData.chunkOverlap}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Retrieval Settings</h3>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Top K Results</label>
              <input
                name="topK"
                type="number"
                className={styles.input}
                value={formData.topK}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Score Threshold</label>
              <input
                name="threshold"
                type="number"
                step="0.01"
                className={styles.input}
                value={formData.threshold}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleDiscard}
            disabled={isSaving}
          >
            Discard Changes
          </button>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationTab;
