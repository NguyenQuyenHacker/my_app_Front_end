/* src/admin/pages/AdminKnowledgeBase/components/KnowledgeBaseCard.jsx */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, User, ChevronRight } from 'lucide-react';
import styles from './KnowledgeBaseCard.module.css';

const KnowledgeBaseCard = ({ kb }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/admin/knowledge-bases/${kb.id}/documents`);
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <FileText size={24} color="#e50020" />
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{kb.name}</h3>
        <p className={styles.description}>{kb.description}</p>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <FileText size={14} />
            <span>{kb.documentCount} docs</span>
          </div>
          <div className={styles.statItem}>
            <User size={14} />
            <span>{kb.creator}</span>
          </div>
        </div>
        <div className={styles.date}>
          <Calendar size={14} />
          <span>{kb.updatedAt}</span>
        </div>
      </div>

      <div className={styles.hoverOverlay}>
        <span>Manage Knowledge Base</span>
        <ChevronRight size={18} />
      </div>
    </div>
  );
};

export default KnowledgeBaseCard;
