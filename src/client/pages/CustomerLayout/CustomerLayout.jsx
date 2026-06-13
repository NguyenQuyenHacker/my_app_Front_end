// my-app-FE\src\pages\CustomerLayout\CustomerLayout.jsx
import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "./CustomerLayout.module.css";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatbotBar from "../../components/ChatbotBar/ChatbotBar";
import Splitter from "../../components/Splitter/Splitter";
import Footer from "../../components/Footer/Footer";

export default function CustomerLayout() {
  const MIN_WIDTH = 320;

  const MAX_WIDTH = 720;

  // ≤768px coi là mobile (iPhone, Samsung, tablet dọc)
  const isMobile = () =>
    typeof window !== "undefined" && window.innerWidth <= 768;

  const [chatbotWidth, setChatbotWidth] = useState(360);
  const [isDragging, setIsDragging] = useState(false);
  // Trên mobile: chatbot đóng & sidebar (drawer) đóng mặc định
  const [isChatbotOpen, setIsChatbotOpen] = useState(() => !isMobile());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => isMobile());
  const layoutRef = useRef(null);

  useEffect(() => {
    if (!isDragging || !isChatbotOpen) return;

    const handleMouseMove = (e) => {
      if (!layoutRef.current) return;

      const rect = layoutRef.current.getBoundingClientRect();
      const nextWidth = (rect.right - e.clientX) / 0.9;

      if (nextWidth < MIN_WIDTH) {
        setChatbotWidth(MIN_WIDTH);
        return;
      }

      if (nextWidth > MAX_WIDTH) {
        setChatbotWidth(MAX_WIDTH);
        return;
      }

      setChatbotWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, isChatbotOpen]);

  const toggleChatbot = () => setIsChatbotOpen((prev) => !prev);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className={styles.layout} ref={layoutRef}>
      <div className={styles.mainWrapper}>
        <Header
          onToggleChatbot={toggleChatbot}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        <div className={styles.body}>
          <Sidebar collapsed={sidebarCollapsed} />

          {/* Lớp nền cho drawer trên mobile — bấm ra ngoài để đóng */}
          {!sidebarCollapsed && (
            <div
              className={styles.sidebarBackdrop}
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          <main className={styles.screensBar}>
            <Outlet />
            <Footer />
          </main>
        </div>
      </div>

      {isChatbotOpen && (
        <>
          <Splitter onMouseDown={() => setIsDragging(true)} />
          <div className={styles.chatbotBar} style={{ width: chatbotWidth }}>
            <ChatbotBar onClose={toggleChatbot} />
          </div>
        </>
      )}

      {/* Nút nổi mở/đóng trợ lý AI — chỉ hiện trên mobile */}
      <button
        type="button"
        className={styles.chatbotFab}
        onClick={toggleChatbot}
        aria-label={isChatbotOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
      >
        {isChatbotOpen ? "✕" : "AI"}
      </button>
    </div>
  );
}
