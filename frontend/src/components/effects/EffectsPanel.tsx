import React, { useState } from "react";
import { ClipEffect, Transition } from "../../models/effects";
import FiltersPanel from "./FiltersPanel";
import TransitionPanel from "./TransitionPanel";
import EffectControls from "./EffectControls";

interface EffectsPanelProps {
  effects?: ClipEffect[];
  selectedTransition?: Transition | null;
  onApplyFilter?: (type: ClipEffect["type"], intensity: number) => void;
  onApplyTransition?: (transition: Transition) => void;
  onUpdateEffect?: (id: string, updates: Partial<ClipEffect>) => void;
  onRemoveEffect?: (id: string) => void;
  onAddEffect?: (type: ClipEffect["type"]) => void;
}

export default function EffectsPanel({
  effects = [],
  selectedTransition = null,
  onApplyFilter = () => {},
  onApplyTransition = () => {},
  onUpdateEffect = () => {},
  onRemoveEffect = () => {},
  onAddEffect = () => {},
}: EffectsPanelProps) {
  const [activeTab, setActiveTab] = useState<"filters" | "transitions" | "adjustments">("filters");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--color-background-secondary, #0F172A)",
        borderRight: "1px solid var(--color-border, #334155)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--color-surface, #1E293B)",
          borderBottom: "1px solid var(--color-border, #334155)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#FFF" }}>Effects & Transitions</span>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border, #334155)",
          padding: "0 12px",
          gap: 8,
          background: "var(--color-surface, #1E293B)",
        }}
      >
        <button
          onClick={() => setActiveTab("filters")}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: activeTab === "filters" ? "var(--color-primary, #6366F1)" : "var(--color-text-secondary, #94A3B8)",
            border: "none",
            borderBottom: activeTab === "filters" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Filters
        </button>
        <button
          onClick={() => setActiveTab("transitions")}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: activeTab === "transitions" ? "var(--color-primary, #6366F1)" : "var(--color-text-secondary, #94A3B8)",
            border: "none",
            borderBottom: activeTab === "transitions" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Transitions
        </button>
        <button
          onClick={() => setActiveTab("adjustments")}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: activeTab === "adjustments" ? "var(--color-primary, #6366F1)" : "var(--color-text-secondary, #94A3B8)",
            border: "none",
            borderBottom: activeTab === "adjustments" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Active ({effects.length})
        </button>
      </div>

      {/* Body Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {activeTab === "filters" && (
          <FiltersPanel
            onApplyFilter={onApplyFilter}
            activeEffects={effects}
          />
        )}
        {activeTab === "transitions" && (
          <TransitionPanel
            onApplyTransition={onApplyTransition}
            selectedTransition={selectedTransition}
          />
        )}
        {activeTab === "adjustments" && (
          <EffectControls
            effects={effects}
            onUpdateEffect={onUpdateEffect}
            onRemoveEffect={onRemoveEffect}
            onAddEffect={onAddEffect}
          />
        )}
      </div>
    </div>
  );
}
