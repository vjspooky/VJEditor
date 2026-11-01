import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace';
import { EditorProvider } from '@/features/editor/EditorProvider';
import { projectService } from '@/services/projectService';
import { useParams } from 'react-router-dom';

export function EditorPage() {
  const { projectId } = useParams();
  const validId = projectId || 'proj_travel';
  let stored = projectService.get(validId);

  if (!stored) {
    stored = {
      project: {
        id: validId,
        name: 'AI Video Workspace',
        duration: 60,
        aspectRatio: '16:9',
        resolution: '1080p',
        thumbnailColor: '#1e3a5f',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'blank',
      },
      tracks: [
        { id: 'track_v1', kind: 'video', name: 'V1', locked: false, muted: false, hidden: false, items: [] },
        { id: 'track_a1', kind: 'audio', name: 'A1', locked: false, muted: false, hidden: false, items: [] },
        { id: 'track_t1', kind: 'text', name: 'T1', locked: false, muted: false, hidden: false, items: [] },
        { id: 'track_c1', kind: 'caption', name: 'CC', locked: false, muted: false, hidden: false, items: [] },
      ],
      media: [],
    };
    projectService.save(stored);
  }

  return (
    <EditorProvider projectId={validId}>
      <EditorWorkspace />
    </EditorProvider>
  );
}
