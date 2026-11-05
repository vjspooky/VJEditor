# src_builder/canvas_compositor.py

CANVAS_COMPOSITOR_CONTENT = """
// Canvas Compositor & Image Cache System
const imageCache = new Map();

function preloadImage(url) {
  if (!url || imageCache.has(url)) return imageCache.get(url);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  imageCache.set(url, img);
  return img;
}

// Pre-seed image cache
DEFAULT_MEDIA.forEach(m => preloadImage(m.url));

// Color distance helper for Chroma Keying
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// Keyframe Interpolation
function interpolateKeyframes(clip, currentTime, property, defaultValue) {
  if (!clip.keyframes || clip.keyframes.length === 0) return defaultValue;
  const propKfs = clip.keyframes
    .filter(k => k.property === property)
    .sort((a, b) => a.time - b.time);

  if (propKfs.length === 0) return defaultValue;
  const localTime = currentTime - clip.startTime;

  if (localTime <= propKfs[0].time) return propKfs[0].value;
  if (localTime >= propKfs[propKfs.length - 1].time) return propKfs[propKfs.length - 1].value;

  for (let i = 0; i < propKfs.length - 1; i++) {
    const k1 = propKfs[i];
    const k2 = propKfs[i + 1];
    if (localTime >= k1.time && localTime <= k2.time) {
      const t = (localTime - k1.time) / (k2.time - k1.time);
      // Linear or Ease
      const easedT = k1.easing === 'ease-out' 
        ? Math.sin((t * Math.PI) / 2) 
        : k1.easing === 'ease-in'
        ? 1 - Math.cos((t * Math.PI) / 2)
        : t;
      return k1.value + (k2.value - k1.value) * easedT;
    }
  }
  return defaultValue;
}

// Main Frame Renderer
function renderVideoFrame({
  canvas,
  project,
  currentTime,
  selectedClipId,
  showSafeZones = false,
  aspectRatio = '16:9'
}) {
  if (!canvas || !project) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // 1. Clear background
  ctx.fillStyle = '#090a0f';
  ctx.fillRect(0, 0, width, height);

  // 2. Sort tracks from bottom to top: Video 1 -> Video 2 -> Stickers -> Text -> Captions
  const trackOrder = ['video', 'audio', 'sticker', 'text', 'caption'];
  const sortedTracks = [...project.tracks].sort((a, b) => {
    return trackOrder.indexOf(a.type) - trackOrder.indexOf(b.type);
  });

  // Track active video layers for offscreen Chroma keying
  let offCanvas = null;
  let offCtx = null;

  sortedTracks.forEach(track => {
    if (!track.isVisible) return;

    track.clips.forEach(clip => {
      // Check if clip is active at currentTime
      if (currentTime < clip.startTime || currentTime >= clip.startTime + clip.duration) {
        return;
      }

      const localTime = currentTime - clip.startTime;
      ctx.save();

      // Position, Scale, Rotation, Opacity
      const posX = interpolateKeyframes(clip, currentTime, 'x', clip.x || 0);
      const posY = interpolateKeyframes(clip, currentTime, 'y', clip.y || 0);
      const scale = interpolateKeyframes(clip, currentTime, 'scale', clip.scale || 1.0);
      const rot = interpolateKeyframes(clip, currentTime, 'rotation', clip.rotation || 0);
      const opacity = interpolateKeyframes(clip, currentTime, 'opacity', clip.opacity !== undefined ? clip.opacity : 1.0);

      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

      // Video / Image Clips
      if (clip.type === 'video' || clip.type === 'image') {
        const img = preloadImage(clip.mediaUrl);
        if (img && img.complete && img.naturalWidth > 0) {
          const cx = width / 2 + posX;
          const cy = height / 2 + posY;
          const drawW = width * scale;
          const drawH = height * scale;

          ctx.translate(cx, cy);
          ctx.rotate((rot * Math.PI) / 180);
          if (clip.flipH || clip.flipV) {
            ctx.scale(clip.flipH ? -1 : 1, clip.flipV ? -1 : 1);
          }

          // Chroma Key Green Screen processing
          if (clip.chromaKey && clip.chromaKey.enabled) {
            if (!offCanvas) {
              offCanvas = document.createElement('canvas');
              offCanvas.width = 640;
              offCanvas.height = 360;
              offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
            }
            offCtx.clearRect(0, 0, 640, 360);
            offCtx.drawImage(img, 0, 0, 640, 360);
            const imgData = offCtx.getImageData(0, 0, 640, 360);
            const data = imgData.data;
            const target = hexToRgb(clip.chromaKey.keyColor || '#2b9849');
            const sim = (clip.chromaKey.similarity || 0.35) * 255;
            const smooth = (clip.chromaKey.smoothness || 0.15) * 255;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // Color Euclidean distance
              const dist = Math.sqrt(
                Math.pow(r - target.r, 2) +
                Math.pow(g - target.g, 2) * 1.5 +
                Math.pow(b - target.b, 2)
              );

              if (dist < sim) {
                data[i + 3] = 0; // Transparent
              } else if (dist < sim + smooth) {
                data[i + 3] = Math.round(((dist - sim) / smooth) * 255);
              }
              // Green spill suppression
              if (g > (r + b) / 2) {
                data[i + 1] = Math.round((r + b) / 2);
              }
            }
            offCtx.putImageData(imgData, 0, 0);

            // Color grading filters
            const cg = clip.colorGrading || {};
            const filterStr = `brightness(${cg.brightness || 1}) contrast(${cg.contrast || 1}) saturate(${cg.saturation || 1})`;
            ctx.filter = filterStr;
            ctx.drawImage(offCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.filter = 'none';
          } else {
            // Standard render with color grading
            const cg = clip.colorGrading || {};
            const filterParts = [];
            if (cg.brightness) filterParts.push(`brightness(${cg.brightness})`);
            if (cg.contrast) filterParts.push(`contrast(${cg.contrast})`);
            if (cg.saturation) filterParts.push(`saturate(${cg.saturation})`);
            if (cg.temperature && cg.temperature !== 0) {
              filterParts.push(`hue-rotate(${cg.temperature * 40}deg)`);
            }
            ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.filter = 'none';
          }

          // Special effects stack
          if (clip.effects && clip.effects.length > 0) {
            clip.effects.forEach(eff => {
              if (eff.type === 'vignette') {
                const grad = ctx.createRadialGradient(0, 0, drawW * 0.25, 0, 0, drawW * 0.7);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, `rgba(0,0,0,${(eff.intensity || 50) / 100})`);
                ctx.fillStyle = grad;
                ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
              } else if (eff.type === 'letterbox') {
                const barHeight = height * 0.12;
                ctx.fillStyle = '#000000';
                ctx.fillRect(-drawW / 2, -drawH / 2, drawW, barHeight);
                ctx.fillRect(-drawW / 2, drawH / 2 - barHeight, drawW, barHeight);
              } else if (eff.type === 'rgb-split') {
                // Subtle RGB edge glow
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
                ctx.lineWidth = 3;
                ctx.strokeRect(-drawW / 2 + 3, -drawH / 2, drawW, drawH);
              }
            });
          }
        }
      }

      // Text Clips
      else if (clip.type === 'text') {
        const cx = width / 2 + posX;
        const cy = height / 2 + posY;
        ctx.translate(cx, cy);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.scale(scale, scale);

        let displayText = clip.content || 'Text Title';
        if (clip.animation === 'typewriter') {
          const progress = Math.min(1, localTime / 1.5);
          const chars = Math.floor(displayText.length * progress);
          displayText = displayText.substring(0, chars);
        }

        ctx.font = `${clip.fontWeight || '700'} ${clip.fontSize || 42}px '${clip.font || 'Inter'}', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Background box
        if (clip.bg) {
          const metrics = ctx.measureText(displayText);
          const textW = metrics.width + 36;
          const textH = (clip.fontSize || 42) * 1.5;
          ctx.fillStyle = clip.bg;
          ctx.fillRect(-textW / 2, -textH / 2, textW, textH);
        }

        // Drop shadow
        if (clip.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
        }

        // Stroke
        if (clip.stroke && clip.strokeWidth) {
          ctx.strokeStyle = clip.stroke;
          ctx.lineWidth = clip.strokeWidth;
          ctx.strokeText(displayText, 0, 0);
        }

        ctx.fillStyle = clip.color || '#ffffff';
        ctx.fillText(displayText, 0, 0);
        ctx.shadowColor = 'transparent';
      }

      // Captions & Subtitles
      else if (clip.type === 'caption') {
        const cx = width / 2;
        const cy = height - 120; // Lower subtitle position
        ctx.translate(cx, cy);

        const text = clip.content || '';
        const fontSize = clip.fontSize || 32;
        ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Karaoke or Bold Social styling
        if (clip.style === 'karaoke' || clip.style === 'bold') {
          const metrics = ctx.measureText(text);
          const boxW = metrics.width + 48;
          const boxH = fontSize * 1.6;

          // Translucent dark rounded pill
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.beginPath();
          ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 12);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Render words with highlight
          if (clip.highlightWord && text.includes(clip.highlightWord)) {
            const parts = text.split(clip.highlightWord);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, 0, 0);

            // Overlay highlight word in energetic cyan/yellow
            ctx.fillStyle = '#facc15';
            ctx.fillText(clip.highlightWord, 0, 0);
          } else {
            ctx.fillStyle = clip.color || '#ffffff';
            ctx.fillText(text, 0, 0);
          }
        } else {
          // Minimal Subtitle
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, 0, 0);
          ctx.shadowColor = 'transparent';
        }
      }

      // Selection Bounding Box on Canvas
      if (clip.id === selectedClipId) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        const boxW = (width * scale) * 0.45;
        const boxH = (height * scale) * 0.45;
        ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
        ctx.setLineDash([]);

        // Handle points
        ctx.fillStyle = '#ffffff';
        [
          [-boxW / 2, -boxH / 2], [boxW / 2, -boxH / 2],
          [-boxW / 2, boxH / 2], [boxW / 2, boxH / 2]
        ].forEach(([hx, hy]) => {
          ctx.fillRect(hx - 4, hy - 4, 8, 8);
        });
      }

      ctx.restore();
    });
  });

  // 3. Watermark from Brand Kit
  if (project.brandKit && project.brandKit.watermarkEnabled) {
    ctx.save();
    ctx.globalAlpha = project.brandKit.watermarkOpacity || 0.7;
    ctx.font = '700 18px Montserrat, sans-serif';
    ctx.fillStyle = project.brandKit.primaryColor || '#06b6d4';
    const logoText = project.brandKit.logoName || 'VJEDITOR';

    if (project.brandKit.watermarkPosition === 'top-right') {
      ctx.textAlign = 'right';
      ctx.fillText(logoText, width - 36, 44);
    } else if (project.brandKit.watermarkPosition === 'bottom-right') {
      ctx.textAlign = 'right';
      ctx.fillText(logoText, width - 36, height - 36);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(logoText, 36, 44);
    }
    ctx.restore();
  }

  // 4. Safe Zones Overlay
  if (showSafeZones) {
    ctx.save();
    // Action Safe (90%)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);

    // Title Safe (80%)
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
    ctx.setLineDash([]);

    // TikTok/Shorts UI bounds when in 9:16
    if (aspectRatio === '9:16') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
      // Bottom caption & sound zone
      ctx.fillRect(0, height - 260, width, 260);
      // Right side likes & share icon zone
      ctx.fillRect(width - 90, height / 2 - 120, 90, 280);
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'center';
      ctx.fillText('TikTok / Reels UI Safe Margin', width / 2, height - 30);
    }
    ctx.restore();
  }
}
"""
