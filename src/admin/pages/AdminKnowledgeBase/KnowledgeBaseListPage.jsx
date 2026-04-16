import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, LayoutGrid, List, Loader2, MoreVertical, User } from 'lucide-react';
import styles from './KnowledgeBaseListPage.module.css';
import KnowledgeBaseCard from './components/KnowledgeBaseCard';
import CreateKnowledgeBaseModal from './components/CreateKnowledgeBaseModal';
import { getKnowledgeBases, createKnowledgeBase, toggleKnowledgeBaseStatus } from '../../api/knowledge_baseApi';

const KnowledgeBaseListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

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
          description: kb.description,
          isActive: kb.is_active
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
        description: kb.description,
        isActive: kb.is_active
      }));
      setKnowledgeBases(mappedData);
    } catch (error) {
      console.error("Failed to create knowledge base:", error);
      throw error; // Re-throw so modal can handle loading state/error
    }
  };

  const handleToggleKB = async (kbId, newStatus) => {
    try {
      await toggleKnowledgeBaseStatus(kbId, newStatus);
      setKnowledgeBases(prev => prev.map(kb => 
        kb.id === kbId ? { ...kb, isActive: newStatus } : kb
      ));
    } catch (error) {
      console.error("Failed to toggle knowledge base:", error);
    }
  };

  const filteredKBs = knowledgeBases
    .filter(kb => kb.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.iconBtn} ${viewMode === 'grid' ? styles.activeView : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={`${styles.iconBtn} ${viewMode === 'list' ? styles.activeView : ''}`}
              onClick={() => setViewMode('list')}
            >
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
        <>
          {viewMode === 'grid' ? (
            <div className={styles.grid}>
              {filteredKBs.length > 0 ? (
                filteredKBs.map(kb => (
                  <KnowledgeBaseCard key={kb.id} kb={kb} onToggle={handleToggleKB} />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Không tìm thấy Knowledge Base nào.</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.listView}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Knowledge Base</th>
                    <th>Creator</th>
                    <th>Documents</th>
                    <th>Last Updated</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKBs.length > 0 ? (
                    filteredKBs.map(kb => (
                      <tr key={kb.id} onClick={() => navigate(`/admin/knowledge-bases/${kb.id}/documents`)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div 
                              className={`${styles.statusDot} ${kb.isActive ? styles.statusActive : styles.statusInactive}`}
                              title={kb.isActive ? 'Active' : 'Inactive'}
                            />
                            <span className={styles.nameLink}>{kb.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.creatorCell}>
                            <div className={styles.avatar}>
                              {kb.creator ? kb.creator.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <span>{kb.creator}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.badge}>{kb.documentCount} docs</span>
                        </td>
                        <td>
                          <span className={styles.dateCell}>{kb.updatedAt}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className={styles.iconBtn} style={{ border: 'none', background: 'transparent' }} onClick={(e) => {
                            e.stopPropagation();
                            // menu action logic could go here
                          }}>
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.emptyCell} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        Không tìm thấy Knowledge Base nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
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
