import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Loader2 } from 'lucide-react';
import styles from './KnowledgeBaseListPage.module.css';
import KnowledgeBaseCard from './components/KnowledgeBaseCard';
import CreateKnowledgeBaseModal from './components/CreateKnowledgeBaseModal';
import { getKnowledgeBases, createKnowledgeBase } from '../../api/knowledge_baseApi';

const KnowledgeBaseListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchKBs = async () => {
      try {
        setIsLoading(true);
        const data = await getKnowledgeBases();
        
        // Map backend data to frontend format
        const mappedData = data.map(kb => ({
          id: kb.kb_id,
          name: kb.name,
          creator: kb.admin_name,
          documentCount: kb.document_count,
          updatedAt: new Date(kb.updated_at).toLocaleDateString('vi-VN'),
          description: kb.description
        }));
        
        setKnowledgeBases(mappedData);
      } catch (error) {
        console.error("Failed to fetch knowledge bases:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKBs();
  }, []);

  const handleCreateKB = async (formData) => {
    try {
      await createKnowledgeBase(formData);
      // Refresh list
      const data = await getKnowledgeBases();
      const mappedData = data.map(kb => ({
        id: kb.kb_id,
        name: kb.name,
        creator: kb.admin_name,
        documentCount: kb.document_count,
        updatedAt: new Date(kb.updated_at).toLocaleDateString('vi-VN'),
        description: kb.description
      }));
      setKnowledgeBases(mappedData);
    } catch (error) {
      console.error("Failed to create knowledge base:", error);
      throw error; // Re-throw so modal can handle loading state/error
    }
  };

  const filteredKBs = knowledgeBases.filter(kb => 
    kb.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Knowledge Bases</h1>
          <p className={styles.subtitle}>Quản lý và tổ chức toàn bộ kho tri thức của hệ thống RAG.</p>
        </div>
        
        <button className={styles.createBtn} onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} />
          <span>Create Knowledge Base</span>
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search knowledge bases..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.iconBtn}>
            <Filter size={18} />
          </button>
          <div className={styles.divider} />
          <div className={styles.viewToggle}>
            <button className={`${styles.iconBtn} ${styles.activeView}`}>
              <LayoutGrid size={18} />
            </button>
            <button className={styles.iconBtn}>
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} />
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredKBs.length > 0 ? (
            filteredKBs.map(kb => (
              <KnowledgeBaseCard key={kb.id} kb={kb} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Không tìm thấy Knowledge Base nào.</p>
            </div>
          )}
        </div>
      )}

      <CreateKnowledgeBaseModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateKB}
      />
    </div>
  );
};

export default KnowledgeBaseListPage;
