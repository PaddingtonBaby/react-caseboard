import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function RightSummaryPanel() {
  const { cases, activeCaseId, selectedCardId, addTask, toggleTask, deleteTask, updateCard, deleteCard } = useStore();
  const [newTask, setNewTask] = useState('');

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
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              {selectedCard.type}
            </span>
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
            <h2 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-1">Сводка</h2>
            <p className="text-[10px] text-gray-600 font-mono">{activeCase?.id || '---'}</p>
          </div>

          {activeCase && (
            <>
              <div className="p-5 border-b border-white/5">
                <p className="text-sm text-gray-300 leading-relaxed font-light">{activeCase.description}</p>
                <div className="flex gap-6 mt-4 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  <div>
                     {activeCase.cards.length} карточки(ек)
                  </div>
                  <div>
                     {activeCase.links.length} связи(ей)
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col min-h-0">
                <h3 className="text-[9px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-4">Задачи</h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                  {activeCase.tasks.map((task) => (
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
                  <span>UPD: {new Date(activeCase.updatedAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </motion.aside>
  );
}
