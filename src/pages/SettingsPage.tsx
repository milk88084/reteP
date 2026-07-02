import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, getDaysInMonth } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsStore } from "@/store/settingsStore";
import { useFoodLogStore } from "@/store/foodLogStore";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { calcTDEE, formatNum } from "@/utils/nutritionCalc";
import { UserSettings, GenderType, GoalType } from "@/types";
import { cn } from "@/utils/cn";

// ── Icons ────────────────────────────────────────────────────────────────────

const LogoutIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <motion.svg
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.2 }}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </motion.svg>
);

// ── Monthly chart ─────────────────────────────────────────────────────────────

const MONTHS_ABBR = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];
const DOT_ROWS = 10;

interface YearlyDotChartProps {
  data: {
    month: number;
    value: number;
    isFuture: boolean;
    isCurrent: boolean;
  }[];
  color: string;
  unit: string;
}

const YearlyDotChart = ({ data, color, unit }: YearlyDotChartProps) => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const COL_W = 20,
    ROW_H = 9,
    DOT_R = 3;
  const CHART_H = DOT_ROWS * ROW_H;
  const VIEW_W = 12 * COL_W;
  const TIP_H = 22;
  const VIEW_H = TIP_H + CHART_H + 14;

  const sel =
    selectedMonth !== null ? data.find((d) => d.month === selectedMonth) : null;

  const tooltip =
    sel && !sel.isFuture
      ? (() => {
          const cx = (sel.month - 1) * COL_W + COL_W / 2;
          const label = `${formatNum(sel.value)} ${unit}`;
          const tipW = Math.max(label.length * 5.5 + 8, 36);
          const tipX = Math.max(1, Math.min(VIEW_W - tipW - 1, cx - tipW / 2));
          return (
            <g>
              <rect
                x={tipX}
                y={1}
                width={tipW}
                height={15}
                rx={3}
                fill={color}
              />
              <text
                x={tipX + tipW / 2}
                y={11.5}
                textAnchor="middle"
                fontSize="7.5"
                fill="#0D0B09"
                fontWeight="700"
              >
                {label}
              </text>
              <polygon
                points={`${cx},${TIP_H} ${cx - 3.5},${15} ${cx + 3.5},${15}`}
                fill={color}
              />
            </g>
          );
        })()
      : null;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="block"
    >
      {data.map(({ month, value, isFuture, isCurrent }) => {
        const litRows = isFuture
          ? 0
          : Math.max(0, Math.round((value / maxVal) * DOT_ROWS));
        const cx = (month - 1) * COL_W + COL_W / 2;
        const isSelected = month === selectedMonth;
        return (
          <g
            key={month}
            onClick={() => setSelectedMonth(isSelected ? null : month)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={cx - COL_W / 2}
              y={TIP_H}
              width={COL_W}
              height={CHART_H}
              fill="transparent"
            />
            {Array.from({ length: DOT_ROWS }, (_, rowIdx) => {
              const isLit = rowIdx >= DOT_ROWS - litRows;
              const cy = TIP_H + rowIdx * ROW_H + DOT_R + 1;
              return (
                <circle
                  key={rowIdx}
                  cx={cx}
                  cy={cy}
                  r={DOT_R}
                  fill={isLit ? color : "#2A2520"}
                  opacity={
                    isLit
                      ? isSelected || isCurrent
                        ? 1
                        : 0.6
                      : isFuture
                        ? 0.08
                        : 0.2
                  }
                />
              );
            })}
            <text
              x={cx}
              y={TIP_H + CHART_H + 12}
              textAnchor="middle"
              fontSize="7"
              fill={isCurrent || isSelected ? color : "#7A6F65"}
              fontWeight={isCurrent || isSelected ? "700" : "400"}
            >
              {MONTHS_ABBR[month - 1]}
            </text>
          </g>
        );
      })}
      {tooltip}
    </svg>
  );
};

type ChartMetric = "calories" | "protein" | "carbs";

const CHART_METRICS: {
  id: ChartMetric;
  label: string;
  color: string;
  unit: string;
}[] = [
  { id: "calories", label: "熱量", color: "#B6B9FE", unit: "kcal" },
  { id: "protein", label: "蛋白質", color: "#6366FF", unit: "g" },
  { id: "carbs", label: "碳水", color: "#BDF2DE", unit: "g" },
];

interface MonthlyChartProps {
  user?: { avatarUrl?: string | null; name: string } | null;
  onSignOut: () => void;
}

