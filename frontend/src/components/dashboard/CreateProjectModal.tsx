import { useState } from "react";
import { createProject } from "../../store/projectStore";
import { Project } from "../../models/project";
import Modal from "../common/Modal";

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("Untitled Project");
  const [aspectRatio, setAspectRatio] = useState<Project["aspectRatio"]>("16:9");
  const [resolution, setResolution] = useState<Project["resolution"]>("1080p");

  function handleCreate() {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled Project",
      duration: 60,
      aspectRatio,
      resolution,
      type: "blank",
      createdAt: now,
      updatedAt: now,
    };
    createProject(project);
    onCreated();
  }

  return (
    <Modal title="New Project" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
            Project Name
          </label>
          <input
            id="create-project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
            Aspect Ratio
          </label>
          <select
            id="create-project-aspect"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as Project["aspectRatio"])}
          >
            <option value="16:9">16:9 — Landscape</option>
            <option value="9:16">9:16 — Portrait (Reels/Shorts)</option>
            <option value="1:1">1:1 — Square</option>
            <option value="4:5">4:5 — Portrait</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
            Resolution
          </label>
          <select
            id="create-project-res"
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Project["resolution"])}
          >
            <option value="720p">720p HD</option>
            <option value="1080p">1080p Full HD</option>
            <option value="4K">4K Ultra HD</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <button
            id="create-project-cancel"
            onClick={onClose}
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              borderRadius: "var(--radius-md)",
              padding: "9px 20px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            id="create-project-confirm"
            onClick={handleCreate}
            style={{
              background: "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "9px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Create Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
