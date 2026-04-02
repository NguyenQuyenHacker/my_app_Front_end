/// <reference types="vite/client" />

import React, { useState } from "react";
import { X, Send } from "lucide-react";
import styles from "./ChatbotBar.module.css";

interface ChatbotBarProps {
  onClose: () => void;
}

const ChatbotBar: React.FC<ChatbotBarProps> = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [
      ...prev, 
      { id: Date.now(), text: inputValue, sender: "user" }
    ]);
    const currentInput = inputValue;
    setInputValue("");

    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: `Tôi đã nhận được yêu cầu: "${currentInput}". Xin lỗi, tôi hiện đang trong quá trình nâng cấp.`, sender: "bot" }
      ]);
    }, 1000);
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Trợ lý ảo AI</span>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Đóng chatbot">
          <X size={20} />
        </button>
      </div>
      
      <div className={styles.chatArea}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.message} ${msg.sender === "user" ? styles.user : styles.bot}`}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className={styles.inputArea}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nhập câu hỏi..." 
          className={styles.input}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatbotBar;
