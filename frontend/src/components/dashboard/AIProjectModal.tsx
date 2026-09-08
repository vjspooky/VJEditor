import { useState } from "react";
import { createProject } from "../../store/projectStore";
import { Project } from "../../models/project";
import Modal from "../common/Modal";

interface AIProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function AIProjectModal({ onClose, onCreated }: AIProjectModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);

    // TODO: Call ai-service /api/video/generate with prompt
    await new Promise((r) => setTimeout(r, 1500));

    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      name: `AI: ${prompt.slice(0, 32)}`,
      duration: 60,
      aspectRatio: "16:9",
      resolution: "1080p",
      type: "ai",
      createdAt: now,
      updatedAt: now,
    };
    createProject(project);
    setLoading(false);
    onCreated();
  }

  return (
    <Modal title="🤖 AI-Assisted Project" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Describe what you want to create and AI will generate a complete project with clips, voiceover, and captions.
        </p>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
            Your Prompt
          </label>
          <textarea
            id="ai-project-prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A 60-second product showcase video for a sleek smartwatch with energetic music and captions…"
            style={{ resize: "vertical" }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            id="ai-project-cancel"
            onClick={onClose}
            disabled={loading}
            style={{
              background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
              color: "var(--color-text)", borderRadius: "var(--radius-md)",
              padding: "9px 20px", cursor: "pointer", fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            id="ai-project-generate"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              background: "var(--color-accent)", color: "#000",
              border: "none", borderRadius: "var(--radius-md)",
              padding: "9px 20px", fontWeight: 600,
              cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
              opacity: loading || !prompt.trim() ? 0.6 : 1,
            }}
          >
            {loading ? "Generating…" : "Generate Project"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
