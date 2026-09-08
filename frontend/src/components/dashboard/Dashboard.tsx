import { useState, useEffect } from "react";
import { getProjects } from "../../store/projectStore";
import { Project } from "../../models/project";
import DashboardHeader from "./DashboardHeader";
import WelcomeSection from "./WelcomeSection";
import QuickCreate from "./QuickCreate";
import ProjectGrid from "./ProjectGrid";
import EmptyProjectsState from "./EmptyProjectsState";
import CreateProjectModal from "./CreateProjectModal";
import AIProjectModal from "./AIProjectModal";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  function refresh() {
    setProjects(getProjects());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1280, margin: "0 auto" }}>
      <DashboardHeader onNewProject={() => setShowCreateModal(true)} />
      <WelcomeSection />
      <QuickCreate
        onBlank={() => setShowCreateModal(true)}
        onAI={() => setShowAIModal(true)}
      />

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 20 }}>Recent Projects</h2>
        {projects.length === 0 ? (
          <EmptyProjectsState onCreate={() => setShowCreateModal(true)} />
        ) : (
          <ProjectGrid projects={projects} onRefresh={refresh} />
        )}
      </section>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { refresh(); setShowCreateModal(false); }}
        />
      )}
      {showAIModal && (
        <AIProjectModal
          onClose={() => setShowAIModal(false)}
          onCreated={() => { refresh(); setShowAIModal(false); }}
        />
      )}
    </div>
  );
}
