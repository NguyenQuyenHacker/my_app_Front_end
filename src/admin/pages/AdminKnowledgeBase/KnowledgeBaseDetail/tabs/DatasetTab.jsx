import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, RefreshCw, Trash2, Eye, Loader2 } from 'lucide-react';
import styles from './DatasetTab.module.css';
import { getKnowledgeBaseDocuments } from '../../../../api/knowledge_baseApi';
import FileUploadModal from './FileUploadModal';

const DatasetTab = () => {
  const { kbId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [localDocuments, setLocalDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const data = await getKnowledgeBaseDocuments(kbId);
        setDocuments(data);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [kbId]);

  const allDocuments = [...localDocuments, ...documents];

  const handleUploadSuccess = (newDoc) => {
    setLocalDocuments(prev => [newDoc, ...prev]);
  };

  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('success')) return styles.statusSuccess;
    if (s.includes('processing') || s.includes('waiting')) return styles.statusProcessing;
    if (s.includes('failed') || s.includes('error')) return styles.statusFailed;
    return '';
  };

  const filteredDocuments = allDocuments.filter(doc => 
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.secondaryBtn}>
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className={styles.primaryBtn} onClick={() => setIsUploadModalOpen(true)}>
            <Plus size={18} />
            <span>Add File</span>
          </button>
        </div>
      </div>

      <FileUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        kbId={kbId}
        onUploadSuccess={handleUploadSuccess}
      />

      <div className={styles.tablePanel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
              <th>File Name</th>
              <th>Status</th>
              <th>Chunks</th>
              <th>Upload Date</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className={styles.loadingCell}>
                  <div className={styles.tableLoader}>
                    <Loader2 size={24} className={styles.spinner} />
                    <span>Loading documents...</span>
                  </div>
                </td>
              </tr>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <tr key={doc.document_id}>
                  <td><input type="checkbox" /></td>
                  <td className={styles.fileName}>{doc.file_name}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadgeClass(doc.parsing_status)}`}>
                      {doc.parsing_status}
                    </span>
                  </td>
                  <td className={styles.mono}>{doc.chunk_count}</td>
                  <td>{new Date(doc.upload_date).toLocaleString('vi-VN')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.rowActions}>
                      <button className={styles.iconAction} title="View"><Eye size={16} /></button>
                      <button className={styles.iconAction} title="Re-parse"><RefreshCw size={16} /></button>
                      <button className={styles.iconAction} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.emptyCell}>No documents found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span>Showing 1 to {filteredDocuments.length} of {documents.length} documents</span>
        <div className={styles.pageBtns}>
          <button disabled>Previous</button>
          <button className={styles.activePage}>1</button>
          <button disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

export default DatasetTab;
