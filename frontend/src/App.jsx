import React, { useState, useEffect } from 'react';
import { Play, Activity, CheckCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import ChatInput from './components/ChatInput';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import MetricsPanel from './components/MetricsPanel';
import AgentLogs from './components/AgentLogs';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  
  // State for components
  const [scenario, setScenario] = useState('');
  const [agentMessages, setAgentMessages] = useState([]);
  const [metrics, setMetrics] = useState({
    confidence: 0,
    fairness: 0,
    accuracy: 0,
    robustness: 0,
    explainability: 0
  });
  const [biasReport, setBiasReport] = useState(null);
  const [executionResult, setExecutionResult] = useState('');

  useEffect(() => {
    // Connect to WebSocket on mount
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'status') {
        setIsRunning(true);
        // Reset states for new run
        setAgentMessages([]);
        setMetrics({ confidence: 0, fairness: 0, accuracy: 0, robustness: 0, explainability: 0 });
        setBiasReport(null);
        setExecutionResult('');
      } 
      else if (data.type === 'node_update') {
        setActiveNode(data.node);
        
        if (data.latest_message) {
          setAgentMessages(prev => [...prev, data.latest_message]);
        }
        
        // Update specific states based on node output
        const stateDelta = data.state_delta || {};
        
        if (stateDelta.execution_result) {
          setExecutionResult(stateDelta.execution_result);
        }
        
        if (stateDelta.verifier_scores) {
          const scores = stateDelta.verifier_scores;
          setMetrics({
            confidence: scores.overall_confidence,
            fairness: scores.fairness * 10, // scale 1-10 to 1-100
            accuracy: scores.accuracy * 10,
            robustness: scores.robustness * 10,
            explainability: scores.explainability * 10
          });
        }
        
        if (stateDelta.bias_report) {
          setBiasReport(stateDelta.bias_report);
        }
      }
      else if (data.type === 'complete') {
        setIsRunning(false);
        setActiveNode(null);
      }
      else if (data.type === 'error') {
        setIsRunning(false);
        console.error("Pipeline Error:", data.message);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleRunScenario = (text) => {
    if (!socket || !isConnected) return;
    setScenario(text);
    socket.send(JSON.stringify({ scenario: text }));
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between glass-panel p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-neon-cyan)] to-[var(--color-neon-purple)] flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-wide">Accu<span className="text-[var(--color-neon-cyan)]">Decision</span>System</h1>
            <p className="text-xs text-gray-400">Multi-Layer Decision Optimization Matrix</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--color-neon-emerald)] shadow-[0_0_8px_var(--color-neon-emerald)]' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-300">{isConnected ? 'System Online' : 'Connecting...'}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Column: Input & Flow */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ChatInput onRun={handleRunScenario} isRunning={isRunning} disabled={!isConnected} />
          
          <div className="glass-panel p-6 flex-1 flex flex-col min-h-[400px]">
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[var(--color-neon-purple)]" />
              Agent Workflow Topology
            </h2>
            <div className="flex-1 relative border border-white/5 rounded-xl bg-black/20 overflow-hidden p-4">
              <WorkflowVisualizer activeNode={activeNode} isRunning={isRunning} />
            </div>
          </div>
        </div>

        {/* Right Column: Metrics & Logs */}
        <div className="flex flex-col gap-6">
          <MetricsPanel metrics={metrics} biasReport={biasReport} />
          <AgentLogs messages={agentMessages} />
        </div>
      </div>
      
      {/* Final Result Panel (conditionally shown) */}
      {executionResult && !isRunning && (
        <div className="glass-panel p-6 border-[var(--color-neon-emerald)]/30 border">
          <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2 text-[var(--color-neon-emerald)]">
            <CheckCircle size={18} />
            Optimized Decision Output
          </h2>
          <p className="text-gray-200 leading-relaxed font-light">{executionResult}</p>
        </div>
      )}
    </div>
  );
}

export default App;
