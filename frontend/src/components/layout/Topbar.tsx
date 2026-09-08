import React from "react";
import Button from "../common/Button";

interface TopbarProps {
  title?: string;
  onNewProject?: () => void;
}

export default function Topbar({ title = "Workspace", onNewProject }: TopbarProps) {
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950 px-6 flex items-center justify-between shrink-0">
      <div className="font-semibold text-white text-base">{title}</div>
      <div className="flex items-center gap-3">
        {onNewProject && (
          <Button onClick={onNewProject} variant="primary">
            + New Project
          </Button>
        )}
      </div>
    </header>
  );
}
