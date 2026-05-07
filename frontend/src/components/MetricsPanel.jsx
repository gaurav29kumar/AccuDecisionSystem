import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Target, AlertTriangle } from 'lucide-react';

const CircularProgress = ({ value, label, color }) => {
  const data = [{ name: label, value: value || 0, fill: color }];
  
  return (
    <div className="relative h-32 w-32 flex flex-col items-center justify-center">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" cy="50%" 
            innerRadius="70%" outerRadius="100%" 
            barSize={10} 
            data={data} 
            startAngle={90} endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center z-10 flex flex-col">
        <span className="text-2xl font-bold font-display" style={{ color }}>{Math.round(value || 0)}%</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

const MetricsPanel = ({ metrics, biasReport }) => {
  const { confidence, fairness, accuracy, robustness, explainability } = metrics;
  
  const barData = [
    { name: 'Fairness', score: fairness, fill: 'var(--color-neon-purple)' },
    { name: 'Accuracy', score: accuracy, fill: 'var(--color-neon-cyan)' },
    { name: 'Robustness', score: robustness, fill: 'var(--color-neon-emerald)' },
    { name: 'Clarity', score: explainability, fill: '#ffaa00' },
  ];

  const getConfidenceColor = (val) => {
    if (val >= 85) return 'var(--color-neon-emerald)';
    if (val >= 60) return '#ffaa00';
    return '#ff3366';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-6">
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Target size={18} className="text-[var(--color-neon-emerald)]" />
          Verifier Metrics
        </h2>
        
        <div className="flex items-center justify-between gap-4 mb-6">
          <CircularProgress 
            value={confidence} 
            label="Confidence" 
            color={getConfidenceColor(confidence)} 
          />
          
          <div className="flex-1 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#333' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-[#ff3366]" />
          Bias Detection Report
        </h2>
        
        {biasReport ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
              <span className="text-sm text-gray-400">Bias Score (Lower is better)</span>
              <span className={`font-bold ${biasReport.bias_score > 20 ? 'text-[#ff3366]' : 'text-[var(--color-neon-emerald)]'}`}>
                {biasReport.bias_score}/100
              </span>
            </div>
            
            <div>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Detected Issues</h3>
              {biasReport.issues.map((issue, idx) => (
                <div key={idx} className="text-sm text-gray-300 bg-[#ff3366]/10 border border-[#ff3366]/30 p-2 rounded mb-2">
                  {issue}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500 italic py-8">
            Awaiting execution data...
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsPanel;
