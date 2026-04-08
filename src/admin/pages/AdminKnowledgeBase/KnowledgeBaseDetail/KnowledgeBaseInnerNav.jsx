/* src/admin/pages/AdminKnowledgeBase/KnowledgeBaseDetail/KnowledgeBaseInnerNav.jsx */
import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Database, Zap, Settings } from 'lucide-react';
import styles from './KnowledgeBaseDetailLayout.module.css';

const KnowledgeBaseInnerNav = () => {
  const { kbId } = useParams();

  const navItems = [
    { to: `/admin/knowledge-bases/${kbId}/documents`, label: 'Dataset', icon: Database, end: true },
    { to: `/admin/knowledge-bases/${kbId}/configuration`, label: 'Configuration', icon: Settings },
  ];

  return (
    <nav className={styles.innerNav}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => 
            `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
          }
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default KnowledgeBaseInnerNav;
