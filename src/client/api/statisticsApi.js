import api from "./axios";

export const getStatisticsOverview = async (month) => {
  const res = await api.get("/api/statistics/overview", {
    params: month ? { month } : {},
  });
  return res.data;
};

export const getExpenseByType = async (month) => {
  const res = await api.get("/api/statistics/expense-by-type", {
    params: month ? { month } : {},
  });
  return res.data;
};

export const getDailyStats = async (month) => {
  const res = await api.get("/api/statistics/daily", {
    params: month ? { month } : {},
  });
  return res.data;
};

export const getTopRecipients = async (month, limit = 5) => {
  const params = { limit };
  if (month) params.month = month;
  const res = await api.get("/api/statistics/top-recipients", { params });
  return res.data;
};

export const getTrend = async (months = 6) => {
  const res = await api.get("/api/statistics/trend", { params: { months } });
  return res.data;
};
