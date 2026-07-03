import { useRef } from "react";
import { motion } from "framer-motion";

interface NavItem {
  kind: "action" | "metric";
  id: string;
  label: string;
  color: string;
}

const ITEMS: NavItem[] = [
  { kind: "action", id: "manual", label: "手動輸入", color: "#9E9E9E" },
  { kind: "metric", id: "protein", label: "蛋白質", color: "#6366FF" },
  { kind: "metric", id: "calories", label: "熱量", color: "#B6B9FE" },
  { kind: "metric", id: "carbs", label: "碳水化合物", color: "#BDF2DE" },
  { kind: "action", id: "library", label: "食物庫", color: "#9E9E9E" },
];

const PlusIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e8e4de"
    strokeWidth="2.4"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LibraryIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e8e4de"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

interface MetricNavProps {
  activeIdx: number;
  onSelect: (idx: number) => void;
}

export const MetricNav = ({ activeIdx, onSelect }: MetricNavProps) => {
  const startX = useRef<number | null>(null);

  const move = (dir: 1 | -1) => {
    const target = Math.max(1, Math.min(3, activeIdx + dir));
    if (target !== activeIdx) onSelect(target);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < 40) return;
    move(dx < 0 ? 1 : -1);
  };
  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    startX.current = e.clientX;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < 40) return;
    move(dx < 0 ? 1 : -1);
  };

  return (
    <motion.div
      className="fixed inset-x-0 bottom-8 z-[60] mx-auto max-w-[430px] px-8 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div
        className="flex items-center justify-between w-full pointer-events-auto select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {ITEMS.map((item, i) => {
          const isActive = i === activeIdx && item.kind === "metric";
          return (
            <button
              key={item.id}
              onClick={() => onSelect(i)}
              aria-label={item.label}
              className="flex items-center justify-center w-12 h-12 active:scale-90 transition-transform"
            >
              {item.kind === "action" ? (
                item.id === "manual" ? (
                  <PlusIcon />
                ) : (
                  <LibraryIcon />
                )
              ) : isActive ? (
                <motion.span
                  layoutId="nav-active"
                  className="rounded-full block"
                  style={{
                    width: 22,
                    height: 22,
                    backgroundColor: item.color,
                    boxShadow: `0 0 18px 6px ${item.color}80`,
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                />
              ) : (
                <span
                  className="rounded-full block"
                  style={{ width: 16, height: 16, backgroundColor: item.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
