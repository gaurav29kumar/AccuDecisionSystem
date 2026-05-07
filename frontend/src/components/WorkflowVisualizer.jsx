import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, ShieldCheck, Scale, History, Wand2 } from 'lucide-react';

const nodes = [
  { id: 'planner', label: 'Planner Agent', icon: Brain, x: 20, y: 15, color: 'var(--color-neon-cyan)' },
  { id: 'executor', label: 'Executor Agent', icon: Cpu, x: 50, y: 15, color: 'var(--color-neon-cyan)' },
  { id: 'verifier', label: 'Verifier Agent', icon: ShieldCheck, x: 80, y: 40, color: 'var(--color-neon-emerald)' },
  { id: 'bias_detector', label: 'Bias Detector', icon: Scale, x: 80, y: 70, color: 'var(--color-neon-purple)' },
  { id: 'reflection', label: 'Reflection Agent', icon: History, x: 50, y: 85, color: 'var(--color-neon-purple)' },
  { id: 'optimizer', label: 'Optimizer Agent', icon: Wand2, x: 20, y: 85, color: 'var(--color-neon-purple)' },
];

const edges = [
  { source: 'planner', target: 'executor' },
  { source: 'executor', target: 'verifier' },
  { source: 'verifier', target: 'bias_detector' },
  { source: 'bias_detector', target: 'reflection', dashed: true },
  { source: 'reflection', target: 'optimizer' },
  { source: 'optimizer', target: 'planner' },
];

const NodeItem = ({ node, isActive }) => {
  const Icon = node.icon;
  
  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center gap-2 transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: isActive ? 10 : 1 }}
      animate={{
        scale: isActive ? 1.1 : 1,
        opacity: isActive ? 1 : 0.6
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/60 border border-white/20 backdrop-blur-md relative"
        animate={{
          boxShadow: isActive 
            ? `0 0 20px ${node.color}, inset 0 0 10px ${node.color}` 
            : '0 0 0px transparent'
        }}
      >
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: `1px solid ${node.color}` }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
        <Icon size={24} style={{ color: isActive ? node.color : '#9ca3af' }} />
      </motion.div>
      <span className="text-xs font-display tracking-wider font-medium text-gray-300 bg-black/40 px-2 py-1 rounded backdrop-blur-sm whitespace-nowrap">
        {node.label}
      </span>
    </motion.div>
  );
};

const EdgeLine = ({ source, target, dashed, isActive }) => {
  const s = nodes.find(n => n.id === source);
  const t = nodes.find(n => n.id === target);
  
  // Calculate SVG line coordinates (converting from % to viewbox coords)
  const x1 = s.x;
  const y1 = s.y;
  const x2 = t.x;
  const y2 = t.y;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {/* Background line */}
      <line
        x1={`${x1}%`} y1={`${y1}%`}
        x2={`${x2}%`} y2={`${y2}%`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2"
        strokeDasharray={dashed ? "5,5" : "none"}
      />
      
      {/* Animated active line */}
      {isActive && (
        <motion.line
          x1={`${x1}%`} y1={`${y1}%`}
          x2={`${x2}%`} y2={`${y2}%`}
          stroke="var(--color-neon-cyan)"
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
};

const WorkflowVisualizer = ({ activeNode, isRunning }) => {
  // Determine which edge is active based on current node
  const getActiveEdge = () => {
    if (!activeNode) return null;
    const currentIndex = nodes.findIndex(n => n.id === activeNode);
    if (currentIndex === -1) return null;
    
    // Simplistic: light up the edge coming INTO the active node
    const edge = edges.find(e => e.target === activeNode);
    return edge ? `${edge.source}-${edge.target}` : null;
  };

  const activeEdgeId = getActiveEdge();

  return (
    <div className="absolute inset-0 p-8">
      {/* Layer 1: Edges */}
      {edges.map((edge, i) => (
        <EdgeLine 
          key={i} 
          source={edge.source} 
          target={edge.target} 
          dashed={edge.dashed}
          isActive={isRunning && activeEdgeId === `${edge.source}-${edge.target}`}
        />
      ))}
      
      {/* Layer 2: Nodes */}
      {nodes.map(node => (
        <NodeItem 
          key={node.id} 
          node={node} 
          isActive={activeNode === node.id || (isRunning && activeNode === null && node.id === 'planner')} 
        />
      ))}
      
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-neon-cyan)]/5 to-transparent mix-blend-screen pointer-events-none" />
    </div>
  );
};

export default WorkflowVisualizer;
