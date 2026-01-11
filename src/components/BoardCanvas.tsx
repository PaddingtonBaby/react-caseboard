import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Node,
  Edge,
  NodeChange,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import EvidenceCardNode from './EvidenceCardNode';
import StringEdge from './StringEdge';

const nodeTypes = {
  evidenceCard: EvidenceCardNode,
};

const edgeTypes = {
  stringEdge: StringEdge,
};

export default function BoardCanvas() {
  const {
    cases,
    activeCaseId,
    updateCardPosition,
    addLink,
    deleteLink,
    openContextMenu,
    closeContextMenu,
    zoom,
    setZoom,
  } = useStore();

  const { setViewport, getViewport } = useReactFlow();
  const activeCase = cases.find((c) => c.id === activeCaseId);

  const initialNodes: Node[] = useMemo(
    () =>
      activeCase?.cards.map((card) => ({
        id: card.id,
        type: 'evidenceCard',
        position: card.position,
        data: card,
      })) || [],
    [activeCase?.cards]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      activeCase?.links.map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        type: 'stringEdge',
        data: { label: link.label },
      })) || [],
    [activeCase?.links]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes((currentNodes) => {
      const newNodeIds = new Set(initialNodes.map(n => n.id));
      const currentNodeIds = new Set(currentNodes.map(n => n.id));
      
      const nodesAdded = initialNodes.filter(n => !currentNodeIds.has(n.id));
      const nodesRemoved = currentNodes.filter(n => !newNodeIds.has(n.id));
      
      if (nodesRemoved.length > 0) {
        const removedIds = new Set(nodesRemoved.map(n => n.id));
        
        const nodesWithRemoving = currentNodes.map(node => 
          removedIds.has(node.id) 
            ? { ...node, data: { ...node.data, isRemoving: true } }
            : node
        );
        
        setTimeout(() => {
          setNodes(initialNodes);
        }, 400);
        
        return nodesWithRemoving;
      }
      
      if (nodesAdded.length > 0) {
        return initialNodes;
      }
      
      return currentNodes.map((node) => {
        const updatedCard = activeCase?.cards.find((card) => card.id === node.id);
        if (updatedCard) {
          return {
            ...node,
            position: updatedCard.position,
            data: updatedCard,
          };
        }
        return node;
      });
    });
  }, [activeCase?.cards, initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  useEffect(() => {
    const viewport = getViewport();
    setViewport({ ...viewport, zoom });
  }, [zoom, setViewport, getViewport]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.dragging !== true) {
          updateCardPosition(change.id, change.position);
        }
      });
    },
    [onNodesChange, updateCardPosition]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateCardPosition(node.id, node.position);
    },
    [updateCardPosition]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        if (connection.source === connection.target) return;
        addLink(connection.source, connection.target);
        setEdges((eds) => addEdge({ ...connection, type: 'stringEdge' }, eds));
      }
    },
    [addLink, setEdges]
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;

      const links = activeCase?.links ?? [];
      const exists = links.some(
        (l) =>
          (l.source === connection.source && l.target === connection.target) ||
          (l.source === connection.target && l.target === connection.source)
      );
      return !exists;
    },
    [activeCase?.links]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      deleteLink(edge.id);
    },
    [deleteLink]
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const reactFlowBounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (reactFlowBounds) {
        const viewport = getViewport();
        const flowX = (event.clientX - reactFlowBounds.left - viewport.x) / viewport.zoom;
        const flowY = (event.clientY - reactFlowBounds.top - viewport.y) / viewport.zoom;
        openContextMenu(event.clientX, event.clientY, { x: flowX, y: flowY });
      }
    },
    [openContextMenu, getViewport]
  );

  const onPaneClick = useCallback(() => {
    closeContextMenu();
  }, [closeContextMenu]);

  const onMoveEnd = useCallback(
    (_: unknown, viewport: { zoom: number }) => {
      setZoom(viewport.zoom);
    },
    [setZoom]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onEdgeClick={onEdgeClick}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionRadius={140}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: 'stringEdge',
          animated: false,
        }}
        connectionLineStyle={{
          stroke: '#b91c1c',
          strokeWidth: 4,
          strokeLinecap: 'round',
        }}
        fitView
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background
          color="rgba(148, 163, 184, 0.1)"
          gap={40}
          size={1}
        />
      </ReactFlow>
    </div>
  );
}
