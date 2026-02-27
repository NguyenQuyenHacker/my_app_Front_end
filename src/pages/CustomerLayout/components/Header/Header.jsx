import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";

export default function Header({ onToggleChatbot, isChatbotOpen }) {
  const [weather, setWeather] = useState({
    temp: "--",
    icon: "wb_sunny", // Icon mặc định
    location: "Hà Nội",
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Tọa độ của Hà Nội: Vĩ độ (latitude) 21.0285, Kinh độ (longitude) 105.8542
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current_weather=true"
        );
        const data = await response.json();
        
        const currentTemp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;

        // Chuyển đổi mã thời tiết (WMO code) sang Material Symbols
        let currentIcon = "wb_sunny"; // Nắng / Quang đãng (Code 0)
        if (weatherCode >= 1 && weatherCode <= 3) currentIcon = "partly_cloudy_day"; // Có mây
        else if (weatherCode >= 45 && weatherCode <= 48) currentIcon = "foggy"; // Sương mù
        else if (weatherCode >= 51 && weatherCode <= 67) currentIcon = "rainy"; // Mưa nhỏ đến to
        else if (weatherCode >= 71 && weatherCode <= 77) currentIcon = "ac_unit"; // Tuyết
        else if (weatherCode >= 80 && weatherCode <= 82) currentIcon = "rainy"; // Mưa rào
        else if (weatherCode >= 95) currentIcon = "thunderstorm"; // Có sấm sét

        setWeather({
          temp: currentTemp,
          icon: currentIcon,
          location: "Hà Nội",
        });
      } catch (error) {
        console.error("Không thể lấy dữ liệu thời tiết:", error);
      }
    };

    fetchWeather();
    
    // Tùy chọn: Cập nhật thời tiết mỗi 30 phút
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.leftGroup}>
        <div className={styles.logoGroup}>
          <a href="/customer" className={styles.logoLink}>
            <img
              src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
              alt="Techcombank Logo"
              className={styles.logo}
            />
          </a>
        </div>
      </div>

      <div className={styles.rightGroup}>
        <div className={styles.locationWeather}>
          <span className={`material-symbols-outlined ${styles.iconBase}`}>
            location_on
          </span>
          <span>{weather.location}</span>
          <span className={styles.dot}>•</span>
          <span className={`material-symbols-outlined ${styles.sunIcon}`}>
            {weather.icon}
          </span>
          <span>{weather.temp}°C</span>
        </div>

<button 
          className={styles.aiButton} 
          onClick={onToggleChatbot} 
          type="button" 
          aria-label="Toggle AI Assistant" 
          title="AI Assistant"
        >
          <img 
            src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/microsoft-copilot.webp" 
            alt="AI Assistant" 
            className={styles.aiIconImage} 
          />
        </button>
      </div>
    </header>
  );
}