
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCcw, History, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { Participant, Winner } from '../types';

interface LuckyDrawProps {
  participants: Participant[];
}

const LuckyDraw: React.FC<LuckyDrawProps> = ({ participants }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [prizeName, setPrizeName] = useState('特獎');
  const drawIntervalRef = useRef<number | null>(null);

  const availableParticipants = allowRepeat 
    ? participants 
    : participants.filter(p => !winners.find(w => w.participant.id === p.id));

  const startDraw = () => {
    if (availableParticipants.length === 0) {
      alert('沒有剩餘的可參與者了！');
      return;
    }

    setIsDrawing(true);
    let counter = 0;
    const duration = 2000; // 2 seconds animation
    const interval = 80;

    drawIntervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      setCurrentName(availableParticipants[randomIndex].name);
      counter += interval;

      if (counter >= duration) {
        stopDraw();
      }
    }, interval);
  };

  const stopDraw = () => {
    if (drawIntervalRef.current) {
      clearInterval(drawIntervalRef.current);
    }

    const finalIndex = Math.floor(Math.random() * availableParticipants.length);
    const winner = availableParticipants[finalIndex];
    
    const newWinner: Winner = {
      participant: winner,
      prize: prizeName,
      timestamp: Date.now()
    };

    setWinners(prev => [newWinner, ...prev]);
    setCurrentName(winner.name);
    setIsDrawing(false);
    
    // Simple celebratory effect can be added here if needed
  };

  const resetHistory = () => {
    if (window.confirm('確定要清除所有中獎紀錄嗎？')) {
      setWinners([]);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Left: Control & Animation */}
      <div className="flex-[2] p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-2xl mb-4">
              <Trophy size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">獎品抽籤系統</h2>
            <p className="text-slate-500">準備好揭曉幸運兒了嗎？</p>
          </div>

          <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">獎項名稱</label>
              <input 
                type="text" 
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="例如：特獎、下午茶兌換券..."
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">允許重複抽中</span>
              <button 
                onClick={() => setAllowRepeat(!allowRepeat)}
                className={`transition-colors duration-200 ${allowRepeat ? 'text-indigo-600' : 'text-slate-300'}`}
              >
                {allowRepeat ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
              </button>
            </div>
          </div>

          {/* Animation Box */}
          <div className="relative h-48 bg-slate-900 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-slate-800 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            
            <div className={`text-4xl md:text-5xl font-bold transition-all duration-75 ${isDrawing ? 'scale-110 text-indigo-400 blur-[1px]' : 'scale-100 text-white'}`}>
              {currentName || '---'}
            </div>

            {/* Scanning line animation */}
            {isDrawing && (
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan" />
            )}
          </div>

          <button
            onClick={startDraw}
            disabled={isDrawing || availableParticipants.length === 0}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isDrawing ? (
              <>
                <RefreshCcw size={24} className="animate-spin" />
                正在抽取...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                開始抽籤
              </>
            )}
          </button>
          
          <div className="text-center text-xs text-slate-400 font-medium">
            目前可參與抽籤人數：{availableParticipants.length}
          </div>
        </div>
      </div>

      {/* Right: Winner History */}
      <div className="flex-1 bg-white p-6 flex flex-col h-[500px] md:h-auto overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <History size={16} />
            中獎紀錄
          </h3>
          <button 
            onClick={resetHistory}
            className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
          >
            清除紀錄
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {winners.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center">
              <Trophy size={48} className="opacity-10 mb-2" />
              <p className="text-sm">尚無中獎紀錄</p>
            </div>
          ) : (
            winners.map((winner, idx) => (
              <div key={winner.timestamp} className="bg-slate-50 p-4 rounded-xl border border-slate-100 animate-slide-in">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-800">{winner.participant.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(winner.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs font-semibold text-indigo-500 bg-indigo-50 inline-block px-2 py-0.5 rounded-full">
                  {winner.prize}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { top: 0%; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 1s linear infinite;
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LuckyDraw;
