import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Xác nhận xóa", 
  message = "Bạn có chắc chắn muốn thực hiện hành động này?", 
  confirmText = "Xác nhận", 
  cancelText = "Hủy",
  isDanger = true,
  isLoading = false,
  error = null
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={styles.content}>
          <div className={`${styles.iconWrapper} ${isDanger ? styles.danger : styles.primary}`}>
            <AlertTriangle size={32} />
          </div>
          
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>

          {error && (
            <div className={styles.errorContainer}>
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.confirmBtn} ${isDanger ? styles.dangerBtn : styles.primaryBtn}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Đang xử lý...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
