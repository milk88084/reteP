import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsStore } from "@/store/settingsStore";
import { useFoodLogStore } from "@/store/foodLogStore";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { calcTDEE } from "@/utils/nutritionCalc";
import { UserSettings, GenderType, GoalType } from "@/types";
import { cn } from "@/utils/cn";

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
        className="w-20 text-right bg-surface rounded-xl px-3 py-1.5 text-sm font-semibold text-ink border-none outline-none focus:ring-2 focus:ring-brand"
      />
      <span className="text-xs text-ink-muted w-8">{unit}</span>
    </div>
  </div>
);

interface SettingsPageProps {
  onSaved?: () => void;
}

export const SettingsPage = ({ onSaved }: SettingsPageProps) => {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useSettingsStore();
  const clearLogs = useFoodLogStore((s) => s.setLogs);
  const [draft, setDraft] = useState<UserSettings>({ ...settings });
  const [saved, setSaved] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const set = (key: keyof UserSettings) => (v: number | string) =>
    setDraft((d) => ({ ...d, [key]: v }));

  // Auto-recalculate daily goals whenever body data changes
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

  const handleSave = () => {
    updateSettings(draft, user?.id);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved?.();
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-4">
      {/* User card */}
      {user && (
        <div className="flex items-center gap-3 bg-surface rounded-2xl p-4">
          <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-lg font-bold text-ink shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink text-sm">{user.name}</p>
            {user.email && (
              <p className="text-xs text-ink-muted">{user.email}</p>
            )}
          </div>
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-muted hover:bg-border hover:text-red-500 transition-colors"
            aria-label="登出"
          >
            <LogoutIcon />
          </button>
        </div>
      )}

      {/* Body profile */}
      <div className="bg-surface rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            身體資料
          </h2>
          {(() => {
            const bmi =
              draft.height > 0
                ? draft.weight / Math.pow(draft.height / 100, 2)
                : 0;
            const category =
              bmi === 0
                ? ""
                : bmi < 18.5
                  ? "過輕"
                  : bmi < 25
                    ? "正常"
                    : bmi < 30
                      ? "過重"
                      : "肥胖";
            const color =
              bmi === 0
                ? ""
                : bmi < 18.5
                  ? "text-blue-500"
                  : bmi < 25
                    ? "text-green-600"
                    : bmi < 30
                      ? "text-yellow-600"
                      : "text-red-500";
            return bmi > 0 ? (
              <div className="text-right">
                <span className="text-lg font-bold text-ink">
                  {bmi.toFixed(1)}
                </span>
                <span className="text-xs text-ink-muted ml-1">BMI</span>
                <span className={cn("ml-2 text-xs font-semibold", color)}>
                  {category}
                </span>
              </div>
            ) : null;
          })()}
        </div>

        {/* Gender */}
        <div>
          <p className="text-xs font-medium text-ink-muted mb-2">性別</p>
          <div className="flex gap-2">
            {(["male", "female"] as GenderType[]).map((g) => (
              <button
                key={g}
                onClick={() => set("gender")(g)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-semibold border transition-all",
                  draft.gender === g
                    ? "bg-accent text-white border-accent"
                    : "bg-bg text-ink-muted border-border",
                )}
              >
                {g === "male" ? "男" : "女"}
              </button>
            ))}
          </div>
        </div>

        {/* Age / Height / Weight */}
        <div className="border-t border-border pt-1">
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
        </div>

        {/* Goal */}
        <div>
          <p className="text-xs font-medium text-ink-muted mb-2">目標</p>
          <div className="flex gap-2">
            {(["lose", "maintain", "gain"] as GoalType[]).map((g) => (
              <button
                key={g}
                onClick={() => set("goal")(g)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                  draft.goal === g
                    ? "bg-accent text-white border-accent"
                    : "bg-bg text-ink-muted border-border",
                )}
              >
                {GOAL_LABELS[g]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily goals */}
      <div className="bg-surface rounded-2xl p-4">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
          每日目標
        </h2>
        <p className="text-[10px] text-ink-muted mb-3">
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
          <Button variant="brand" onClick={handleSave} className="w-full">
            {saved ? "已儲存 ✓" : "儲存設定"}
          </Button>
        </div>
      </div>

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
