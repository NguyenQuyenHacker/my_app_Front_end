import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getDailyStats,
  getExpenseByType,
  getStatisticsOverview,
  getTopRecipients,
  getTrend,
} from "../../../../api/statisticsApi";
import { clearClientToken } from "../../../../../utils/authUtils";
import { useT } from "../../../../i18n/LanguageContext";
import styles from "./StatisticsScreen.module.css";

const COLORS = ["#061223", "#e01700", "#25a846", "#295eff", "#fbc02d", "#7c3aed"];

const currentMonthIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatAmount = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
};

const formatAmountShort = (value) => {
  const num = Number(value || 0);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return String(num);
};

const formatDayShort = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return iso;
  }
};

const formatPeriod = (p) => {
  if (!p || !p.includes("-")) return p;
  const [y, m] = p.split("-");
  return `${m}/${y}`;
};

const StatisticsScreen = () => {
  const navigate = useNavigate();
  const t = useT();

  const [month, setMonth] = useState(currentMonthIso());
  const [overview, setOverview] = useState(null);
  const [byType, setByType] = useState(null);
  const [daily, setDaily] = useState(null);
  const [topRecipients, setTopRecipients] = useState(null);
  const [trend, setTrend] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const [ov, bt, dl, tr, tg] = await Promise.all([
          getStatisticsOverview(month),
          getExpenseByType(month),
          getDailyStats(month),
          getTopRecipients(month, 5),
          getTrend(6),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setByType(bt);
        setDaily(dl);
        setTopRecipients(tr);
        setTrend(tg);
      } catch (error) {
        if (cancelled) return;
        if (error?.response?.status === 401) {
          clearClientToken();
          navigate("/login");
          return;
        }
        setErrorMessage(error.response?.data?.detail || t("statistics.errLoad"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [month, navigate, t]);

  const dailyChartData = useMemo(() => {
    if (!daily?.points) return [];
    return daily.points.map((p) => ({
      day: formatDayShort(p.day),
      income: Number(p.income || 0),
      expense: Number(p.expense || 0),
    }));
  }, [daily]);

  const trendChartData = useMemo(() => {
    if (!trend?.points) return [];
    return trend.points.map((p) => ({
      period: formatPeriod(p.period),
      income: Number(p.total_income || 0),
      expense: Number(p.total_expense || 0),
    }));
  }, [trend]);

  const pieData = useMemo(() => {
    if (!byType?.items) return [];
    return byType.items.map((it) => ({
      name: it.label,
      value: Number(it.total || 0),
      count: it.count,
    }));
  }, [byType]);

  const renderChange = (pct) => {
    if (pct === null || pct === undefined) {
      return <span className={`${styles.kpiChange} ${styles.kpiChangeFlat}`}><Minus size={14} /> {t("statistics.noPrev")}</span>;
    }
    const n = Number(pct);
    if (n > 0) {
      return <span className={`${styles.kpiChange} ${styles.kpiChangeUp}`}><TrendingUp size={14} /> +{n.toFixed(2)}%</span>;
    }
    if (n < 0) {
      return <span className={`${styles.kpiChange} ${styles.kpiChangeDown}`}><TrendingDown size={14} /> {n.toFixed(2)}%</span>;
    }
    return <span className={`${styles.kpiChange} ${styles.kpiChangeFlat}`}><Minus size={14} /> 0%</span>;
  };

  const renderTopRank = (idx) => {
    let cls = styles.topRank;
    if (idx === 0) cls += ` ${styles.topRankGold}`;
    else if (idx === 1) cls += ` ${styles.topRankSilver}`;
    else if (idx === 2) cls += ` ${styles.topRankBronze}`;
    return <div className={cls}>{idx + 1}</div>;
  };

  const tooltipFormatter = (value, name) => [formatAmount(value) + " VND", name];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <BarChart3 size={28} style={{ verticalAlign: "-4px", marginRight: 8 }} />
            {t("statistics.pageTitle")}
          </h1>
          <p className={styles.pageSubtitle}>{t("statistics.pageSubtitle")}</p>
        </div>
        <div className={styles.monthPicker}>
          <span className={styles.monthLabel}>{t("statistics.monthLabel")}</span>
          <input
            type="month"
            className={styles.monthInput}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      <div className={styles.content}>
        {/* KPI row */}
        <div className={`${styles.card} ${styles.colFull}`}>
          <div className={styles.kpiRow}>
            <div className={styles.kpi}>
              <div className={styles.kpiLabel}>{t("statistics.totalIncome")}</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueIncome}`}>
                {formatAmount(overview?.total_income)} <small>VND</small>
              </div>
              {renderChange(overview?.income_change_percent)}
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiLabel}>{t("statistics.totalExpense")}</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueExpense}`}>
                {formatAmount(overview?.total_expense)} <small>VND</small>
              </div>
              {renderChange(overview?.expense_change_percent)}
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiLabel}>{t("statistics.net")}</div>
              <div className={styles.kpiValue}>
                {formatAmount(overview?.net)} <small>VND</small>
              </div>
              <div className={`${styles.kpiChange} ${styles.kpiChangeFlat}`}>
                {overview?.transaction_count || 0} {t("statistics.transactions")}
              </div>
            </div>
          </div>
        </div>

        {/* Daily chart */}
        <div className={`${styles.card} ${styles.col8}`}>
          <div>
            <h3 className={styles.cardTitle}>{t("statistics.dailyTitle")}</h3>
            <div className={styles.cardSub}>{t("statistics.dailySub")}</div>
          </div>
          {dailyChartData.length === 0 || loading ? (
            <div className={styles.empty}>{loading ? t("common.loading") : t("statistics.noData")}</div>
          ) : (
            <div className={styles.chartBoxTall}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#6c757d" />
                  <YAxis tickFormatter={formatAmountShort} tick={{ fontSize: 11 }} stroke="#6c757d" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar name={t("statistics.income")} dataKey="income" fill="#25a846" radius={[4, 4, 0, 0]} />
                  <Bar name={t("statistics.expense")} dataKey="expense" fill="#e01700" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie expense by type */}
        <div className={`${styles.card} ${styles.col4}`}>
          <div>
            <h3 className={styles.cardTitle}>{t("statistics.byTypeTitle")}</h3>
            <div className={styles.cardSub}>{t("statistics.byTypeSub")}</div>
          </div>
          {pieData.length === 0 || loading ? (
            <div className={styles.empty}>{loading ? t("common.loading") : t("statistics.noData")}</div>
          ) : (
            <>
              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={92}
                      paddingAngle={2}
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={tooltipFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.legendList}>
                {pieData.map((it, idx) => (
                  <div key={it.name} className={styles.legendRow}>
                    <div className={styles.legendLeft}>
                      <span className={styles.legendDot} style={{ background: COLORS[idx % COLORS.length] }} />
                      <div>
                        <div className={styles.legendName}>{it.name}</div>
                        <div className={styles.legendMeta}>{it.count} {t("statistics.transactions")}</div>
                      </div>
                    </div>
                    <span className={styles.legendValue}>{formatAmount(it.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top recipients */}
        <div className={`${styles.card} ${styles.colHalf}`}>
          <div>
            <h3 className={styles.cardTitle}>{t("statistics.topRecipientsTitle")}</h3>
            <div className={styles.cardSub}>{t("statistics.topRecipientsSub")}</div>
          </div>
          {(topRecipients?.items?.length || 0) === 0 || loading ? (
            <div className={styles.empty}>{loading ? t("common.loading") : t("statistics.noData")}</div>
          ) : (
            <div className={styles.topList}>
              {topRecipients.items.map((item, idx) => (
                <div key={`${item.account_no}-${idx}`} className={styles.topRow}>
                  {renderTopRank(idx)}
                  <div className={styles.topName}>
                    {item.name || t("statistics.unknown")}
                    <span className={styles.topNameSub}>
                      {item.is_internal ? t("statistics.internal") : (item.bank_code || t("statistics.external"))}
                      {item.account_no ? ` • ${item.account_no}` : ""}
                    </span>
                  </div>
                  <div>
                    <div className={styles.topValue}>{formatAmount(item.total)} VND</div>
                    <div className={styles.topValueSub}>{item.count} {t("statistics.transactions")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trend line */}
        <div className={`${styles.card} ${styles.colHalf}`}>
          <div>
            <h3 className={styles.cardTitle}>{t("statistics.trendTitle")}</h3>
            <div className={styles.cardSub}>{t("statistics.trendSub")}</div>
          </div>
          {trendChartData.length === 0 || loading ? (
            <div className={styles.empty}>{loading ? t("common.loading") : t("statistics.noData")}</div>
          ) : (
            <div className={styles.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#6c757d" />
                  <YAxis tickFormatter={formatAmountShort} tick={{ fontSize: 11 }} stroke="#6c757d" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Line
                    type="monotone"
                    name={t("statistics.income")}
                    dataKey="income"
                    stroke="#25a846"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    name={t("statistics.expense")}
                    dataKey="expense"
                    stroke="#e01700"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsScreen;
