// src/admin/pages/AdminUsers/AdminUsers.jsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./AdminUsers.module.css";
import { getCustomers, updateCustomerStatus } from "../../api/user_barApi";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [updatingAccountNo, setUpdatingAccountNo] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loading, isError } = useQuery({
    queryKey: ["adminCustomers"],
    queryFn: getCustomers,
  });
  const error = isError ? "Không thể tải danh sách người dùng." : "";

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((item) => {
      const fullName = item.full_name?.toLowerCase() || "";
      const accountNo = item.account_no || "";
      const statusText = item.is_active ? "đang hoạt động" : "đã khóa";

      return (
        fullName.includes(keyword) ||
        accountNo.includes(keyword) ||
        statusText.includes(keyword)
      );
    });
  }, [users, search]);

  const statusMutation = useMutation({
    mutationFn: ({ accountNo, nextStatus }) =>
      updateCustomerStatus(accountNo, nextStatus),
    onMutate: async ({ accountNo, nextStatus }) => {
      setUpdatingAccountNo(accountNo);
      await queryClient.cancelQueries({ queryKey: ["adminCustomers"] });
      const prev = queryClient.getQueryData(["adminCustomers"]);
      queryClient.setQueryData(["adminCustomers"], (old) =>
        old?.map((item) =>
          item.account_no === accountNo ? { ...item, is_active: nextStatus } : item
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["adminCustomers"], ctx.prev);
      alert("Không thể cập nhật trạng thái tài khoản.");
    },
    onSettled: () => setUpdatingAccountNo(""),
  });

  const toggleStatus = (accountNo, currentStatus) => {
    statusMutation.mutate({ accountNo, nextStatus: !currentStatus });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState} style={{ color: "red" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>USER MANAGEMENT</p>
          <h1 className={styles.pageTitle}>User List</h1>
          <p className={styles.pageDesc}>
            Quản lý user, trạng thái hoạt động và thao tác khóa / mở khóa tài khoản.
          </p>
        </div>

        <input
          type="text"
          placeholder="Tìm theo tên hoặc số tài khoản..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </section>

      <div className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Số tài khoản</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((item, index) => {
                const isUpdating = updatingAccountNo === item.account_no;

                return (
                  <tr key={item.account_no || index}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {item.full_name?.trim()?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className={styles.userName}>{item.full_name}</div>
                        </div>
                      </div>
                    </td>

                    <td className={styles.mono}>{item.account_no}</td>

                    <td>
                      <span
                        className={
                          item.is_active
                            ? `${styles.statusBadge} ${styles.active}`
                            : `${styles.statusBadge} ${styles.locked}`
                        }
                      >
                        {item.is_active ? "Đang hoạt động" : "Đã khóa"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => toggleStatus(item.account_no, item.is_active)}
                        disabled={isUpdating}
                        className={
                          item.is_active
                            ? `${styles.actionBtn} ${styles.lockBtn}`
                            : `${styles.actionBtn} ${styles.unlockBtn}`
                        }
                      >
                        {isUpdating
                          ? "Đang xử lý..."
                          : item.is_active
                          ? "Khóa TK"
                          : "Mở khóa"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}