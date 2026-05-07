import React, { useState } from 'react';
import { Send, TerminalSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatInput = ({ onRun, isRunning, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isRunning && !disabled) {
      onRun(text);
    }
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
        <TerminalSquare size={18} className="text-[var(--color-neon-cyan)]" />
        Scenario Initialization
      </h2>
      
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe a scenario or decision problem (e.g., 'Determine whether to launch the new product line despite supply chain risks...')"
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-14 text-sm text-gray-200 focus:outline-none focus:border-[var(--color-neon-cyan)]/50 focus:ring-1 focus:ring-[var(--color-neon-cyan)]/50 transition-all resize-none min-h-[100px]"
          disabled={isRunning || disabled}
        />
        
        <div className="absolute right-3 bottom-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!text.trim() || isRunning || disabled}
            className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
              !text.trim() || isRunning || disabled 
                ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                : 'bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/30 neon-border-cyan'
            }`}
          >
            {isRunning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <Send size={18} />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
