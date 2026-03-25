import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const kpis = [
    { title: "Total Users", value: "8,249", trend: "+12.5%", positive: true },
    { title: "Active Threads", value: "1,432", trend: "+5.2%", positive: true },
    { title: "Avg Response Time", value: "1.2s", trend: "-0.4s", positive: true },
    { title: "Error Rate", value: "0.8%", trend: "+0.1%", positive: false },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Welcome back, here's what's happening today.</p>
      </header>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi, index) => (
          <div key={index} className={styles.kpiCard}>
            <h3 className={styles.kpiTitle}>{kpi.title}</h3>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={`${styles.kpiTrend} ${kpi.positive ? styles.trendUp : styles.trendDown}`}>
                {kpi.trend}
              </span>
            </div>
            <div className={styles.kpiChartPlaceholder}>
              <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                <path 
                  d={kpi.positive ? "M0,30 Q20,25 40,20 T80,10 T100,5" : "M0,5 Q20,10 40,20 T80,25 T100,28"} 
                  fill="none" 
                  stroke={kpi.positive ? "#10b981" : "#ef4444"} 
                  strokeWidth="2" 
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.recentActivity}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Chat Threads</h2>
            <button className={styles.viewAllBtn}>View All</button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Thread ID</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className={styles.threadIdCell}>#TH-{Math.floor(Math.random() * 10000)}</td>
                    <td>User_{Math.floor(Math.random() * 100)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${i % 3 === 0 ? styles.statusClosed : styles.statusActive}`}>
                        {i % 3 === 0 ? "Closed" : "Active"}
                      </span>
                    </td>
                    <td className={styles.dateCell}>Just now</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.systemHealth}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Agent Health</h2>
          </div>
          <div className={styles.healthStats}>
            <div className={styles.healthItem}>
              <div className={styles.healthLabel}>LangGraph API</div>
              <div className={styles.healthBar}><div className={styles.healthFill} style={{width: '98%', background: '#10b981'}}></div></div>
            </div>
            <div className={styles.healthItem}>
              <div className={styles.healthLabel}>Database connection</div>
              <div className={styles.healthBar}><div className={styles.healthFill} style={{width: '100%', background: '#10b981'}}></div></div>
            </div>
            <div className={styles.healthItem}>
              <div className={styles.healthLabel}>Redis Cache</div>
              <div className={styles.healthBar}><div className={styles.healthFill} style={{width: '85%', background: '#f59e0b'}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
