import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMapPin, FiFileText, FiSearch, FiEdit, FiCamera } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import type { EvidenceType } from '../types';

const evidenceTypes: { type: EvidenceType; Icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { type: 'person', Icon: FiUser, label: 'Личность' },
  { type: 'location', Icon: FiMapPin, label: 'Локация' },
  { type: 'document', Icon: FiFileText, label: 'Документ' },
  { type: 'item', Icon: FiSearch, label: 'Предмет' },
  { type: 'note', Icon: FiEdit, label: 'Заметка' },
  { type: 'photo', Icon: FiCamera, label: 'Фото' },
];

export default function ContextMenu() {
  const { contextMenu, closeContextMenu, addCard } = useStore();

  const handleAddCard = (type: EvidenceType) => {
    if (contextMenu.flowPosition) {
      addCard(type, contextMenu.flowPosition);
    }
    closeContextMenu();
  };

  return (
    <AnimatePresence>
      {contextMenu.isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={closeContextMenu}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[101] bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-2xl"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              minWidth: 200,
            }}
          >
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Добавить</p>
            </div>

            <div className="py-1">
              {evidenceTypes.map(({ type, Icon, label }) => (
                <motion.button
                  key={type}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={() => handleAddCard(type)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white flex items-center gap-3 transition-colors"
                >
                  <Icon className="text-lg w-6 text-center" />
                  <span className="font-mono text-xs">{label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
