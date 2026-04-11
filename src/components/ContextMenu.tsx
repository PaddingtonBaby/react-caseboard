import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMapPin, FiFileText, FiSearch, FiEdit, FiCamera } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import { useReactFlow } from 'reactflow';
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
  const { contextMenu, closeContextMenu, addCard, openContextMenu } = useStore();
  const { getViewport } = useReactFlow();

  const handleAddCard = (type: EvidenceType) => {
    if (contextMenu.flowPosition) {
      addCard(type, contextMenu.flowPosition);
    }
    closeContextMenu();
  };

  const handleOverlayContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const reactFlowEl = document.querySelector('.react-flow');
    const bounds = reactFlowEl?.getBoundingClientRect();
    if (bounds) {
      const viewport = getViewport();
      const flowX = (e.clientX - bounds.left - viewport.x) / viewport.zoom;
      const flowY = (e.clientY - bounds.top - viewport.y) / viewport.zoom;
      openContextMenu(e.clientX, e.clientY, { x: flowX, y: flowY });
    } else {
      openContextMenu(e.clientX, e.clientY);
    }
  };

  return (
    <AnimatePresence>
      {contextMenu.isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={closeContextMenu}
            onContextMenu={handleOverlayContextMenu}
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
