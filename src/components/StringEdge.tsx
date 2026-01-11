import { memo } from 'react';
import { EdgeProps, useStore as useReactFlowStore } from 'reactflow';

function StringEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
}: EdgeProps) {
  const sourceNode = useReactFlowStore((s) => s.nodeInternals.get(source)) as any;
  const targetNode = useReactFlowStore((s) => s.nodeInternals.get(target)) as any;

  const getNodeCenter = (node: any) => {
    const x = (node.positionAbsolute?.x ?? node.position?.x ?? 0);
    const y = (node.positionAbsolute?.y ?? node.position?.y ?? 0);
    const w = node.measured?.width ?? node.width ?? node.__rf?.width ?? 0;
    const h = node.measured?.height ?? node.height ?? node.__rf?.height ?? 0;
    return { x: x + w / 2, y: y + h / 2, w, h, x0: x, y0: y };
  };

  const getRectIntersection = (
    rect: { x: number; y: number; w: number; h: number },
    towards: { x: number; y: number }
  ) => {
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const dx = towards.x - cx;
    const dy = towards.y - cy;

    const halfW = rect.w / 2;
    const halfH = rect.h / 2;

    const sx = dx === 0 ? Number.POSITIVE_INFINITY : halfW / Math.abs(dx);
    const sy = dy === 0 ? Number.POSITIVE_INFINITY : halfH / Math.abs(dy);
    const t = Math.min(sx, sy);

    return { x: cx + dx * t, y: cy + dy * t };
  };

  let sx = sourceX;
  let sy = sourceY;
  let tx = targetX;
  let ty = targetY;

  if (sourceNode && targetNode) {
    const sc = getNodeCenter(sourceNode);
    const tc = getNodeCenter(targetNode);
    if (sc.w > 0 && sc.h > 0 && tc.w > 0 && tc.h > 0) {
      const sIntersect = getRectIntersection({ x: sc.x0, y: sc.y0, w: sc.w, h: sc.h }, { x: tc.x, y: tc.y });
      const tIntersect = getRectIntersection({ x: tc.x0, y: tc.y0, w: tc.w, h: tc.h }, { x: sc.x, y: sc.y });
      sx = sIntersect.x;
      sy = sIntersect.y;
      tx = tIntersect.x;
      ty = tIntersect.y;
    }
  }

  if (![sx, sy, tx, ty].every(Number.isFinite)) {
    return null;
  }

  const edgePath = `M ${sx},${sy} L ${tx},${ty}`;

  return (
    <g className="group cursor-pointer">
      <defs>
        <linearGradient id={`string-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="50%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>

      <path
        d={edgePath}
        fill="none"
        stroke={`url(#string-gradient-${id})`}
        strokeWidth={3}
        strokeLinecap="round"
        style={{
          ...style,
        }}
      />

            <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />
    </g>
  );
}

export default memo(StringEdge);
