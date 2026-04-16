/* src/admin/pages/AdminKnowledgeBase/components/KnowledgeBaseCard.jsx */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, User, ChevronRight, Power } from 'lucide-react';
import styles from './KnowledgeBaseCard.module.css';

const KnowledgeBaseCard = ({ kb, onToggle }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/admin/knowledge-bases/${kb.id}/documents`);
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle(kb.id, !kb.isActive);
    }
  };

  return (
    <div className={`${styles.card} ${!kb.isActive ? styles.cardDisabled : ''}`} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <FileText size={24} color={kb.isActive ? "#e50020" : "#94a3b8"} />
        </div>
        <div 
          className={`${styles.toggle} ${kb.isActive ? styles.toggleActive : ''}`}
          onClick={handleToggleClick}
          title={kb.isActive ? "Disable Knowledge Base" : "Enable Knowledge Base"}
        >
          <div className={styles.toggleHandle} />
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
