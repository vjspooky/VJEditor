import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace';
import { EditorProvider } from '@/features/editor/EditorProvider';
import { projectService } from '@/services/projectService';
import { Link, useParams } from 'react-router-dom';

export function EditorPage() {
  const { projectId } = useParams();
  const stored = projectId ? projectService.get(projectId) : undefined;

  if (!projectId || !stored) {
    return (
      <div className="min-h-screen grid place-items-center bg-app text-fg">
        <div className="text-center">
          <p className="text-sm text-muted">Project not found.</p>
          <Link to="/dashboard" className="text-sm text-accent mt-3 inline-block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <EditorProvider projectId={projectId}>
      <EditorWorkspace />
    </EditorProvider>
  );
}
