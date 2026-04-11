import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMapPin, FiFileText, FiSearch, FiEdit, FiCamera, FiCopy, FiTrash2 } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import type { EvidenceCard, EvidenceType } from '../types';

const isValidHex = (color: string | undefined): color is string =>
  typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color);

const hexLuminance = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const lightenHex = (hex: string, amount: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`;
};

const typeIcons: Record<EvidenceType, React.ComponentType<{ className?: string }>> = {
  person: FiUser,
  location: FiMapPin,
  document: FiFileText,
  item: FiSearch,
  note: FiEdit,
  photo: FiCamera,
};

function EvidenceCardNode({ data, selected }: NodeProps<EvidenceCard & { isRemoving?: boolean }>) {
  const { selectCard, deleteCard, duplicateCard } = useStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const validColor = isValidHex(data.color) ? data.color : null;
  const darkCard = validColor ? hexLuminance(validColor) < 0.35 : false;
  const isNote = data.type === 'note';
  const isRemoving = data.isRemoving || false;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    deleteCard(data.id);
    handleCloseContextMenu();
  };

  const handleDuplicate = () => {
    duplicateCard(data.id);
    handleCloseContextMenu();
  };

  const contextMenuPortal =
    contextMenu && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            <>
              <div
                className="fixed inset-0 z-[200]"
                onClick={handleCloseContextMenu}
                onContextMenu={(e) => e.preventDefault()}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed z-[201] bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded shadow-xl min-w-[140px]"
                style={{ left: contextMenu.x, top: contextMenu.y }}
              >
                <button
                  onClick={handleDuplicate}
                  className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <FiCopy className="text-sm" />
                  <span>Дублировать</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-2 transition-colors"
                >
                  <FiTrash2 className="text-sm" />
                  <span>Удалить</span>
                </button>
              </motion.div>
            </>
          </AnimatePresence>,
          document.body
        )
      : null;

  const pinStyle = {
    background: 'radial-gradient(circle at 30% 30%, #f1f5f9 0%, #94a3b8 50%, #475569 100%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.2)',
  };

  if (isNote) {
    return (
      <>
        <motion.div
          initial={{ scale: 0, rotate: -10, opacity: 0 }}
          animate={isRemoving ? { scale: 0, rotate: -10, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
          transition={isRemoving ? { duration: 0.3 } : { type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => !isRemoving && selectCard(data.id)}
          onContextMenu={!isRemoving ? handleContextMenu : undefined}
          className={`relative cursor-pointer group ${selected ? 'z-50' : 'z-10'}`}
        >
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-20"
          style={pinStyle}
        >
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-white/40"
          />

          <Handle
            type="source"
            position={Position.Top}
            id="pin"
            className="!w-4 !h-4 !bg-transparent !border-0 !rounded-full !-top-0 !left-1/2 !-translate-x-1/2 opacity-0 group-hover:opacity-100"
            style={{ cursor: 'crosshair' }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="pin"
            className="!w-4 !h-4 !bg-transparent !border-0 !rounded-full !-top-0 !left-1/2 !-translate-x-1/2 opacity-0 group-hover:opacity-100"
            style={{ cursor: 'crosshair' }}
          />
        </div>

        <div
          className={`relative p-4 transition-all duration-200 ${
            selected
              ? 'shadow-[0_0_20px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.5)]'
              : 'shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.4)]'
          }`}
          style={{
            width: 160,
            minHeight: 160,
            background: data.color
              ? data.color
              : 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
            transform: `rotate(${(data.id.charCodeAt(0) % 5) - 2}deg)`,
            borderRadius: '2px',
          }}
        >
          <div className="relative z-10 h-full flex flex-col justify-center">
            {data.description ? (
              <p
                className="text-center leading-snug break-words"
                style={{
                  color: darkCard ? '#ffffff' : '#1f2937',
                  fontFamily: '"Caveat", "Comic Sans MS", cursive',
                  fontSize: '20px',
                  fontWeight: 600,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                }}
              >
                {data.description}
              </p>
            ) : (
              (() => {
                const IconComponent = typeIcons[data.type];
                return <IconComponent className={`text-3xl opacity-40 mx-auto ${darkCard ? 'text-white' : 'text-gray-700'}`} />;
              })()
            )}
          </div>

          {selected && (
            <motion.div
              layoutId="selection-ring"
              className="absolute inset-0 border border-gray-400 pointer-events-none"
              style={{ borderRadius: '2px' }}
              initial={false}
              animate={{ opacity: 1 }}
            />
          )}
        </div>
        </motion.div>
        {contextMenuPortal}
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0, rotate: -10, opacity: 0 }}
        animate={isRemoving ? { scale: 0, rotate: -10, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
        transition={isRemoving ? { duration: 0.3 } : { type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => !isRemoving && selectCard(data.id)}
        onContextMenu={!isRemoving ? handleContextMenu : undefined}
        className={`relative cursor-pointer group ${selected ? 'z-50' : 'z-10'}`}
      >
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-20"
        style={pinStyle}
      >
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-white/40"
        />

        <Handle
          type="source"
          position={Position.Top}
          id="pin"
          className="!w-4 !h-4 !bg-transparent !border-0 !rounded-full !-top-0 !left-1/2 !-translate-x-1/2 opacity-0 group-hover:opacity-100"
          style={{ cursor: 'crosshair' }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="pin"
          className="!w-4 !h-4 !bg-transparent !border-0 !rounded-full !-top-0 !left-1/2 !-translate-x-1/2 opacity-0 group-hover:opacity-100"
          style={{ cursor: 'crosshair' }}
        />
      </div>

      <div
        className={`relative p-1.5 transition-all duration-200 ${
          selected
            ? 'shadow-[0_0_20px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.5)]'
            : 'shadow-md hover:shadow-lg'
        }`}
        style={{
          width: 160,
          transform: `rotate(${(data.id.charCodeAt(0) % 5) - 2}deg)`,
          borderRadius: '2px',
          background: data.color || '#f5f5f5',
        }}
      >
        <div
          className="w-full h-28 flex items-center justify-center relative overflow-hidden bg-gray-200"
          style={{
            background: data.imageUrl
              ? `url(${data.imageUrl}) center/cover`
              : validColor
              ? lightenHex(validColor, 0.45)
              : '#e5e7eb',
          }}
        >
          {!data.imageUrl && (() => {
            const IconComponent = typeIcons[data.type];
            return <IconComponent className={`text-4xl opacity-30 ${darkCard ? 'text-white' : 'text-gray-600'}`} />;
          })()}
        </div>

        <div className="pt-3 pb-1 px-1">
          <p
            className="text-center leading-tight truncate"
            style={{
              color: darkCard ? '#ffffff' : '#1f2937',
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '-0.5px',
            }}
          >
            {data.title}
          </p>
          {data.description && (
            <p className="text-[9px] text-center mt-1 truncate font-mono uppercase tracking-wide" style={{ color: darkCard ? 'rgba(255,255,255,0.6)' : '#6b7280' }}>
              {data.description}
            </p>
          )}
        </div>

        {selected && (
          <motion.div
            layoutId="selection-ring"
            className="absolute inset-0 border border-gray-500 pointer-events-none"
            style={{ borderRadius: '2px' }}
            initial={false}
            animate={{ opacity: 1 }}
          />
        )}
      </div>
      </motion.div>
      {contextMenuPortal}
    </>
  );
}

export default memo(EvidenceCardNode);
