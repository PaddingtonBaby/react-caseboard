import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useStore } from './store/useStore';
import BoardCanvas from './components/BoardCanvas';
import LeftCaseList from './components/LeftCaseList';
import RightSummaryPanel from './components/RightSummaryPanel';
import TopToolbar from './components/TopToolbar';
import ContextMenu from './components/ContextMenu';
import ImportExportModal from './components/ImportExportModal';

function App() {
  const initializeStore = useStore((state) => state.initializeStore);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-full relative overflow-hidden bg-board-darker">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80')`,
            filter: 'blur(8px) brightness(0.3)',
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-board-darker/90 via-board-dark/80 to-board-darker/90" />
        
        <div className="noise-overlay" />
        <div className="vignette" />
        
        <div className="relative z-10 w-full h-full flex flex-col">
          <TopToolbar />
          
          <div className="flex-1 flex overflow-hidden">
            <LeftCaseList />
            
            <main className="flex-1 relative">
              <BoardCanvas />
            </main>
            
            <RightSummaryPanel />
          </div>
        </div>
        
        <ContextMenu />
        <ImportExportModal />
      </div>
    </ReactFlowProvider>
  );
}

export default App;

