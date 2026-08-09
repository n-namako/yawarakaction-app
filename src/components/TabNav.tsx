"use client";

import { Home, NotebookPen } from "lucide-react";

export type TabKey = "home" | "records";

interface TabNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: "home", label: "きょうの一歩", icon: Home },
  { key: "records", label: "きろく", icon: NotebookPen },
];

export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="mx-auto flex w-fit gap-1 rounded-full bg-white/70 p-1.5 shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
              isActive
                ? "bg-gradient-to-br from-rose-300 to-orange-300 text-white shadow-md"
                : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
