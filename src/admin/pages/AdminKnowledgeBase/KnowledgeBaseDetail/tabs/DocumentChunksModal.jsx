import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, Database } from 'lucide-react';
import styles from './DocumentChunksModal.module.css';
import { getDocumentChunks } from '../../../../api/knowledge_baseApi';

const DocumentChunksModal = ({ isOpen, onClose, kbId, documentId, fileName }) => {
  const [chunks, setChunks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && kbId && documentId) {
      const fetchChunks = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getDocumentChunks(kbId, documentId);
          setChunks(data || []);
        } catch (err) {
          console.error("Failed to fetch chunks:", err);
          setError("Không thể tải chi tiết chunks. Vui lòng thử lại sau.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchChunks();
    } else {
      setChunks([]);
    }
  }, [isOpen, kbId, documentId]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <h2 className={styles.title}>Document Chunks</h2>
            <div className={styles.subtitle}>
              <FileText size={14} className={styles.icon} />
              <span>{fileName}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <Loader2 size={32} className={styles.spinner} />
              <p>Đang tải dữ liệu vector...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
            </div>
          ) : chunks.length === 0 ? (
            <div className={styles.emptyState}>
              <Database size={48} className={styles.emptyIcon} />
              <p>Tài liệu này chưa có chunk nào, hoặc chưa được xử lý thành công.</p>
            </div>
          ) : (
            <div className={styles.chunksList}>
              <div className={styles.summaryBadge}>
                Tổng số lượng: <strong>{chunks.length} chunks</strong>
              </div>
              {chunks.map((chunk, index) => (
                <div key={index} className={styles.chunkCard}>
                  <div className={styles.chunkHeader}>
                    <span className={styles.chunkIndex}>#{index + 1}</span>
                    <span className={styles.chunkLength}>{chunk.length} ký tự</span>
                  </div>
                  <div className={styles.chunkContent}>
                    {chunk}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentChunksModal;
