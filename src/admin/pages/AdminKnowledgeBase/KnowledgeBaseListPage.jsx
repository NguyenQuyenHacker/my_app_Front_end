import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, LayoutGrid, List, Loader2, Trash2, User } from 'lucide-react';
import styles from './KnowledgeBaseListPage.module.css';
import KnowledgeBaseCard from './components/KnowledgeBaseCard';
import CreateKnowledgeBaseModal from './components/CreateKnowledgeBaseModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import {
  getKnowledgeBases,
  createKnowledgeBase,
  toggleKnowledgeBaseStatus,
  deleteKnowledgeBase,
} from '../../api/knowledge_baseApi';

const mapKB = (kb) => ({
  id: kb.kb_id,
  name: kb.name,
  creator: kb.admin_name,
  documentCount: kb.document_count,
  updatedAt: new Date(kb.updated_at).toLocaleDateString('vi-VN'),
  description: kb.description,
  isActive: kb.is_active,
});

const KnowledgeBaseListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [kbToDelete, setKbToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rawKBs = [], isLoading } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: getKnowledgeBases,
  });
  const knowledgeBases = useMemo(() => rawKBs.map(mapKB), [rawKBs]);

  const createMutation = useMutation({
    mutationFn: createKnowledgeBase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ kbId, isActive }) => toggleKnowledgeBaseStatus(kbId, isActive),
    onMutate: async ({ kbId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['knowledgeBases'] });
      const prev = queryClient.getQueryData(['knowledgeBases']);
      queryClient.setQueryData(['knowledgeBases'], (old) =>
        old?.map((kb) => (kb.kb_id === kbId ? { ...kb, is_active: isActive } : kb))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['knowledgeBases'], ctx.prev);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
      setKbToDelete(null);
      setDeleteError(null);
    },
    onError: (err) => {
      setDeleteError(err?.response?.data?.detail || 'Không thể xoá Knowledge Base.');
    },
  });

  const handleCreateKB = async (formData) => {
    await createMutation.mutateAsync(formData);
  };

  const handleToggleKB = (kbId, newStatus) => {
    toggleMutation.mutate({ kbId, isActive: newStatus });
  };

  const handleRequestDelete = (kb) => {
    setDeleteError(null);
    setKbToDelete(kb);
  };

  const handleConfirmDelete = () => {
    if (kbToDelete) {
      deleteMutation.mutate(kbToDelete.id);
    }
  };

  const handleCloseDelete = () => {
    if (deleteMutation.isPending) return;
    setKbToDelete(null);
    setDeleteError(null);
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
                  <KnowledgeBaseCard
                    key={kb.id}
                    kb={kb}
                    onToggle={handleToggleKB}
                    onDelete={handleRequestDelete}
                  />
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
                          <button
                            className={styles.iconBtn}
                            style={{ border: 'none', background: 'transparent', color: '#94a3b8' }}
                            title="Xoá Knowledge Base"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestDelete(kb);
                            }}
                          >
                            <Trash2 size={16} />
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

      <ConfirmModal
        isOpen={!!kbToDelete}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Xoá Knowledge Base"
        message={
          kbToDelete
            ? `Bạn có chắc muốn xoá "${kbToDelete.name}"? Toàn bộ documents và vector table sẽ bị xoá vĩnh viễn và không thể khôi phục.`
            : ''
        }
        confirmText="Xoá vĩnh viễn"
        isLoading={deleteMutation.isPending}
        error={deleteError}
      />
    </div>
  );
};

export default KnowledgeBaseListPage;