const MonthlyChart = ({ user, onSignOut }: MonthlyChartProps) => {
  const [metric, setMetric] = useState<ChartMetric>("calories");
  const logs = useFoodLogStore((s) => s.logs);
  const { getDailySummary } = useFoodLogStore();

  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  const yyyy = format(now, "yyyy");
  const mm = format(now, "MM");

  const activeMetric = CHART_METRICS.find((m) => m.id === metric)!;

  const data = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dd = String(i + 1).padStart(2, "0");
      const s = getDailySummary(`${yyyy}-${mm}-${dd}`);
      return {
        day: i + 1,
        value:
          metric === "calories"
            ? s.total_calories
            : metric === "protein"
              ? s.total_protein
              : s.total_carbs,
      };
    });
  }, [logs, metric, daysInMonth, yyyy, mm]);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data],
  );

  const currentYear = parseInt(yyyy);
  const currentMonth = now.getMonth() + 1;

  const yearlyData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        const mStr = String(monthNum).padStart(2, "0");
        const daysInM = getDaysInMonth(new Date(currentYear, i, 1));
        let val = 0;
        for (let d = 1; d <= daysInM; d++) {
          const s = getDailySummary(
            `${yyyy}-${mStr}-${String(d).padStart(2, "0")}`,
          );
          val +=
            metric === "calories"
              ? s.total_calories
              : metric === "protein"
                ? s.total_protein
                : s.total_carbs;
        }
        return {
          month: monthNum,
          value: monthNum <= currentMonth ? val : 0,
          isFuture: monthNum > currentMonth,
          isCurrent: monthNum === currentMonth,
        };
      }),
    [logs, metric, currentYear, currentMonth, yyyy],
  );

  return (
    <section className="h-[100dvh] flex flex-col -mt-4">
      {/* Top: text hero */}
      <div className="h-[58%] flex flex-col -mx-4 px-4 pt-6 pb-1 bg-accent">
        {/* Top bar: avatar + logout */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                style={{ filter: "grayscale(100%)" }}
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {user?.name.charAt(0)}
              </span>
            )}
          </div>
          <button
            onClick={onSignOut}
            className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
            aria-label="登出"
          >
            <LogoutIcon />
          </button>
        </div>

        {/* Number + subtitle — vertically centered in upper space */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-[8.5rem] leading-none font-bold tracking-tight text-black">
              {formatNum(total)}
            </span>
            <span className="text-lg font-medium text-white/60">
              {activeMetric.unit}
            </span>
          </div>
          <div className="flex-1 flex items-center">
            <span className="text-[3rem]  font-medium text-white/60">
              本月累積{activeMetric.label}
            </span>
          </div>
        </div>
        {/* Month + year — pinned to bottom */}
        <div className="flex items-end justify-between">
          <div className="text-6xl font-bold uppercase tracking-wide text-black">
            {format(now, "MMMM")}
          </div>
          <div className="text-6xl font-medium text-white/50">
            {format(now, "yyyy")}
          </div>
        </div>
      </div>

      {/* Bottom: yearly chart panel */}
      <div className="flex-1 flex flex-col pt-4 pb-4 min-h-0">
        {/* Row: year label + metric toggles */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            {yyyy} 年累積
          </p>
          <div className="flex gap-1.5">
            {CHART_METRICS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold transition-all",
                  metric === m.id
                    ? "text-[#0D0B09]"
                    : "text-ink-muted bg-border",
                )}
                style={
                  metric === m.id ? { backgroundColor: m.color } : undefined
                }
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Yearly dot matrix chart */}
        <div className="flex-1 min-h-0 h-full">
          <YearlyDotChart
            data={yearlyData}
            color={activeMetric.color}
            unit={activeMetric.unit}
          />
        </div>
      </div>
    </section>
  );
};

// ── Info sheets ───────────────────────────────────────────────────────────────

type InfoType = "body" | "goals";

const INFO_CONTENT: Record<
  InfoType,
  { title: string; sections: { heading: string; lines: string[] }[] }
