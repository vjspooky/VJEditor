# src_builder/styles.py

CSS_CONTENT = """
/* VJEditor Dark Studio Custom Styles */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Montserrat:wght@700;800;900&family=Bebas+Neue&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');

:root {
  --color-bg-base: #0b0c10;
  --color-bg-surface: #12141a;
  --color-bg-elevated: #181b24;
  --color-bg-hover: #222634;
  --color-border: #222634;
  --color-border-subtle: #1c1f2b;
  --color-accent-cyan: #06b6d4;
  --color-accent-indigo: #6366f1;
  --color-accent-rose: #f43f5e;
  --color-accent-amber: #f59e0b;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--color-bg-base);
  color: #e2e8f0;
  user-select: none;
  overflow: hidden;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0f1117;
}
::-webkit-scrollbar-thumb {
  background: #232838;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #333a52;
}

/* Custom Range Sliders */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: #1e2230;
  height: 4px;
  border-radius: 2px;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #06b6d4;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
  transition: transform 0.1s ease;
}
input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Custom Number & Text Inputs */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Timeline grid & ruler */
.timeline-grid {
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
}

/* Keyframe diamond */
.keyframe-diamond {
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
  background: #06b6d4;
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.8);
  cursor: pointer;
}
.keyframe-diamond.active {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.9);
}

/* Audio Level Meter */
.meter-led {
  height: 4px;
  border-radius: 1px;
  background: #1a1e2b;
}
.meter-led.active-green { background: #10b981; box-shadow: 0 0 4px #10b981; }
.meter-led.active-yellow { background: #f59e0b; box-shadow: 0 0 4px #f59e0b; }
.meter-led.active-red { background: #ef4444; box-shadow: 0 0 4px #ef4444; }

/* Safe zone indicators */
.safe-zone-action {
  border: 1px dashed rgba(6, 182, 212, 0.4);
}
.safe-zone-title {
  border: 1px dashed rgba(244, 63, 94, 0.4);
}

/* Timecode font */
.font-mono-time {
  font-family: 'JetBrains Mono', monospace;
  font-feature-settings: 'tnum';
}

/* Animations */
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.animate-recording {
  animation: pulse-subtle 1.2s infinite;
}

/* Backdrop blur support */
.glass-panel {
  background: rgba(18, 20, 26, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
"""
