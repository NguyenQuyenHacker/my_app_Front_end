import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "./CustomerLayout.module.css";
import Header from "./components/Header/Header";
import ChatbotBar from "./components/ChatbotBar/ChatbotBar";
import Splitter from "./components/Splitter";

export default function CustomerLayout() {
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 520;

  const [chatbotWidth, setChatbotWidth] = useState(360);
  const [isDragging, setIsDragging] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(true);
  const layoutRef = useRef(null);

  useEffect(() => {
    if (!isDragging || !isChatbotOpen) return;

    const handleMouseMove = (e) => {
      if (!layoutRef.current) return;

      const rect = layoutRef.current.getBoundingClientRect();
      const nextWidth = rect.right - e.clientX;

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

  return (
    <div className={styles.layout} ref={layoutRef}>
      <div className={styles.contentBar}>
        <Header onToggleChatbot={toggleChatbot} />
        <main className={styles.screensBar}>
          <Outlet />
        </main>
      </div>

      {isChatbotOpen && (
        <>
          <Splitter onMouseDown={() => setIsDragging(true)} />
          <div className={styles.chatbotBar} style={{ width: chatbotWidth }}>
            <ChatbotBar onClose={toggleChatbot} />
          </div>
        </>
      )}
    </div>
  );
}