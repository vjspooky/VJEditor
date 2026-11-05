# src_builder/data.py

DATA_CONTENT = """
// Default Stock Media Assets
const DEFAULT_MEDIA = [
  {
    id: 'media-alpine',
    name: 'Misty Alpine Lake Sunrise.mp4',
    type: 'video',
    url: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4148827359737563540.jpg',
    thumbnail: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4148827359737563540.jpg',
    duration: 8.0,
    width: 1920,
    height: 1080,
    fps: 30,
    size: '12.4 MB',
    tag: 'Travel'
  },
  {
    id: 'media-cyberpunk',
    name: 'Cyberpunk Metropolis Night.mp4',
    type: 'video',
    url: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_10555962940228783301.jpg',
    thumbnail: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_10555962940228783301.jpg',
    duration: 10.0,
    width: 1920,
    height: 1080,
    fps: 30,
    size: '18.1 MB',
    tag: 'Cinematic'
  },
  {
    id: 'media-greenscreen',
    name: 'Studio Presenter GreenScreen.mp4',
    type: 'video',
    url: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4111635643074853495.jpg',
    thumbnail: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4111635643074853495.jpg',
    duration: 12.0,
    width: 1920,
    height: 1080,
    fps: 30,
    size: '15.6 MB',
    tag: 'Green Screen'
  }
];

// Music Library Categories (10 Categories)
const MUSIC_LIBRARY = [
  { id: 'm-lofi', name: 'Midnight Coffee Lo-Fi', category: 'Lo-fi', duration: 15.0, bpm: 82, mood: 'Relaxed' },
  { id: 'm-cine', name: 'Epic Horizons Orchestra', category: 'Cinematic', duration: 20.0, bpm: 110, mood: 'Grand' },
  { id: 'm-travel', name: 'Sunrise Across Oceans', category: 'Travel', duration: 16.0, bpm: 95, mood: 'Uplifting' },
  { id: 'm-vlog', name: 'Weekend Street Groove', category: 'Vlog', duration: 12.0, bpm: 120, mood: 'Breezy' },
  { id: 'm-energy', name: 'HyperDrive Neon Beat', category: 'Energetic', duration: 14.0, bpm: 128, mood: 'Intense' },
  { id: 'm-ambient', name: 'Deep Space Meditation', category: 'Ambient', duration: 25.0, bpm: 65, mood: 'Calm' },
  { id: 'm-hiphop', name: 'BoomBap Golden Era', category: 'Hip-hop', duration: 15.0, bpm: 90, mood: 'Rhythmic' },
  { id: 'm-gaming', name: '8-Bit Cyber Battle', category: 'Gaming', duration: 12.0, bpm: 135, mood: 'Fast' },
  { id: 'm-corp', name: 'Inspiring Tech Vision', category: 'Corporate', duration: 18.0, bpm: 115, mood: 'Professional' },
  { id: 'm-emot', name: 'Memory of Falling Rain', category: 'Emotional', duration: 22.0, bpm: 72, mood: 'Reflective' }
];

// Sound Effects Library Categories (10 Categories)
const SFX_LIBRARY = [
  { id: 'sfx-whoosh', name: 'Cinematic High Whoosh', category: 'Whoosh', duration: 0.8 },
  { id: 'sfx-hit', name: 'Heavy Bass Trailer Hit', category: 'Hit', duration: 1.2 },
  { id: 'sfx-impact', name: 'Sub Bass Impact Drop', category: 'Impact', duration: 1.5 },
  { id: 'sfx-pop', name: 'Soft Bubble Pop', category: 'Pop', duration: 0.3 },
  { id: 'sfx-click', name: 'Mechanical Switch Click', category: 'Click', duration: 0.2 },
  { id: 'sfx-bell', name: 'Digital Notification Chime', category: 'Notification', duration: 0.9 },
  { id: 'sfx-explode', name: 'Deep Cinematic Explosion', category: 'Explosion', duration: 2.1 },
  { id: 'sfx-crowd', name: 'Audience Cheer & Applause', category: 'Crowd', duration: 3.0 },
  { id: 'sfx-nature', name: 'Forest Wind & Bird Chirp', category: 'Nature', duration: 4.0 },
  { id: 'sfx-ui', name: 'Clean Modern Interface Beep', category: 'UI sounds', duration: 0.25 }
];

// Transitions (Categories: Basic, 3D, Camera, Glitch, Light, Blur, Motion, Shape, Retro, Cinematic)
const TRANSITIONS_LIBRARY = [
  { id: 'fade', name: 'Fade Through Black', category: 'Basic', duration: 0.8, icon: 'Contrast' },
  { id: 'dissolve', name: 'Cross Dissolve', category: 'Basic', duration: 1.0, icon: 'Blend' },
  { id: 'slide-left', name: 'Slide Left', category: 'Motion', duration: 0.6, icon: 'ArrowLeft' },
  { id: 'slide-right', name: 'Slide Right', category: 'Motion', duration: 0.6, icon: 'ArrowRight' },
  { id: 'push-up', name: 'Push Up', category: 'Motion', duration: 0.6, icon: 'ArrowUp' },
  { id: 'zoom-in', name: 'Dynamic Zoom In', category: 'Camera', duration: 0.5, icon: 'ZoomIn' },
  { id: 'spin-3d', name: '3D Cube Spin', category: '3D', duration: 0.7, icon: 'RotateCw' },
  { id: 'blur-dissolve', name: 'Radial Blur Melt', category: 'Blur', duration: 0.8, icon: 'EyeOff' },
  { id: 'flash-white', name: 'Light Leak Flash', category: 'Light', duration: 0.4, icon: 'Zap' },
  { id: 'digital-glitch', name: 'RGB Cyber Glitch', category: 'Glitch', duration: 0.5, icon: 'Cpu' },
  { id: 'retro-burn', name: 'Old Film Burn', category: 'Retro', duration: 0.9, icon: 'Flame' },
  { id: 'cinematic-wipe', name: 'Anamorphic Wipe', category: 'Cinematic', duration: 0.8, icon: 'Film' }
];

// Effects Categories (Cinematic, Glitch, Motion, Retro, Lighting)
const EFFECTS_LIBRARY = [
  { id: 'vignette', name: 'Cinematic Vignette', category: 'Cinematic', intensity: 50, icon: 'Circle' },
  { id: 'film-grain', name: '35mm Film Grain', category: 'Cinematic', intensity: 35, icon: 'Sparkles' },
  { id: 'letterbox', name: '2.35:1 Anamorphic Bars', category: 'Cinematic', intensity: 100, icon: 'Film' },
  { id: 'rgb-split', name: 'Chromatic RGB Split', category: 'Glitch', intensity: 40, icon: 'Layers' },
  { id: 'scanlines', name: 'CRT Monitor Scanlines', category: 'Glitch', intensity: 50, icon: 'Tv' },
  { id: 'digital-noise', name: 'Digital Noise Burst', category: 'Glitch', intensity: 30, icon: 'Shuffle' },
  { id: 'camera-shake', name: 'Action Camera Shake', category: 'Motion', intensity: 45, icon: 'Activity' },
  { id: 'motion-blur', name: 'Kinetic Motion Blur', category: 'Motion', intensity: 60, icon: 'Wind' },
  { id: 'vhs-tape', name: '90s VHS Camcorder', category: 'Retro', intensity: 65, icon: 'Video' },
  { id: 'old-film', name: '1920s Sepia Scratches', category: 'Retro', intensity: 50, icon: 'Clock' },
  { id: 'glow-bloom', name: 'Dreamy Exposure Bloom', category: 'Lighting', intensity: 45, icon: 'Sun' },
  { id: 'light-leak', name: 'Golden Hour Light Leak', category: 'Lighting', intensity: 55, icon: 'Zap' }
];

// Filters (11 Categories: Cinematic, Portrait, Landscape, Food, Travel, Vintage, Black & White, Warm, Cool, HDR, Retro)
const FILTERS_LIBRARY = [
  { id: 'cinematic-teal', name: 'Teal & Orange Blockbuster', category: 'Cinematic', contrast: 1.25, saturation: 1.3, brightness: 1.05, temp: 'cool' },
  { id: 'portrait-clean', name: 'Soft Studio Skin', category: 'Portrait', contrast: 1.1, saturation: 1.15, brightness: 1.1, temp: 'warm' },
  { id: 'landscape-vivid', name: 'Emerald Nature Pop', category: 'Landscape', contrast: 1.2, saturation: 1.45, brightness: 1.0, temp: 'neutral' },
  { id: 'food-delicious', name: 'Warm Culinary Glow', category: 'Food', contrast: 1.15, saturation: 1.35, brightness: 1.08, temp: 'warm' },
  { id: 'travel-wander', name: 'Mediterranean Sunset', category: 'Travel', contrast: 1.18, saturation: 1.25, brightness: 1.05, temp: 'warm' },
  { id: 'vintage-fade', name: 'Faded Kodachrome', category: 'Vintage', contrast: 0.95, saturation: 0.85, brightness: 1.02, temp: 'warm' },
  { id: 'bw-noir', name: 'High Contrast Noir B&W', category: 'Black & White', contrast: 1.4, saturation: 0.0, brightness: 1.0, temp: 'neutral' },
  { id: 'warm-golden', name: 'Golden Hour Radiance', category: 'Warm', contrast: 1.1, saturation: 1.2, brightness: 1.05, temp: 'warm' },
  { id: 'cool-neon', name: 'Cyberpunk Arctic Ice', category: 'Cool', contrast: 1.25, saturation: 1.3, brightness: 1.0, temp: 'cool' },
  { id: 'hdr-hyper', name: 'Ultra Dynamic HDR', category: 'HDR', contrast: 1.35, saturation: 1.4, brightness: 1.12, temp: 'neutral' },
  { id: 'retro-cassette', name: 'Lo-Fi Synthwave 84', category: 'Retro', contrast: 1.15, saturation: 1.2, brightness: 0.98, temp: 'cool' }
];

// Text Presets & Title Templates
const TEXT_PRESETS = [
  { id: 't-cinematic', name: 'Cinematic Title', font: 'Playfair Display', size: 54, weight: '700', color: '#ffffff', shadow: true, anim: 'fade' },
  { id: 't-bold', name: 'Bold YouTube Hook', font: 'Montserrat', size: 62, weight: '900', color: '#facc15', stroke: '#000000', strokeWidth: 4, anim: 'pop' },
  { id: 't-neon', name: 'Neon Cyber Glow', font: 'Bebas Neue', size: 72, weight: '400', color: '#06b6d4', glow: true, anim: 'glitch' },
  { id: 't-minimal', name: 'Modern Sans Lower 3rd', font: 'Inter', size: 36, weight: '500', color: '#f8fafc', bg: 'rgba(15,23,42,0.85)', anim: 'slide' },
  { id: 't-typewriter', name: 'Retro Typewriter', font: 'JetBrains Mono', size: 38, weight: '500', color: '#22c55e', anim: 'typewriter' }
];

// Sticker & Emoji Library
const STICKERS_LIBRARY = [
  { id: 'st-fire', emoji: '🔥', label: 'Fire Energy', anim: 'bounce' },
  { id: 'st-sub', label: 'SUBSCRIBE', badge: true, color: '#ef4444', anim: 'pop' },
  { id: 'st-like', label: '👍 LIKE & SHARE', badge: true, color: '#3b82f6', anim: 'pulse' },
  { id: 'st-spark', emoji: '✨', label: 'Sparkles', anim: 'spin' },
  { id: 'st-100', emoji: '💯', label: 'Top Tier', anim: 'pop' },
  { id: 'st-arrow', label: '➔ LOOK HERE', badge: true, color: '#f59e0b', anim: 'slide' },
  { id: 'st-heart', emoji: '❤️', label: 'Heart Burst', anim: 'pop' },
  { id: 'st-skull', emoji: '💀', label: 'Dead / Insane', anim: 'shake' },
  { id: 'st-rocket', emoji: '🚀', label: 'Viral Rocket', anim: 'slide' },
  { id: 'st-eyes', emoji: '👀', label: 'Notice This', anim: 'bounce' }
];

// Shapes
const SHAPES_LIBRARY = [
  { id: 'sh-rect', type: 'rectangle', name: 'Rectangle Box', fill: '#06b6d4', opacity: 0.8 },
  { id: 'sh-circle', type: 'circle', name: 'Accent Circle', fill: '#6366f1', opacity: 0.9 },
  { id: 'sh-star', type: 'star', name: 'Highlight Star', fill: '#f59e0b', opacity: 1.0 },
  { id: 'sh-triangle', type: 'triangle', name: 'Arrow Pointer', fill: '#ef4444', opacity: 0.9 }
];

// Multi-Track Project Templates (12 Categories)
const PROJECT_TEMPLATES = [
  {
    id: 'tpl-travel',
    name: 'Cinematic Travel Vlog (Kerala)',
    category: 'Travel',
    aspectRatio: '16:9',
    duration: 14.0,
    placeholders: 4,
    description: 'Breathtaking landscape montage with 2.35:1 letterbox, golden hour color grade, and ambient strings.'
  },
  {
    id: 'tpl-shorts',
    name: 'Viral TikTok / Reels Hook',
    category: 'Shorts',
    aspectRatio: '9:16',
    duration: 10.0,
    placeholders: 3,
    description: 'Fast-paced vertical reel with animated bold karaoke subtitles, sound effect pops, and neon badges.'
  },
  {
    id: 'tpl-greenscreen',
    name: 'Studio Host Review (Chroma Key)',
    category: 'YouTube',
    aspectRatio: '16:9',
    duration: 12.0,
    placeholders: 3,
    description: 'Professional tech presenter with green screen removed over cyberpunk neon B-roll, lower-third graphics.'
  },
  {
    id: 'tpl-lofi',
    name: 'Lo-Fi Chill & Study Beats',
    category: 'Cinematic',
    aspectRatio: '1:1',
    duration: 15.0,
    placeholders: 2,
    description: 'Square aesthetic visualizer with warm vintage grain, relaxing chords, and soft pastel typography.'
  },
  {
    id: 'tpl-gaming',
    name: 'Esports Highlight Montage',
    category: 'Gaming',
    aspectRatio: '16:9',
    duration: 12.0,
    placeholders: 4,
    description: 'High-energy cuts with speed ramping, RGB glitch transitions, and heavy bass impact SFX.'
  },
  {
    id: 'tpl-product',
    name: 'Commercial Product Ad Showcase',
    category: 'Business',
    aspectRatio: '4:5',
    duration: 10.0,
    placeholders: 3,
    description: 'Instagram feed ad layout with smooth motion slides, feature callout tags, and sleek logo outro.'
  }
];

// Initial Demo Project Structure
function createInitialProject() {
  return {
    id: 'proj-kerala-cinematic',
    name: 'Kerala Cinematic Journey - 4K Master',
    aspectRatio: '16:9',
    resolution: '1080p',
    fps: 30,
    duration: 16.0,
    brandKit: {
      logoName: 'VJ STUDIO',
      primaryColor: '#06b6d4',
      watermarkEnabled: true,
      watermarkPosition: 'top-right',
      watermarkOpacity: 0.65
    },
    markers: [
      { id: 'mk-1', time: 0.0, label: 'Intro Hook', color: '#06b6d4' },
      { id: 'mk-2', time: 5.5, label: 'B-Roll Transition', color: '#f59e0b' },
      { id: 'mk-3', time: 11.0, label: 'Host Breakdown', color: '#10b981' }
    ],
    tracks: [
      {
        id: 'track-text',
        name: 'Titles & Graphics',
        type: 'text',
        isVisible: true,
        isLocked: false,
        isMuted: false,
        clips: [
          {
            id: 'clip-t1',
            trackId: 'track-text',
            name: 'KERALA ESCAPE',
            type: 'text',
            startTime: 0.5,
            duration: 4.5,
            content: 'KERALA: GODS OWN COUNTRY',
            font: 'Montserrat',
            fontSize: 48,
            fontWeight: '900',
            color: '#ffffff',
            stroke: '#000000',
            strokeWidth: 3,
            shadow: true,
            animation: 'pop',
            x: 0,
            y: -140,
            scale: 1,
            rotation: 0,
            opacity: 1
          },
          {
            id: 'clip-t2',
            trackId: 'track-text',
            name: 'Subscribe Callout',
            type: 'text',
            startTime: 8.0,
            duration: 4.0,
            content: '★ FOLLOW FOR THE 4K SERIES ★',
            font: 'Inter',
            fontSize: 28,
            fontWeight: '700',
            color: '#facc15',
            bg: 'rgba(0,0,0,0.75)',
            animation: 'bounce',
            x: 0,
            y: 160,
            scale: 1,
            rotation: 0,
            opacity: 1
          }
        ]
      },
      {
        id: 'track-captions',
        name: 'Auto Captions',
        type: 'caption',
        isVisible: true,
        isLocked: false,
        isMuted: false,
        clips: [
          {
            id: 'cap-1',
            trackId: 'track-captions',
            name: 'Caption 1',
            type: 'caption',
            startTime: 1.0,
            duration: 3.5,
            content: 'Waking up to the mists of the Western Ghats...',
            style: 'karaoke',
            highlightWord: 'mists',
            fontSize: 32,
            color: '#ffffff'
          },
          {
            id: 'cap-2',
            trackId: 'track-captions',
            name: 'Caption 2',
            type: 'caption',
            startTime: 5.5,
            duration: 4.0,
            content: 'This is absolutely an AMAZING destination!',
            style: 'bold',
            highlightWord: 'AMAZING',
            fontSize: 34,
            color: '#38bdf8'
          },
          {
            id: 'cap-3',
            trackId: 'track-captions',
            name: 'Caption 3',
            type: 'caption',
            startTime: 10.0,
            duration: 4.5,
            content: 'Experience breathtaking 4K cinematic journeys with VJEditor.',
            style: 'karaoke',
            highlightWord: 'VJEditor',
            fontSize: 32,
            color: '#ffffff'
          }
        ]
      },
      {
        id: 'track-overlay',
        name: 'Video 2 (Host Overlay)',
        type: 'video',
        isVisible: true,
        isLocked: false,
        isMuted: false,
        clips: [
          {
            id: 'clip-host-pip',
            trackId: 'track-overlay',
            name: 'Host Studio Review',
            type: 'video',
            mediaId: 'media-greenscreen',
            mediaUrl: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4111635643074853495.jpg',
            startTime: 9.5,
            duration: 6.0,
            sourceStartTime: 0,
            sourceDuration: 6.0,
            x: 280,
            y: 110,
            scale: 0.55,
            rotation: 0,
            opacity: 1.0,
            chromaKey: {
              enabled: true,
              keyColor: '#2b9849',
              similarity: 0.38,
              smoothness: 0.15,
              spill: 0.25
            },
            colorGrading: {
              brightness: 1.05,
              contrast: 1.15,
              saturation: 1.1,
              temperature: 0.05
            },
            keyframes: []
          }
        ]
      },
      {
        id: 'track-video',
        name: 'Video 1 (Base Footage)',
        type: 'video',
        isVisible: true,
        isLocked: false,
        isMuted: false,
        clips: [
          {
            id: 'clip-v1',
            trackId: 'track-video',
            name: 'Alpine Lake Sunrise',
            type: 'video',
            mediaId: 'media-alpine',
            mediaUrl: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_4148827359737563540.jpg',
            startTime: 0.0,
            duration: 7.5,
            sourceStartTime: 0.0,
            sourceDuration: 7.5,
            x: 0,
            y: 0,
            scale: 1.0,
            rotation: 0,
            opacity: 1.0,
            speed: 1.0,
            speedCurve: 'hero',
            colorGrading: {
              brightness: 1.05,
              contrast: 1.2,
              saturation: 1.25,
              temperature: 0.1,
              highlights: 0.1,
              shadows: -0.05
            },
            effects: [
              { type: 'letterbox', intensity: 100 },
              { type: 'vignette', intensity: 35 },
              { type: 'film-grain', intensity: 20 }
            ],
            transitionIn: { type: 'dissolve', duration: 0.8 },
            transitionOut: { type: 'flash-white', duration: 0.5 },
            keyframes: [
              { time: 0, property: 'scale', value: 1.0 },
              { time: 7.5, property: 'scale', value: 1.12 }
            ]
          },
          {
            id: 'clip-v2',
            trackId: 'track-video',
            name: 'Cyberpunk Metropolis Night',
            type: 'video',
            mediaId: 'media-cyberpunk',
            mediaUrl: 'user_uploaded_files/ttl=63d/tool_generated/watermarked_img_10555962940228783301.jpg',
            startTime: 7.5,
            duration: 8.5,
            sourceStartTime: 0.0,
            sourceDuration: 8.5,
            x: 0,
            y: 0,
            scale: 1.0,
            rotation: 0,
            opacity: 1.0,
            speed: 1.0,
            colorGrading: {
              brightness: 1.0,
              contrast: 1.25,
              saturation: 1.35,
              temperature: -0.15
            },
            effects: [
              { type: 'letterbox', intensity: 100 },
              { type: 'rgb-split', intensity: 30 }
            ],
            transitionIn: { type: 'flash-white', duration: 0.5 },
            keyframes: []
          }
        ]
      },
      {
        id: 'track-audio-sfx',
        name: 'SFX & Dialogue',
        type: 'audio',
        isVisible: true,
        isLocked: false,
        isMuted: false,
        clips: [
          {
            id: 'sfx-c1',
            trackId: 'track-audio-sfx',
            name: 'Cinematic High Whoosh',
            type: 'audio',
            sfxType: 'whoosh',
            startTime: 0.4,
            duration: 1.2,
            volume: 0.85,
            pan: 0
          },
          {
            id: 'sfx-c2',
            trackId: 'track-audio-sfx',
            name: 'Bass Impact Hit',
            type: 'audio',
            sfxType: 'hit',
            startTime: 7.4,
            duration: 1.8,
            volume: 0.95,
            pan: 0
          }
        ]
      },
      {
        id: 'track-audio-bgm',
        name: 'Music (Soundtrack)',
        type: 'audio',
        isVisible: true,
        isLocked: false,
        isMuted: false,
        clips: [
          {
            id: 'bgm-c1',
            trackId: 'track-audio-bgm',
            name: 'Epic Horizons Orchestra',
            type: 'audio',
            musicGenre: 'cinematic',
            startTime: 0.0,
            duration: 16.0,
            volume: 0.7,
            fadeIn: 1.5,
            fadeOut: 2.0,
            pan: 0,
            equalizer: 'bass-boost'
          }
        ]
      }
    ]
  };
}
"""