> = {
  body: {
    title: "BMI 計算方式",
    sections: [
      {
        heading: "公式",
        lines: ["BMI = 體重 (kg) ÷ 身高 (m)²"],
      },
      {
        heading: "分類標準（WHO）",
        lines: ["< 18.5　過輕", "18.5 – 24.9　正常", "25 – 29.9　過重", "≥ 30　肥胖"],
      },
    ],
  },
  goals: {
    title: "每日目標計算方式",
    sections: [
      {
        heading: "① 基礎代謝率 BMR（Mifflin-St Jeor）",
        lines: [
          "男：10×體重 + 6.25×身高 − 5×年齡 + 5",
          "女：10×體重 + 6.25×身高 − 5×年齡 − 161",
          "其他：取男女平均（−78）",
        ],
      },
      {
        heading: "② 每日總消耗 TDEE",
        lines: ["TDEE = BMR × 1.55（中度活動量）"],
      },
      {
        heading: "③ 熱量目標",
        lines: ["減重：TDEE − 500 kcal", "維持：TDEE", "增重：TDEE + 300 kcal"],
      },
      {
        heading: "④ 蛋白質目標",
        lines: ["減重：體重 × 1.8 g", "維持：體重 × 1.4 g", "增重：體重 × 2.0 g"],
      },
      {
        heading: "⑤ 脂肪目標",
        lines: ["熱量 × 25% ÷ 9"],
      },
      {
        heading: "⑥ 碳水目標",
        lines: ["(熱量 − 蛋白質×4 − 脂肪×9) ÷ 4"],
      },
    ],
  },
};

