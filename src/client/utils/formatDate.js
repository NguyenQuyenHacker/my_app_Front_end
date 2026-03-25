export const formatDate = (dateString) => {
  if (!dateString) return "--";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("vi-VN").format(date);
};