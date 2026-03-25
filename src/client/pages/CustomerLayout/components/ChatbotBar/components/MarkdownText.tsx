import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../ChatbotBar.module.css";

export const MarkdownText = ({ children }: { children: string }) => (
  <div className={styles.markdown}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
  </div>
);
