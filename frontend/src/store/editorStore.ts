import { Project } from "../models/project";
import { MediaAsset } from "../models/media";
import { TimelineTrack, TimelineClip } from "../models/timeline";

export interface EditorState {
  project: Project | null;
  media: MediaAsset[];
  tracks: TimelineTrack[];
  selection: {
    selectedTrackId: string | null;
    selectedClipId: string | null;
    selectedElementId: string | null;
  };
  playback: {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    playbackRate: number;
  };
  ui: {
    activeTool: string;
    zoom: number;
    activeModal: string | null;
  };
}

export const initialEditorState: EditorState = {
  project: null,
  media: [],
  tracks: [],
  selection: {
    selectedTrackId: null,
    selectedClipId: null,
    selectedElementId: null,
  },
  playback: {
    currentTime: 0,
    duration: 30,
    isPlaying: false,
    playbackRate: 1,
  },
  ui: {
    activeTool: "select",
    zoom: 1,
    activeModal: null,
  },
};
