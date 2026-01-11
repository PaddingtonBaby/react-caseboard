import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function LeftCaseList() {
  const { cases, activeCaseId, setActiveCase } = useStore();

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      className="w-64 bg-black/40 backdrop-blur-sm border-r border-white/5 flex flex-col"
    >

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {cases.map((caseItem, index) => (
          <motion.button
            key={caseItem.id}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            onClick={() => setActiveCase(caseItem.id)}
            className={`w-full p-3 rounded text-left transition-all duration-300 ${
              activeCaseId === caseItem.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${activeCaseId === caseItem.id ? 'bg-white' : 'bg-gray-600'}`} />
              <span className="text-xs font-mono tracking-wide">{caseItem.id}</span>
            </div>
            <p className="text-[10px] opacity-60 line-clamp-1 pl-4">{caseItem.description}</p>
            <div className="flex items-center gap-3 mt-2 pl-4 text-[9px] opacity-40 font-mono">
              <span>Улик: {caseItem.cards.length}</span>
              <span>Связей: {caseItem.links.length}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="text-[9px] text-gray-600 text-center uppercase tracking-widest">
          {cases.length} {cases.length === 1 ? 'Активный кейс' : 'Активных кейсов'}
        </div>
      </div>
    </motion.aside>
  );
}
