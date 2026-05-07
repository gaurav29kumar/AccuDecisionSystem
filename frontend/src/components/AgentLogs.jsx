import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft } from 'lucide-react';

const AgentLogs = ({ messages }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getAgentColor = (agent) => {
    switch(agent) {
      case 'Planner': return 'text-[var(--color-neon-cyan)]';
      case 'Executor': return 'text-[var(--color-neon-cyan)]';
      case 'Verifier': return 'text-[var(--color-neon-emerald)]';
      case 'Bias Detector': return 'text-[#ff3366]';
      case 'Reflection': return 'text-[var(--color-neon-purple)]';
      case 'Optimizer': return 'text-[var(--color-neon-purple)]';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col flex-1 max-h-[400px]">
      <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
        <AlignLeft size={18} className="text-gray-400" />
        Cognitive Trace Logs
      </h2>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pr-2"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">
            Waiting for initialization...
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border-l-2 border-white/10 pl-4 py-1"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${getAgentColor(msg.agent)}`}>
                    {msg.agent}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date().toLocaleTimeString([], { hour12: false })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 font-light leading-relaxed">
                  {msg.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AgentLogs;
