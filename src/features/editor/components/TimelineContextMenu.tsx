import type { TimelineItem } from '@/types';
import {
  Copy,
  FileCode,
  Lock,
  LockOpen,
  Plus,
  Scissors,
  SlidersHorizontal,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface ContextMenuPosition {
  x: number;
  y: number;
  clip?: TimelineItem;
}

interface TimelineContextMenuProps {
  position: ContextMenuPosition | null;
  hasClipboard: boolean;
  canSplit: boolean;
  onClose: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSplit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRippleDelete: () => void;
  onReplaceMedia: () => void;
  onToggleMute: () => void;
  onToggleLock: () => void;
  onOpenProperties: () => void;
}

export function TimelineContextMenu({
  position,
  hasClipboard,
  canSplit,
  onClose,
  onCut,
  onCopy,
  onPaste,
  onSplit,
  onDuplicate,
  onDelete,
  onRippleDelete,
  onReplaceMedia,
  onToggleMute,
  onToggleLock,
  onOpenProperties,
}: TimelineContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!position) return null;

  const { clip, x, y } = position;

  // Clamp position to avoid overflowing viewport
  const left = Math.min(x, window.innerWidth - 220);
  const top = Math.min(y, window.innerHeight - 340);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Timeline Context Menu"
      style={{ left, top }}
      className="fixed z-50 w-52 rounded-xl border border-border bg-app-elevated py-1.5 shadow-2xl text-xs text-fg animate-in fade-in zoom-in-95 duration-100"
    >
      {clip ? (
        <>
          <div className="px-3 py-1 text-[10px] text-muted font-medium truncate border-b border-border mb-1">
            {clip.name}
          </div>

          <MenuItem
            icon={<Scissors size={13} />}
            label="Cut"
            shortcut="Ctrl+X"
            disabled={Boolean(clip.locked)}
            onClick={() => {
              onCut();
              onClose();
            }}
          />
          <MenuItem
            icon={<Copy size={13} />}
            label="Copy"
            shortcut="Ctrl+C"
            onClick={() => {
              onCopy();
              onClose();
            }}
          />
          <MenuItem
            icon={<Copy size={13} />}
            label="Paste"
            shortcut="Ctrl+V"
            disabled={!hasClipboard}
            onClick={() => {
              onPaste();
              onClose();
            }}
          />
          <MenuItem
            icon={<Scissors size={13} />}
            label="Split at Playhead"
            shortcut="S"
            disabled={!canSplit || Boolean(clip.locked)}
            onClick={() => {
              onSplit();
              onClose();
            }}
          />
          <MenuItem
            icon={<Plus size={13} />}
            label="Duplicate"
            shortcut="Ctrl+D"
            disabled={Boolean(clip.locked)}
            onClick={() => {
              onDuplicate();
              onClose();
            }}
          />

          <div className="my-1 border-t border-border" />

          {clip.kind === 'video' || clip.kind === 'audio' ? (
            <MenuItem
              icon={<FileCode size={13} />}
              label="Replace Media"
              disabled={Boolean(clip.locked)}
              onClick={() => {
                onReplaceMedia();
                onClose();
              }}
            />
          ) : null}

          <MenuItem
            icon={clip.muted ? <Volume2 size={13} /> : <VolumeX size={13} />}
            label={clip.muted ? 'Unmute Clip' : 'Mute Clip'}
            onClick={() => {
              onToggleMute();
              onClose();
            }}
          />

          <MenuItem
            icon={clip.locked ? <LockOpen size={13} /> : <Lock size={13} />}
            label={clip.locked ? 'Unlock Clip' : 'Lock Clip'}
            onClick={() => {
              onToggleLock();
              onClose();
            }}
          />

          <div className="my-1 border-t border-border" />

          <MenuItem
            icon={<Trash2 size={13} />}
            label="Delete"
            shortcut="Del"
            disabled={Boolean(clip.locked)}
            danger
            onClick={() => {
              onDelete();
              onClose();
            }}
          />
          <MenuItem
            icon={<Trash2 size={13} />}
            label="Ripple Delete"
            shortcut="Shift+Del"
            disabled={Boolean(clip.locked)}
            danger
            onClick={() => {
              onRippleDelete();
              onClose();
            }}
          />

          <div className="my-1 border-t border-border" />

          <MenuItem
            icon={<SlidersHorizontal size={13} />}
            label="Properties"
            onClick={() => {
              onOpenProperties();
              onClose();
            }}
          />
        </>
      ) : (
        <>
          <MenuItem
            icon={<Copy size={13} />}
            label="Paste at Playhead"
            shortcut="Ctrl+V"
            disabled={!hasClipboard}
            onClick={() => {
              onPaste();
              onClose();
            }}
          />
          <MenuItem
            icon={<Scissors size={13} />}
            label="Split All at Playhead"
            shortcut="S"
            onClick={() => {
              onSplit();
              onClose();
            }}
          />
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  shortcut,
  disabled,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`w-full px-3 py-1.5 flex items-center justify-between transition text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? 'text-danger hover:bg-danger/15'
          : 'text-fg hover:bg-panel-hover'
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
      {shortcut ? <span className="text-[10px] text-muted ml-2">{shortcut}</span> : null}
    </button>
  );
}
