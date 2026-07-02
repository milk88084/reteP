import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  parseISO,
  isToday,
  isFuture,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
} from "date-fns";
import { FoodList } from "@/components/features/food/FoodList";
import { FoodEntry } from "@/types";
import { ParticleRing } from "@/components/features/dashboard/ParticleRing";
import { useFoodLogStore } from "@/store/foodLogStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getTodayStr, getDateStr, formatDateHeader } from "@/utils/dateUtils";
import { formatNum } from "@/utils/nutritionCalc";
import { cn } from "@/utils/cn";
import { deleteEntry, updateEntry, getLogsRange } from "@/services/foodRecognitionApi";
import { ManualEntryModal } from "@/components/features/food/ManualEntryModal";
import { useAuth } from "@/hooks/useAuth";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/* Monday-first column index for a given date (date-fns: 0=Sun..6=Sat) */
const mondayIndex = (date: Date) => (getDay(date) + 6) % 7;

export const HistoryPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [activeMetric, setActiveMetric] = useState<
    "calories" | "protein" | "carbs" | "fat"
  >("calories");
  const detailRef = useRef<HTMLElement>(null);
  const {
    getEntriesForDate,
    getDailySummary,
    removeEntry,
    updateEntry: updateEntryStore,
    setLogs,
  } = useFoodLogStore();
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const logs = useFoodLogStore((s) => s.logs);
  const { settings } = useSettingsStore();

  /* Re-fetch the last 60 days from the backend every time HistoryPage mounts */
  const refreshLogs = useCallback(async () => {
    if (!user?.id) return;
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const from = since.toISOString().slice(0, 10);
    const to = new Date().toISOString().slice(0, 10);
    try {
      const grouped = await getLogsRange(from, to);
      setLogs(grouped);
    } catch (e) {
      console.error("[refreshLogs]", e);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  const selected = useMemo(() => parseISO(selectedDate), [selectedDate]);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const isCurrentMonth = isSameMonth(viewMonth, new Date());
  const prevMonth = () => setViewMonth((m) => subMonths(m, 1));
  const nextMonth = () => {
    if (!isCurrentMonth) setViewMonth((m) => addMonths(m, 1));
  };

  /* Days of the displayed month */
  const monthDays = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const leadingBlanks = mondayIndex(startOfMonth(viewMonth));

  const hasRecord = (date: Date) => {
    const entries = logs[getDateStr(date)];
    return !!entries && entries.length > 0;
  };

  const entries = getEntriesForDate(selectedDate);
  const summary = getDailySummary(selectedDate);

  const isOver = summary.total_calories > settings.calorie_goal;

  const METRICS = {
    calories: {
      current: summary.total_calories,
      goal: settings.calorie_goal,
      color: "#B6B9FE",
      label: "熱量",
      unit: "kcal",
    },
    protein: {
      current: summary.total_protein,
      goal: settings.protein_goal,
      color: "#6366FF",
      label: "蛋白質",
      unit: "g",
    },
    carbs: {
      current: summary.total_carbs,
      goal: settings.carbs_goal,
      color: "#BDF2DE",
      label: "碳水化合物",
      unit: "g",
    },
    fat: {
      current: summary.total_fat,
      goal: settings.fat_goal,
      color: "#CFE7FF",
      label: "脂肪",
      unit: "g",
    },
  };
  const metric = METRICS[activeMetric];
  const progress = Math.min(metric.current / metric.goal, 1);
  const percent = Math.round((metric.current / metric.goal) * 100);

  const handleDelete = async (id: string) => {
    removeEntry(selectedDate, id);
    await deleteEntry(id).catch((e) =>
      console.error("[deleteEntry]", e),
    );
    refreshLogs();
  };

  const handleEdit = async (updated: FoodEntry, _date: string) => {
    updateEntryStore(selectedDate, updated);
    setEditingEntry(null);
    await updateEntry(updated).catch((e) =>
      console.error("[updateEntry]", e),
    );
    refreshLogs();
  };

  return (
    <>
      <div className="space-y-6">
        {/* ── Calendar section — fills the viewport ── */}
        <section className="h-[100dvh] flex flex-col -mt-4">
          {/* Top: date hero */}
          <div className="h-[58%] flex flex-col pt-6 pb-4">
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[8rem] leading-none font-bold tracking-tight text-[#B6B9FE]">
                {format(selected, "d")}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-6xl font-bold uppercase tracking-wide text-ink">
                {format(selected, "MMMM")}
              </div>
              <div className="text-6xl font-medium text-ink-muted">
                {format(selected, "EEE")}
              </div>
            </div>
          </div>

          {/* Bottom: circle calendar */}
          <div className="flex-1 flex flex-col pt-4 pb-4 min-h-0 overflow-y-auto">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full text-ink-muted hover:bg-surface active:scale-90 transition-all text-lg leading-none"
              >
                ‹
              </button>
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-widest">
                {format(viewMonth, "MMMM yyyy")}
              </span>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full text-ink-muted hover:bg-surface active:scale-90 transition-all text-lg leading-none disabled:opacity-25 disabled:cursor-default"
              >
                ›
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-ink-muted">
              {WEEKDAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {monthDays.map((date) => {
                const dateStr = getDateStr(date);
                const today = isToday(date);
                const future = !today && isFuture(date);
                const recorded = hasRecord(date);
                const isSelected = isSameDay(date, selected);
                const clickable = today || recorded;
                return (
                  <button
                    key={dateStr}
                    disabled={!clickable}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setTimeout(() => {
                        detailRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 50);
                    }}
                    aria-label={dateStr}
                    className={cn(
                      "aspect-square w-full rounded-full transition-all disabled:opacity-100",
                      clickable
                        ? "active:scale-90 cursor-pointer"
                        : "cursor-default",
                      today
                        ? "bg-accent"
                        : future
                          ? "bg-surface"
                          : recorded
                            ? "bg-ink-muted"
                            : "bg-border",
                      isSelected &&
                        !today &&
                        clickable &&
                        "ring-2 ring-ink ring-offset-2 ring-offset-bg",
                    )}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Daily detail ── */}
        <section ref={detailRef} className="space-y-6">
          {/* Particle ring */}
          <div className="pt-2">
            <ParticleRing progress={progress} color={metric.color} />
          </div>

          {/* Percentage */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMetric}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="text-5xl font-bold tracking-tight text-ink">
                {percent}%
              </div>
              <div className="mt-1 text-sm text-ink-muted">
                {metric.label}已達每日目標　·　{formatNum(metric.current)} /{" "}
                {metric.goal}
                {metric.unit}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* 已攝取熱量 — clickable */}
            <button
              onClick={() => setActiveMetric("calories")}
              className={cn(
                "rounded-2xl p-4 text-left transition-all active:scale-95",
                activeMetric === "calories" ? "bg-[#B6B9FE]" : "bg-surface",
              )}
            >
              <div
                className={cn(
                  "text-xs",
                  activeMetric === "calories" ? "text-black" : "text-ink-muted",
                )}
              >
                已攝取熱量
              </div>
              <div
                className={cn(
                  "mt-1 text-xl font-bold",
                  activeMetric === "calories" ? "text-black" : "text-ink",
                )}
              >
                {summary.total_calories}{" "}
                <span
                  className={cn(
                    "text-sm font-medium",
                    activeMetric === "calories"
                      ? "text-black"
                      : "text-ink-muted",
                  )}
                >
                  kcal
                </span>
              </div>
            </button>

            {/* 剩餘/超出熱量 — not clickable */}
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-xs text-ink-muted">
                {isOver ? "超出熱量" : "剩餘熱量"}
              </div>
              <div className="mt-1 text-xl font-bold text-ink">
                {Math.abs(settings.calorie_goal - summary.total_calories)}{" "}
                <span className="text-sm font-medium text-ink-muted">kcal</span>
              </div>
            </div>

            {/* 蛋白質 — clickable */}
            <button
              onClick={() => setActiveMetric("protein")}
              className={cn(
                "rounded-2xl p-4 text-left transition-all active:scale-95",
                activeMetric === "protein" ? "bg-[#6366FF]" : "bg-surface",
              )}
            >
              <div
                className={cn(
                  "text-xs",
                  activeMetric === "protein"
                    ? "text-white/70"
                    : "text-ink-muted",
                )}
              >
                蛋白質
              </div>
              <div
                className={cn(
                  "mt-1 text-xl font-bold",
                  activeMetric === "protein" ? "text-white" : "text-ink",
                )}
              >
                {formatNum(summary.total_protein)}
                <span
                  className={cn(
                    "text-sm font-medium",
                    activeMetric === "protein"
                      ? "text-white/70"
                      : "text-ink-muted",
                  )}
                >
                  {" "}
                  / {settings.protein_goal}g
                </span>
              </div>
            </button>

            {/* 碳水化合物 — clickable */}
            <button
              onClick={() => setActiveMetric("carbs")}
              className={cn(
                "rounded-2xl p-4 text-left transition-all active:scale-95",
                activeMetric === "carbs" ? "bg-[#BDF2DE]" : "bg-surface",
              )}
            >
              <div
                className={cn(
                  "text-xs",
                  activeMetric === "carbs" ? "text-black" : "text-ink-muted",
                )}
              >
                碳水化合物
              </div>
              <div
                className={cn(
                  "mt-1 text-xl font-bold",
                  activeMetric === "carbs" ? "text-black" : "text-ink",
                )}
              >
                {formatNum(summary.total_carbs)}
                <span
                  className={cn(
                    "text-sm font-medium",
                    activeMetric === "carbs" ? "text-black" : "text-ink-muted",
                  )}
                >
                  {" "}
                  / {settings.carbs_goal}g
                </span>
              </div>
            </button>

            {/* 脂肪 — clickable */}
            <button
              onClick={() => setActiveMetric("fat")}
              className={cn(
                "rounded-2xl p-4 text-left transition-all active:scale-95",
                activeMetric === "fat" ? "bg-[#CFE7FF] " : "bg-surface",
              )}
            >
              <div
                className={cn(
                  "text-xs",
                  activeMetric === "fat" ? "text-black" : "text-ink-muted",
                )}
              >
                脂肪
              </div>
              <div
                className={cn(
                  "mt-1 text-xl font-bold",
                  activeMetric === "fat" ? "text-black" : "text-ink",
                )}
              >
                {formatNum(summary.total_fat)}
                <span
                  className={cn(
                    "text-sm font-medium",
                    activeMetric === "fat" ? "text-black" : "text-ink-muted",
                  )}
                >
                  {" "}
                  / {settings.fat_goal}g
                </span>
              </div>
            </button>
          </div>

          {/* Per-meal records */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-ink">每餐紀錄</h2>
            <FoodList
              entries={entries}
              onDelete={handleDelete}
              onEdit={setEditingEntry}
            />
          </div>
        </section>
      </div>

      {editingEntry && (
        <ManualEntryModal
          initialEntry={editingEntry}
          initialDate={selectedDate}
          onConfirm={handleEdit}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  );
};
