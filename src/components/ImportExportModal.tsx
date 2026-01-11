import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function ImportExportModal() {
  const { isImportExportOpen, setImportExportOpen, exportCase, importCase } = useStore();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importJson, setImportJson] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    const json = exportCase();
    if (json) {
      navigator.clipboard.writeText(json);
      setMessage({ type: 'success', text: 'Скопировано!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDownload = () => {
    const json = exportCase();
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Файл сохранен!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = () => {
    if (!importJson.trim()) {
      setMessage({ type: 'error', text: 'Вставьте данные' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const success = importCase(importJson);
    if (success) {
      setMessage({ type: 'success', text: 'Готово!' });
      setImportJson('');
      setTimeout(() => {
        setMessage(null);
        setImportExportOpen(false);
      }, 1500);
    } else {
      setMessage({ type: 'error', text: 'Ошибка формата' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setImportJson(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <AnimatePresence>
      {isImportExportOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            onClick={() => setImportExportOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] bg-[#1a1a2e] border border-white/10 rounded shadow-2xl w-[480px] max-w-[90vw] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">Управление данными</h2>
              <button
                onClick={() => setImportExportOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="flex border-b border-white/5">
              <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                  activeTab === 'export'
                    ? 'text-white border-b border-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Экспорт
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                  activeTab === 'import'
                    ? 'text-white border-b border-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Импорт
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'export' ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 font-mono">
                    Сохраните текущее состояние дела в JSON формат.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleExport}
                      className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white uppercase tracking-wider transition-colors"
                    >
                      Копировать
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white uppercase tracking-wider transition-colors"
                    >
                      Скачать
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 font-mono">
                    Вставьте JSON код или загрузите файл.
                  </p>
                  <textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder="{ ... }"
                    className="w-full h-32 bg-black/20 border border-white/10 rounded p-3 text-xs text-gray-300 font-mono focus:border-white/30 focus:outline-none resize-none"
                  />
                  <div className="flex gap-3">
                    <label className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center">
                      Файл
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleImport}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-xs text-white uppercase tracking-wider transition-colors"
                    >
                      Загрузить
                    </button>
                  </div>
                </div>
              )}

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 text-center text-xs font-mono py-2 rounded ${
                    message.type === 'success' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
