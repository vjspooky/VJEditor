import type { Project, StoredProject, TimelineTrack } from '@/types';
import { seedMedia } from '@/data/seedMedia';

const now = '2026-09-05T10:00:00.000Z';

function project(
  partial: Pick<Project, 'id' | 'name' | 'duration' | 'thumbnailColor' | 'updatedAt'> &
    Partial<Project>,
): Project {
  return {
    aspectRatio: '16:9',
    createdAt: '2026-08-28T09:00:00.000Z',
    source: 'blank',
    ...partial,
  };
}

export const seedProjects: Project[] = [
  project({
    id: 'proj_travel',
    name: 'Travel Reel',
    duration: 32,
    thumbnailColor: '#1e3a5f',
    updatedAt: '2026-09-05T08:12:00.000Z',
    source: 'ai',
    prompt: 'Cinematic travel reel through coastal cities at dusk.',
  }),
  project({
    id: 'proj_product',
    name: 'Product Advertisement',
    duration: 24,
    thumbnailColor: '#3a2a4a',
    updatedAt: '2026-09-04T19:40:00.000Z',
    source: 'template',
    aspectRatio: '9:16',
  }),
  project({
    id: 'proj_intro',
    name: 'AI Introduction',
    duration: 45,
    thumbnailColor: '#1f4a3c',
    updatedAt: '2026-09-03T15:05:00.000Z',
    source: 'ai',
    prompt: 'Warm intro explaining how VJEditor helps creators ship faster.',
  }),
  project({
    id: 'proj_college',
    name: 'College Project',
    duration: 60,
    thumbnailColor: '#3d4a28',
    updatedAt: '2026-09-01T11:22:00.000Z',
    source: 'blank',
  }),
];

function travelTracks(): TimelineTrack[] {
  return [
    {
      id: 'track_v1',
      kind: 'video',
      name: 'V1',
      locked: false,
      muted: false,
      hidden: false,
      items: [
        {
          id: 'clip_city',
          trackId: 'track_v1',
          kind: 'video',
          name: 'City Night B-Roll',
          startMs: 0,
          durationMs: 14000,
          mediaId: 'media_broll_city',
          thumbnailColor: '#1e3a5f',
          positionX: 0,
          positionY: 0,
          scale: 100,
          rotation: 0,
          opacity: 100,
          speed: 1,
        },
        {
          id: 'clip_campus',
          trackId: 'track_v1',
          kind: 'video',
          name: 'Campus Walk',
          startMs: 14000,
          durationMs: 18000,
          mediaId: 'media_campus',
          thumbnailColor: '#3d4a28',
          positionX: 0,
          positionY: 0,
          scale: 100,
          rotation: 0,
          opacity: 100,
          speed: 1,
        },
      ],
    },
    {
      id: 'track_a1',
      kind: 'audio',
      name: 'A1',
      locked: false,
      muted: false,
      hidden: false,
      items: [
        {
          id: 'clip_music',
          trackId: 'track_a1',
          kind: 'audio',
          name: 'Cinematic Bed',
          startMs: 0,
          durationMs: 32000,
          mediaId: 'media_music',
          volume: 72,
          fadeInMs: 800,
          fadeOutMs: 1600,
          speed: 1,
        },
      ],
    },
    {
      id: 'track_t1',
      kind: 'text',
      name: 'T1',
      locked: false,
      muted: false,
      hidden: false,
      items: [
        {
          id: 'clip_title',
          trackId: 'track_t1',
          kind: 'text',
          name: 'Title',
          startMs: 400,
          durationMs: 3600,
          text: 'TRAVEL REEL',
          fontFamily: 'Inter',
          fontSize: 64,
          fontWeight: 700,
          align: 'center',
          color: '#F4F6FB',
          positionX: 0,
          positionY: -18,
          animation: 'fade',
        },
      ],
    },
    {
      id: 'track_c1',
      kind: 'caption',
      name: 'CC',
      locked: false,
      muted: false,
      hidden: false,
      items: [
        {
          id: 'cap_1',
          trackId: 'track_c1',
          kind: 'caption',
          name: 'Caption 1',
          startMs: 1600,
          durationMs: 2800,
          text: 'Golden hour on the waterfront.',
          style: 'boxed',
        },
        {
          id: 'cap_2',
          trackId: 'track_c1',
          kind: 'caption',
          name: 'Caption 2',
          startMs: 15000,
          durationMs: 3200,
          text: 'Keep moving. Keep filming.',
          style: 'outline',
        },
      ],
    },
  ];
}

function emptyTracks(): TimelineTrack[] {
  return [
    {
      id: 'track_v1',
      kind: 'video',
      name: 'V1',
      locked: false,
      muted: false,
      hidden: false,
      items: [],
    },
    {
      id: 'track_a1',
      kind: 'audio',
      name: 'A1',
      locked: false,
      muted: false,
      hidden: false,
      items: [],
    },
    {
      id: 'track_t1',
      kind: 'text',
      name: 'T1',
      locked: false,
      muted: false,
      hidden: false,
      items: [],
    },
    {
      id: 'track_c1',
      kind: 'caption',
      name: 'CC',
      locked: false,
      muted: false,
      hidden: false,
      items: [],
    },
  ];
}

export function defaultTracksFor(projectId: string): TimelineTrack[] {
  if (projectId === 'proj_travel') return travelTracks();
  if (projectId === 'proj_product') {
    const tracks = travelTracks();
    tracks[0].items = [
      {
        id: 'clip_product',
        trackId: 'track_v1',
        kind: 'video',
        name: 'Product Hero',
        startMs: 0,
        durationMs: 24000,
        mediaId: 'media_product',
        thumbnailColor: '#3a2a4a',
        positionX: 0,
        positionY: 0,
        scale: 110,
        rotation: 0,
        opacity: 100,
        speed: 1,
      },
    ];
    return tracks;
  }
  if (projectId === 'proj_intro' || projectId === 'proj_college') {
    const tracks = travelTracks();
    tracks[2].items[0] = {
      id: 'clip_title',
      trackId: 'track_t1',
      kind: 'text',
      name: 'Title',
      startMs: 400,
      durationMs: 3600,
      text: projectId === 'proj_intro' ? 'Meet VJEditor' : 'Final Submission',
      fontFamily: 'Inter',
      fontSize: 64,
      fontWeight: 700,
      align: 'center',
      color: '#F4F6FB',
      positionX: 0,
      positionY: -18,
      animation: 'fade',
    };
    return tracks;
  }
  return emptyTracks();
}

export function seedStoredProjects(): StoredProject[] {
  return seedProjects.map((item) => ({
    project: { ...item, updatedAt: item.updatedAt || now },
    tracks: defaultTracksFor(item.id),
    media: seedMedia,
  }));
}
