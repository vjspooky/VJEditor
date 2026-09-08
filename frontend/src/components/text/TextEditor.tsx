import React, { useState } from "react";
import { TextElement } from "../../models/text";
import TextToolbar from "./TextToolbar";
import TextPresets, { TextPreset } from "./TextPresets";
import TextProperties from "./TextProperties";

interface TextEditorProps {
  elements?: TextElement[];
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onAddElement?: (element: TextElement) => void;
  onUpdateElement?: (id: string, updates: Partial<TextElement>) => void;
  onDeleteElement?: (id: string) => void;
}

export default function TextEditor({
  elements = [],
  selectedElementId = null,
  onSelectElement = () => {},
  onAddElement = () => {},
  onUpdateElement = () => {},
  onDeleteElement = () => {},
}: TextEditorProps) {
  const [activeTab, setActiveTab] = useState<"library" | "properties">("library");

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const handleAddDefaultText = (type: "heading" | "subheading" | "body") => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      content: type === "heading" ? "Heading Text" : type === "subheading" ? "Subheading Text" : "Body text goes here...",
      fontFamily: "Inter, sans-serif",
      fontSize: type === "heading" ? 36 : type === "subheading" ? 24 : 16,
      fontWeight: type === "heading" ? 700 : type === "subheading" ? 600 : 400,
      fontStyle: "normal",
      color: "#FFFFFF",
      opacity: 1,
      alignment: "center",
      letterSpacing: 0,
      lineHeight: 1.2,
      x: 100,
      y: 100,
      width: 300,
      height: 60,
      scale: 1,
      rotation: 0,
    };

    onAddElement(newElement);
    onSelectElement(newElement.id);
    setActiveTab("properties");
  };

  const handleSelectPreset = (preset: TextPreset) => {
    const newElement: TextElement = {
      ...preset.element,
      id: `text-${Date.now()}`,
      x: 150,
      y: 150,
    };
    onAddElement(newElement);
    onSelectElement(newElement.id);
    setActiveTab("properties");
  };

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
      {/* Top action / formatting toolbar */}
      <TextToolbar
        selectedElement={selectedElement}
        onUpdate={(updates) => {
          if (selectedElement) onUpdateElement(selectedElement.id, updates);
        }}
        onAddText={handleAddDefaultText}
      />

      {/* View Switcher Tabs */}
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
          onClick={() => setActiveTab("library")}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: activeTab === "library" ? "var(--color-primary, #6366F1)" : "var(--color-text-secondary, #94A3B8)",
            border: "none",
            borderBottom: activeTab === "library" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Presets & Layers ({elements.length})
        </button>
        <button
          onClick={() => setActiveTab("properties")}
          disabled={!selectedElement}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: selectedElement
              ? activeTab === "properties"
                ? "var(--color-primary, #6366F1)"
                : "var(--color-text-secondary, #94A3B8)"
              : "#475569",
            border: "none",
            borderBottom: activeTab === "properties" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
            cursor: selectedElement ? "pointer" : "not-allowed",
          }}
        >
          Properties
        </button>
      </div>

      {/* Body Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {activeTab === "library" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Existing Text Layers */}
            {elements.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" }}>
                  Active Text Elements
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {elements.map((el) => (
                    <div
                      key={el.id}
                      onClick={() => {
                        onSelectElement(el.id);
                        setActiveTab("properties");
                      }}
                      style={{
                        padding: "8px 12px",
                        background: el.id === selectedElementId ? "var(--color-primary-subtle, #312E81)" : "var(--color-surface, #1E293B)",
                        border: `1px solid ${el.id === selectedElementId ? "var(--color-primary, #6366F1)" : "var(--color-border, #334155)"}`,
                        borderRadius: 6,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "#FFF",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                        }}
                      >
                        {el.content || "(Empty text)"}
                      </span>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>
                        {el.fontSize}px
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Presets Grid */}
            <TextPresets onSelectPreset={handleSelectPreset} />
          </div>
        ) : selectedElement ? (
          <TextProperties
            element={selectedElement}
            onUpdate={(updates) => onUpdateElement(selectedElement.id, updates)}
            onDelete={(id) => {
              onDeleteElement(id);
              onSelectElement(null);
              setActiveTab("library");
            }}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#64748B", paddingTop: 40, fontSize: 13 }}>
            Select a text element to edit properties
          </div>
        )}
      </div>
    </div>
  );
}
