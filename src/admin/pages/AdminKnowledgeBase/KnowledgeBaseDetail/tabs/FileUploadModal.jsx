import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { X, UploadCloud, File, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import styles from './FileUploadModal.module.css';
import { uploadKnowledgeBaseDocument } from '../../../../api/knowledge_baseApi';

const FileUploadModal = ({ isOpen, onClose, kbId, onUploadSuccess }) => {
  const { kb } = useOutletContext();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setError(null);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const results = [];
      const chunkSize = kb?.chunk_size || 1000;
      const chunkOverlap = kb?.chunk_overlap || 150;

      for (const file of selectedFiles) {
        const response = await uploadKnowledgeBaseDocument(
          kbId, 
          file, 
          chunkSize, 
          chunkOverlap
        );
        
        // Assuming response structure like: { data: { document_id, file_name, ... } }
        if (response && response.data) {
          results.push(response.data);
        }
      }

      // Thông báo cho component cha về danh sách doc mới
      results.forEach(doc => {
        // Map fields from BE to FE format if needed
        const mappedDoc = {
          document_id: doc.document_id,
          kb_id: kbId,
          file_name: doc.file_name,
          parsing_status: doc.parsing_status || 'pending',
          chunk_count: doc.chunk_count || 0,
          upload_date: doc.upload_date || new Date().toISOString()
        };
        onUploadSuccess(mappedDoc);
      });
      
      onClose();
      setSelectedFiles([]);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.detail || "Đã xảy ra lỗi trong quá trình tải lên tệp tin.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <h2 className={styles.title}>Add Documents</h2>
            <p className={styles.subtitle}>Upload files to your knowledge base</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div 
            className={styles.dropzone}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} className={styles.uploadIcon} />
            <div className={styles.dropText}>
              <span className={styles.highlight}>Click to upload</span> or drag and drop
            </div>
            <p className={styles.hint}>Support for PDF, TXT, DOCX, CSV (Max 10MB each)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              multiple 
              onChange={handleFileChange}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className={styles.fileList}>
              <h4 className={styles.listTitle}>Selected Files ({selectedFiles.length})</h4>
              <div className={styles.filesScroll}>
                {selectedFiles.map((file, index) => (
                  <div key={index} className={styles.fileItem}>
                    <div className={styles.fileInfo}>
                      <File size={18} className={styles.docIcon} />
                      <div className={styles.fileMeta}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button 
            className={styles.uploadBtn} 
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Upload {selectedFiles.length > 0 ? `${selectedFiles.length} files` : 'Files'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
