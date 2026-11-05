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
    name: 'Alpine Lake Sunrise',
    duration: 16,
    thumbnailColor: '#0e7490',
    updatedAt: '2026-09-05T08:12:00.000Z',
    source: 'ai',
    prompt: 'Misty Alpine Lake Sunrise with host review and animated titles.',
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
      id: 'track_t1',
      kind: 'text',
      name: 'Titles & Graphics',
      locked: false,
      muted: false,
      hidden: false,
      items: [
        {
          id: 'clip_kerala',
          trackId: 'track_t1',
          kind: 'text',
          name: 'KERALA ESCAPE',
          startMs: 400,
          durationMs: 4500,
          text: 'KERALA ESCAPE',
          fontFamily: 'Inter',
          fontSize: 64,
          fontWeight: 700,
          align: 'center',
          color: '#F4F6FB',
          positionX: 0,
          positionY: -18,
          animation: 'fade',
        },
        {
          id: 'clip_subscribe',
          trackId: 'track_t1',
          kind: 'text',
          name: 'Subscribe Callout',
          startMs: 8500,
          durationMs: 4000,
          text: 'Subscribe Now!',
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 600,
          align: 'center',
          color: '#F4F6FB',
          positionX: 0,
          positionY: 20,
          animation: 'pop',
        },
      ],
    },
    {
      id: 'track_c1',
      kind: 'caption',
      name: 'Auto Captions',
      locked: false,
      muted: false,
      hidden: false,
      items: [
        {
          id: 'cap_1',
          trackId: 'track_c1',
          kind: 'caption',
          name: 'Caption 1',
          startMs: 800,
          durationMs: 3500,
          text: 'Golden hour on the waterfront.',
          style: 'boxed',
        },
        {
          id: 'cap_2',
          trackId: 'track_c1',
          kind: 'caption',
          name: 'Caption 2',
          startMs: 5500,
          durationMs: 4000,
          text: 'Keep moving. Keep filming.',
          style: 'outline',
        },
        {
          id: 'cap_3',
          trackId: 'track_c1',
          kind: 'caption',
          name: 'Caption 3',
          startMs: 10500,
          durationMs: 4500,
          text: 'Join us for the next adventure.',
          style: 'boxed',
        },
      ],
    },
    {
      id: 'track_v2',
      kind: 'video',
      name: 'Video 2 (Host Overlay)',
      locked: false,
      muted: false,
      hidden: false,
      items: [
        {
          id: 'clip_host',
          trackId: 'track_v2',
          kind: 'video',
          name: 'Host Studio Review',
          startMs: 9500,
          durationMs: 6000,
          mediaId: 'media_presenter',
          thumbnailColor: '#1e3a8a',
          positionX: 25,
          positionY: 20,
          scale: 85,
          rotation: 0,
          opacity: 100,
          speed: 1,
        },
      ],
    },
    {
      id: 'track_v1',
      kind: 'video',
      name: 'Video 1 (Base Footage)',
      locked: false,
      muted: false,
      hidden: false,
      items: [
        {
          id: 'clip_alpine',
          trackId: 'track_v1',
          kind: 'video',
          name: 'Alpine Lake Sunrise',
          startMs: 0,
          durationMs: 7500,
          mediaId: 'media_alpine',
          thumbnailColor: '#0e7490',
          positionX: 0,
          positionY: 0,
          scale: 100,
          rotation: 0,
          opacity: 100,
          speed: 1,
        },
        {
          id: 'clip_cyberpunk',
          trackId: 'track_v1',
          kind: 'video',
          name: 'Cyberpunk Metropolis Night',
          startMs: 7500,
          durationMs: 8500,
          mediaId: 'media_cyberpunk',
          thumbnailColor: '#0e7490',
          positionX: 0,
          positionY: 0,
          scale: 100,
          rotation: 0,
          opacity: 100,
          speed: 1,
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