const InfoSheet = ({ type, onClose }: { type: InfoType; onClose: () => void }) => {
  const { title, sections } = INFO_CONTENT[type];
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="w-full max-w-sm bg-surface rounded-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
            <p className="text-sm font-bold text-ink">{title}</p>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-border text-ink-muted text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4 space-y-4 max-h-[60dvh] overflow-y-auto">
            {sections.map((s) => (
              <div key={s.heading}>
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                  {s.heading}
                </p>
                <div className="space-y-1">
                  {s.lines.map((line, i) => (
                    <p key={i} className="text-xs text-ink font-mono leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

// ── Shared components ─────────────────────────────────────────────────────────

const GOAL_LABELS: Record<GoalType, string> = {
  lose: "減重",
  maintain: "維持",
  gain: "增重",
};

interface NumFieldProps {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
}
const NumField = ({ label, unit, value, onChange }: NumFieldProps) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <p className="text-sm font-medium text-ink">{label}</p>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value === 0 ? "" : value}
        min={0}
        placeholder="0"
        onChange={(e) =>
          onChange(e.target.value === "" ? 0 : Number(e.target.value))
        }
        onFocus={(e) => e.target.select()}
        className="w-20 text-right bg-bg rounded-xl px-3 py-1.5 text-sm font-semibold text-ink border-none outline-none focus:ring-2 focus:ring-brand"
      />
      <span className="text-xs text-ink-muted w-8">{unit}</span>
    </div>
  </div>
);

interface AccordionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  onInfo?: () => void;
  children: React.ReactNode;
}
const Accordion = ({ title, open, onToggle, onInfo, children }: AccordionProps) => (
  <div className="bg-surface rounded-2xl overflow-hidden">
    <motion.button
      onClick={onToggle}
      whileTap={{ opacity: 0.7 }}
      className="w-full flex items-center justify-between px-4 py-3.5"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-ink">{title}</span>
        {onInfo && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onInfo(); }}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-border text-ink-muted"
          >
            <InfoIcon />
          </span>
        )}
      </div>
      <span className="text-ink-muted">
        <ChevronIcon open={open} />
      </span>
    </motion.button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div className="px-4 pb-4 pt-1 border-t border-border">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

interface SettingsPageProps {
  onSaved?: () => void;
}

export const SettingsPage = ({ onSaved }: SettingsPageProps) => {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useSettingsStore();
  const clearLogs = useFoodLogStore((s) => s.setLogs);

  const [draft, setDraft] = useState<UserSettings>({ ...settings });
  const [bodyOpen, setBodyOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [bodySaved, setBodySaved] = useState(false);
  const [goalsSaved, setGoalsSaved] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [infoSheet, setInfoSheet] = useState<InfoType | null>(null);

  const set = (key: keyof UserSettings) => (v: number | string) =>
    setDraft((d) => ({ ...d, [key]: v }));

  useEffect(() => {
    if (draft.height <= 0 || draft.weight <= 0 || draft.age <= 0) return;
    const goals = calcTDEE(
      draft.height,
      draft.weight,
      draft.age,
      draft.gender,
      draft.goal,
    );
    setDraft((d) => ({ ...d, ...goals }));
  }, [draft.height, draft.weight, draft.age, draft.gender, draft.goal]);

  const bmi =
    draft.height > 0 ? draft.weight / Math.pow(draft.height / 100, 2) : 0;
  const bmiCategory =
    bmi === 0
      ? ""
      : bmi < 18.5
        ? "過輕"
        : bmi < 25
          ? "正常"
          : bmi < 30
            ? "過重"
            : "肥胖";
  const bmiColor =
    bmi === 0
      ? ""
      : bmi < 18.5
        ? "text-blue-400"
        : bmi < 25
          ? "text-green-400"
          : bmi < 30
            ? "text-yellow-400"
            : "text-red-400";

  const saveBody = () => {
    updateSettings(draft);
    setBodySaved(true);
    setTimeout(() => {
      setBodySaved(false);
      onSaved?.();
    }, 1200);
  };

  const saveGoals = () => {
    updateSettings(draft);
    setGoalsSaved(true);
    setTimeout(() => {
      setGoalsSaved(false);
      onSaved?.();
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Monthly chart */}
      <MonthlyChart user={user} onSignOut={() => setShowSignOutConfirm(true)} />

      {/* Body data accordion */}
      <Accordion
        title="身體資料"
        open={bodyOpen}
        onToggle={() => setBodyOpen((v) => !v)}
        onInfo={() => setInfoSheet("body")}
      >
        {/* BMI */}
        {bmi > 0 && (
          <div className="flex items-center justify-between py-3 border-b border-border">
            <p className="text-sm font-medium text-ink-muted">BMI</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-ink">
                {bmi.toFixed(1)}
              </span>
              <span className={cn("text-xs font-semibold", bmiColor)}>
                {bmiCategory}
              </span>
            </div>
          </div>
        )}

        {/* Gender */}
        <div className="py-3 border-b border-border">
          <p className="text-xs font-medium text-ink-muted mb-2">生理性別</p>
          <div className="flex gap-2">
            {(["male", "female", "other"] as GenderType[]).map((g) => (
              <button
                key={g}
                onClick={() => set("gender")(g)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-semibold border transition-all",
                  draft.gender === g
                    ? "bg-border text-ink border-ink/20"
                    : "bg-bg text-ink-muted border-border",
                )}
              >
                {g === "male" ? "男" : g === "female" ? "女" : "其他"}
              </button>
            ))}
          </div>
        </div>

        {/* Numeric fields */}
        <NumField
          label="年齡"
          unit="歲"
          value={draft.age}
          onChange={set("age") as (v: number) => void}
        />
        <NumField
          label="身高"
          unit="cm"
          value={draft.height}
          onChange={set("height") as (v: number) => void}
        />
        <NumField
          label="體重"
          unit="kg"
          value={draft.weight}
          onChange={set("weight") as (v: number) => void}
        />

        {/* Goal */}
        <div className="pt-3">
          <p className="text-xs font-medium text-ink-muted mb-2">目標</p>
          <div className="flex gap-2">
            {(["lose", "maintain", "gain"] as GoalType[]).map((g) => (
              <button
                key={g}
                onClick={() => set("goal")(g)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                  draft.goal === g
                    ? "bg-border text-ink border-ink/20"
                    : "bg-bg text-ink-muted border-border",
                )}
              >
                {GOAL_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Button variant="primary" onClick={saveBody} className="w-full">
            {bodySaved ? "已儲存 ✓" : "儲存並同步"}
          </Button>
        </div>
      </Accordion>

      {/* Daily goals accordion */}
      <Accordion
        title="每日目標"
        open={goalsOpen}
        onToggle={() => setGoalsOpen((v) => !v)}
        onInfo={() => setInfoSheet("goals")}
      >
        <p className="text-[10px] text-ink-muted mb-2">
          依身體資料自動計算，也可手動調整
        </p>
        <NumField
          label="熱量"
          unit="kcal"
          value={draft.calorie_goal}
          onChange={set("calorie_goal") as (v: number) => void}
        />
        <NumField
          label="蛋白質"
          unit="g"
          value={draft.protein_goal}
          onChange={set("protein_goal") as (v: number) => void}
        />
        <NumField
          label="碳水化合物"
          unit="g"
          value={draft.carbs_goal}
          onChange={set("carbs_goal") as (v: number) => void}
        />
        <NumField
          label="脂肪"
          unit="g"
          value={draft.fat_goal}
          onChange={set("fat_goal") as (v: number) => void}
        />
        <div className="mt-4">
          <Button variant="primary" onClick={saveGoals} className="w-full">
            {goalsSaved ? "已儲存 ✓" : "儲存並同步"}
          </Button>
        </div>
      </Accordion>

      {infoSheet && (
        <InfoSheet type={infoSheet} onClose={() => setInfoSheet(null)} />
      )}

      {showSignOutConfirm && (
        <ConfirmDialog
          message="確定要登出嗎？"
          confirmLabel="登出"
          cancelLabel="取消"
          danger
          onConfirm={() => {
            clearLogs({});
            signOut();
          }}
          onCancel={() => setShowSignOutConfirm(false)}
        />
      )}
    </div>
  );
};
