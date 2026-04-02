// src/admin/pages/AdminUsers/AdminUsers.jsx
import React, { useMemo, useState } from "react";
import styles from "./AdminUsers.module.css";

const initialUsers = [
  {
    user_id: "u_001",
    full_name: "Nguyễn Văn An",
    is_active: true,
    role: "customer",
    account_no: "19036668889999",
    phone: "0901234567",
  },
  {
    user_id: "u_002",
    full_name: "Trần Thị Bình",
    is_active: false,
    role: "customer",
    account_no: "19036668880001",
    phone: "0912345678",
  },
  {
    user_id: "u_003",
    full_name: "Lê Văn Cường",
    is_active: true,
    role: "customer",
    account_no: "19036668880002",
    phone: "0988888888",
  },
  {
    user_id: "u_004",
    full_name: "Phạm Thị Duyên",
    is_active: true,
    role: "customer",
    account_no: "19036668880003",
    phone: "0977777777",
  },
  {
    user_id: "u_005",
    full_name: "Hoàng Minh Đức",
    is_active: true,
    role: "customer",
    account_no: "19036668880004",
    phone: "0966666666",
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((item) => {
      return (
        item.full_name.toLowerCase().includes(keyword) ||
        item.user_id.toLowerCase().includes(keyword) ||
        item.account_no.includes(keyword) ||
        item.phone.includes(keyword)
      );
    });
  }, [users, search]);

  const toggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((item) =>
        item.user_id === userId
          ? { ...item, is_active: !item.is_active }
          : item
      )
    );
  };

  return (
    <div className={styles.page}>
      <section className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>USER MANAGEMENT</p>
          <h1 className={styles.pageTitle}>Admin Users</h1>
          <p className={styles.pageDesc}>
            Quản lý user, trạng thái hoạt động và thao tác khóa / mở khóa tài khoản.
          </p>
        </div>

        <input
          type="text"
          placeholder="Tìm theo tên, user id, account, phone..."
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
                <th>User</th>
                <th>Account No</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((item) => (
                <tr key={item.user_id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {item.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.userName}>{item.full_name}</div>
                        <div className={styles.userId}>{item.user_id}</div>
                      </div>
                    </div>
                  </td>

                  <td className={styles.mono}>{item.account_no}</td>
                  <td className={styles.mono}>{item.phone}</td>

                  <td>
                    <span
                      className={
                        item.is_active
                          ? `${styles.statusBadge} ${styles.active}`
                          : `${styles.statusBadge} ${styles.locked}`
                      }
                    >
                      {item.is_active ? "Active" : "Locked"}
                    </span>
                  </td>

                  <td>
                    <span className={styles.roleBadge}>{item.role}</span>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => toggleStatus(item.user_id)}
                      className={
                        item.is_active
                          ? `${styles.actionBtn} ${styles.lockBtn}`
                          : `${styles.actionBtn} ${styles.unlockBtn}`
                      }
                    >
                      {item.is_active ? "Khóa TK" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.emptyState}>
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