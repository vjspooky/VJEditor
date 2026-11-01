import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace';
import { EditorProvider } from '@/features/editor/EditorProvider';
import { projectService } from '@/services/projectService';
import { useParams } from 'react-router-dom';

export function EditorPage() {
  const { projectId } = useParams();
  // Ensure the AI Studio loads Alpine Lake Sunrise workspace from prototype
  const validId = projectId && projectService.get(projectId) ? projectId : 'proj_travel';

  return (
    <EditorProvider projectId={validId}>
      <EditorWorkspace />
    </EditorProvider>
  );
}
