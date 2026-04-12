import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState, useRef } from 'react';
import { FiClock, FiUser, FiEdit, FiLink, FiLink2, FiCheckSquare, FiSquare, FiTrash2, FiCopy, FiBriefcase, FiArrowLeft, FiX } from 'react-icons/fi';
import type { HistoryAction } from '../types';
import { PRESET_CARD_COLORS } from '../utils/colors';

const ACTION_META: Record<HistoryAction, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  case_created:    { icon: FiBriefcase,  color: 'text-indigo-400' },
  card_added:      { icon: FiUser,       color: 'text-blue-400'   },
  card_deleted:    { icon: FiTrash2,     color: 'text-red-400'    },
  card_updated:    { icon: FiEdit,       color: 'text-gray-400'   },
  card_duplicated: { icon: FiCopy,       color: 'text-purple-400' },
  link_added:      { icon: FiLink,       color: 'text-emerald-400'},
  link_deleted:    { icon: FiLink2,      color: 'text-orange-400' },
  task_added:      { icon: FiSquare,     color: 'text-cyan-400'   },
  task_completed:  { icon: FiCheckSquare,color: 'text-green-400'  },
  task_deleted:    { icon: FiTrash2,     color: 'text-red-400'    },
};

const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн назад`;
  return new Date(timestamp).toLocaleDateString('ru-RU');
};

export default function RightSummaryPanel() {
  const { cases, activeCaseId, selectedCardId, addTask, toggleTask, deleteTask, updateCard, deleteCard } = useStore();
  const [newTask, setNewTask] = useState('');
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const activeCase = cases.find((c) => c.id === activeCaseId);
  const selectedCard = activeCase?.cards.find((c) => c.id === selectedCardId);

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      className="w-80 bg-black/40 backdrop-blur-sm border-l border-white/5 flex flex-col"
    >
      {selectedCard ? (
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => useStore.getState().selectCard(null)}
                className="text-gray-600 hover:text-gray-300 transition-colors"
                title="Назад к сводке"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                {selectedCard.type}
              </span>
            </div>
            <button
              onClick={() => deleteCard(selectedCard.id)}
              className="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider"
            >
              Удалить
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div>
              <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-2">Название</label>
              <input
                type="text"
                value={selectedCard.title}
                onChange={(e) => updateCard(selectedCard.id, { title: e.target.value })}
                className="w-full bg-transparent border-b border-gray-800 focus:border-gray-400 rounded-none px-0 py-2 text-sm text-white focus:outline-none transition-colors placeholder-gray-800"
                placeholder="Без названия"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-2.5">Цвет</label>
              <div className="flex items-center gap-1.5">
                {PRESET_CARD_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCard(selectedCard.id, { color: selectedCard.color === color ? undefined : color })}
                    className="w-5 h-5 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                    style={{
                      background: color,
                      boxShadow: selectedCard.color === color ? '0 0 0 2px rgba(255,255,255,0.5)' : 'inset 0 1px 2px rgba(0,0,0,0.15)',
                    }}
                  />
                ))}
                <div className="relative flex items-center">
                  <button
                    onClick={() => colorInputRef.current?.click()}
                    className="w-5 h-5 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                    style={{
                      background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                      boxShadow:
                        selectedCard.color && !(PRESET_CARD_COLORS as readonly string[]).includes(selectedCard.color)
                          ? '0 0 0 2px rgba(255,255,255,0.5)'
                          : 'inset 0 1px 2px rgba(0,0,0,0.2)',
                    }}
                    title="Свой цвет"
                  />
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={selectedCard.color && selectedCard.color.startsWith('#') && selectedCard.color.length === 7 ? selectedCard.color : '#fef3c7'}
                    onChange={(e) => updateCard(selectedCard.id, { color: e.target.value })}
                    className="sr-only"
                  />
                </div>
                {selectedCard.color && (
                  <button
                    onClick={() => updateCard(selectedCard.id, { color: undefined })}
                    className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-700 flex items-center justify-center text-gray-600 hover:text-gray-300 hover:border-gray-500 transition-colors"
                    title="Сбросить"
                  >
                    <FiX className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-2">Заметки</label>
              <textarea
                value={selectedCard.description}
                onChange={(e) => updateCard(selectedCard.id, { description: e.target.value })}
                rows={6}
                className="w-full bg-white/5 border border-transparent rounded px-3 py-3 text-xs text-gray-300 focus:bg-white/10 focus:outline-none transition-colors resize-none leading-relaxed"
                placeholder="Добавьте детали..."
              />
            </div>

            {selectedCard.type !== 'note' && (
              <>
                <div>
                  <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-2">Изображение</label>
                  <input
                    type="text"
                    value={selectedCard.imageUrl || ''}
                    onChange={(e) => updateCard(selectedCard.id, { imageUrl: e.target.value })}
                    className="w-full bg-transparent border-b border-gray-800 focus:border-gray-400 rounded-none px-0 py-2 text-xs text-gray-400 focus:outline-none transition-colors font-mono"
                    placeholder="URL..."
                  />
                </div>

                {selectedCard.imageUrl && (
                  <div className="rounded overflow-hidden bg-black/20">
                    <img
                      src={selectedCard.imageUrl}
                      alt={selectedCard.title}
                      className="w-full h-40 object-cover opacity-80 hover:opacity-100 transition-opacity"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Сводка</h2>
              <button
                onClick={() => setShowTimeline((v) => !v)}
                title="История изменений"
                className={`transition-colors ${showTimeline ? 'text-white' : 'text-gray-600 hover:text-gray-300'}`}
              >
                <FiClock className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-600 font-mono">{activeCase?.id || '---'}</p>
          </div>

          <AnimatePresence mode="wait">
            {showTimeline ? (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-5"
              >
                {activeCase && (activeCase.history ?? []).length > 0 ? (
                  <ol className="relative">
                    {[...(activeCase.history ?? [])].reverse().map((entry, idx, arr) => {
                      const meta = ACTION_META[entry.action] ?? ACTION_META.card_updated;
                      const Icon = meta.icon;
                      const isLast = idx === arr.length - 1;
                      return (
                        <motion.li
                          key={entry.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="relative flex gap-3 pb-5"
                        >
                          {!isLast && (
                            <div className="absolute left-[11px] top-5 bottom-0 w-px bg-white/5" />
                          )}
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mt-0.5 ${meta.color}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-[11px] text-gray-300 leading-snug break-words">{entry.description}</p>
                            <p className="text-[9px] text-gray-600 font-mono mt-1">{formatRelativeTime(entry.timestamp)}</p>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="text-[10px] text-gray-600 font-mono text-center mt-8">История пуста</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col flex-1 min-h-0"
              >
              <div className="p-5 border-b border-white/5">
                <p className="text-sm text-gray-300 leading-relaxed font-light">{activeCase?.description}</p>
                <div className="flex gap-6 mt-4 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  <div>{activeCase?.cards.length ?? 0} карточки(ек)</div>
                  <div>{activeCase?.links.length ?? 0} связи(ей)</div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col min-h-0">
                <h3 className="text-[9px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-4">Задачи</h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                  {(activeCase?.tasks ?? []).map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-3 group"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-3 h-3 mt-1 rounded-sm border flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-gray-500 border-gray-500'
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {task.completed && <div className="w-1.5 h-1.5 bg-black" />}
                      </button>
                      <div className="text-xs flex-1">
                        <span
                          className={`transition-all duration-300 block leading-relaxed ${
                            task.completed ? 'text-gray-600 line-through' : 'text-gray-300'
                          }`}
                        >
                          {task.text}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-400 text-[10px] transition-opacity px-1"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Новая задача..."
                    className="flex-1 bg-transparent border-b border-gray-800 focus:border-gray-500 rounded-none px-0 py-1.5 text-xs text-white focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 bg-black/20">
                <div className="flex justify-between text-[9px] text-gray-700 font-mono">
                  <span>UPD: {activeCase ? new Date(activeCase.updatedAt).toLocaleDateString('ru-RU') : '—'}</span>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      )}
    </motion.aside>
  );
}
