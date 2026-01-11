import { motion } from 'framer-motion';
import { FiUser, FiMapPin, FiFileText, FiSearch, FiEdit, FiCamera } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import type { EvidenceType } from '../types';
import { useState } from 'react';

const evidenceTypes: { type: EvidenceType; Icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { type: 'person', Icon: FiUser, label: 'Личность' },
  { type: 'location', Icon: FiMapPin, label: 'Локация' },
  { type: 'document', Icon: FiFileText, label: 'Документ' },
  { type: 'item', Icon: FiSearch, label: 'Предмет' },
  { type: 'note', Icon: FiEdit, label: 'Заметка' },
  { type: 'photo', Icon: FiCamera, label: 'Фото' },
];

export default function TopToolbar() {
  const { addCard, setImportExportOpen, zoom, setZoom } = useStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleAddCard = (type: EvidenceType) => {
    addCard(type, { x: 400 + Math.random() * 200, y: 300 + Math.random() * 200 });
    setShowAddMenu(false);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.3));

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="h-14 bg-black/40 backdrop-blur-sm border-b border-white/5 px-6 flex items-center justify-between z-50"
    >
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xs font-bold text-gray-200 tracking-[0.2em]">ДОСКА</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-xs text-gray-300 flex items-center gap-2 transition-colors uppercase tracking-wider"
          >
            <span>+ Добавить</span>
          </motion.button>

          {showAddMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 mt-2 bg-[#1a1a2e] border border-white/10 rounded shadow-xl min-w-[160px] z-50 py-1"
            >
              {evidenceTypes.map(({ type, Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAddCard(type)}
                  className="w-full px-4 py-2 text-left text-xs text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors uppercase tracking-wide"
                >
                  <Icon className="text-sm opacity-70" />
                  <span>{label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            −
          </button>
          <span className="text-[10px] text-gray-500 font-mono w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            +
          </button>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <button
          onClick={() => setImportExportOpen(true)}
          className="text-gray-500 hover:text-white text-xs uppercase tracking-wider transition-colors"
        >
          Меню
        </button>
      </div>
    </motion.header>
  );
}
