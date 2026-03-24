import type { MessageMeta } from "../core/types";
import styles from "../ChatbotBar.module.css";

export const BranchSwitcher = ({ meta, disabled = false, onSwitch }: { meta?: MessageMeta; disabled?: boolean; onSwitch: (id: string) => void }) => {
  const { branch: currentBranch, branchOptions: branches = [] } = meta ?? {};
  if (!currentBranch || branches.length <= 1) return null;

  const currentIndex = branches.indexOf(currentBranch);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < branches.length - 1;

  return (
    <div className={styles.branchSwitcher}>
      <button type="button" className={styles.branchButton} disabled={!canGoPrev || disabled} onClick={() => onSwitch(branches[currentIndex - 1])} title="Nhánh trước">◀</button>
      <span className={styles.branchLabel}>{currentIndex + 1}/{branches.length}</span>
      <button type="button" className={styles.branchButton} disabled={!canGoNext || disabled} onClick={() => onSwitch(branches[currentIndex + 1])} title="Nhánh sau">▶</button>
    </div>
  );
};
