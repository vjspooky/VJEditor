import { useState } from "react";
import { Project } from "../../models/project";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  onRefresh: () => void;
}

export default function ProjectGrid({ projects, onRefresh }: ProjectGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 20,
      }}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
