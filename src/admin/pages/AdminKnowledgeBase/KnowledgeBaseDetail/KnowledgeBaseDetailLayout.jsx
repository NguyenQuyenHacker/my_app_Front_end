/* src/admin/pages/AdminKnowledgeBase/KnowledgeBaseDetail/KnowledgeBaseDetailLayout.jsx */
import React, { useState, useEffect } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Loader2 } from 'lucide-react';
import styles from './KnowledgeBaseDetailLayout.module.css';
import KnowledgeBaseInnerNav from './KnowledgeBaseInnerNav';
import { getKnowledgeBases } from '../../../api/knowledge_baseApi';

const KnowledgeBaseDetailLayout = () => {
  const { kbId } = useParams();
  const [kb, setKb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKbData = async () => {
      try {
        setIsLoading(true);
        const data = await getKnowledgeBases();
        const foundKb = data.find(k => k.kb_id === kbId);
        
        if (foundKb) {
          setKb({
            id: foundKb.kb_id,
            name: foundKb.name,
            description: foundKb.description,
            chunk_size: foundKb.chunk_size,
            chunk_overlap: foundKb.chunk_overlap
          });
        }
      } catch (error) {
        console.error("Failed to fetch KB metadata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKbData();
  }, [kbId]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
        <span>Loading...</span>
      </div>
    );
  }

  if (!kb) {
    return <div className={styles.errorState}>Knowledge Base not found</div>;
  }


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link to="/admin/knowledge-bases" className={styles.backLink}>
            <ChevronLeft size={20} />
            <span>Knowledge Bases</span>
          </Link>
          <span className={styles.separator}>/</span>
          <span className={styles.currentKb}>{kb.name}</span>
        </div>

        <div className={styles.kbInfo}>
          <div className={styles.titleArea}>
            <h1 className={styles.kbName}>{kb.name}</h1>
            <div className={styles.idBadge}>ID: {kb.id}</div>
          </div>
          <p className={styles.kbDesc}>{kb.description}</p>
        </div>

        <KnowledgeBaseInnerNav />
      </header>

      <main className={styles.content}>
        <Outlet context={{ kb, setKb }} />
      </main>
    </div>
  );
};

export default KnowledgeBaseDetailLayout;
