
import React, { useState, useCallback } from 'react';
import { Users, Gift, LayoutGrid, ClipboardList, Trash2 } from 'lucide-react';
import ParticipantManager from './components/ParticipantManager';
import LuckyDraw from './components/LuckyDraw';
import GroupingTool from './components/GroupingTool';
import { Participant } from './types';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<'manage' | 'draw' | 'group'>('manage');

  const handleAddParticipants = useCallback((names: string[]) => {
    const newParticipants: Participant[] = names
      .filter(n => n.trim() !== '')
      .map(name => ({
        id: Math.random().toString(36).substr(2, 9) + Date.now(),
        name: name.trim()
      }));
    setParticipants(prev => [...prev, ...newParticipants]);
  }, []);

  const handleClearParticipants = useCallback(() => {
    if (window.confirm('確定要清除所有名單嗎？')) {
      setParticipants([]);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <ClipboardList size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">HR Pro Toolkit</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'manage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={18} />
              <span>名單管理</span>
            </button>
            <button
              onClick={() => setActiveTab('draw')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'draw' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Gift size={18} />
              <span>獎品抽籤</span>
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'group' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid size={18} />
              <span>自動分組</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">
              總人數: <span className="text-indigo-600">{participants.length}</span>
            </span>
            <button 
              onClick={handleClearParticipants}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
              title="清除所有名單"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] overflow-hidden">
          {activeTab === 'manage' && (
            <ParticipantManager 
              participants={participants} 
              onAdd={handleAddParticipants} 
              onRemove={(id) => setParticipants(prev => prev.filter(p => p.id !== id))}
              setParticipants={setParticipants}
            />
          )}
          {activeTab === 'draw' && (
            <LuckyDraw participants={participants} />
          )}
          {activeTab === 'group' && (
            <GroupingTool participants={participants} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} HR Pro Toolkit • 提升行政效率的抽籤與分組工具
      </footer>
    </div>
  );
}

export default App;
