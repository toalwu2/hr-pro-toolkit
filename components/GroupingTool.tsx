
import React, { useState } from 'react';
import { LayoutGrid, Users, Wand2, Download, Copy, FileSpreadsheet } from 'lucide-react';
import { Participant, Group } from '../types';

interface GroupingToolProps {
  participants: Participant[];
}

const GroupingTool: React.FC<GroupingToolProps> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState(4);
  const [groupType, setGroupType] = useState<'perGroup' | 'totalGroups'>('perGroup');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const performGrouping = () => {
    if (participants.length === 0) {
      alert('請先在名單管理頁面加入參與者！');
      return;
    }

    setIsAnimating(true);
    
    setTimeout(() => {
      const shuffled: Participant[] = shuffleArray<Participant>(participants);
      const result: Group[] = [];
      
      let numGroups = 0;
      if (groupType === 'perGroup') {
        numGroups = Math.ceil(shuffled.length / groupSize);
      } else {
        numGroups = groupSize;
      }

      for (let i = 0; i < numGroups; i++) {
        result.push({
          id: i + 1,
          name: `第 ${i + 1} 組`,
          members: []
        });
      }

      shuffled.forEach((p, idx) => {
        let groupIdx;
        if (groupType === 'perGroup') {
          groupIdx = Math.floor(idx / groupSize);
        } else {
          groupIdx = idx % numGroups;
        }
        
        if (result[groupIdx]) {
          result[groupIdx].members.push(p);
        }
      });

      setGroups(result);
      setIsAnimating(false);
    }, 600);
  };

  const copyToClipboard = () => {
    if (groups.length === 0) return;
    const text = groups.map(g => {
      return `${g.name}:\n${g.members.map(m => `・ ${m.name}`).join('\n')}`;
    }).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('分組結果已複製到剪貼簿！');
  };

  const exportToCSV = () => {
    if (groups.length === 0) return;
    
    // 定義 CSV 內容，包含 BOM 以支援 Excel 中文顯示
    const header = "分組,姓名\n";
    const rows = groups.flatMap(g => 
      g.members.map(m => `"${g.name}","${m.name}"`)
    ).join("\n");
    
    const csvContent = "\uFEFF" + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `分組結果_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">自動分組工具</h2>
          <p className="text-slate-500 text-sm">智慧型隨機分配名單成員到不同小組。</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setGroupType('perGroup')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                groupType === 'perGroup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              每組人數
            </button>
            <button
              onClick={() => setGroupType('totalGroups')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                groupType === 'totalGroups' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              固定組數
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={participants.length || 100}
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center font-bold text-indigo-600"
            />
            <span className="text-sm font-medium text-slate-600">
              {groupType === 'perGroup' ? '人 / 組' : '組'}
            </span>
          </div>

          <button
            onClick={performGrouping}
            disabled={isAnimating || participants.length === 0}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2"
          >
            {isAnimating ? <RefreshCcw size={16} className="animate-spin" /> : <Wand2 size={16} />}
            開始分組
          </button>
        </div>
      </div>

      {/* Visual Display */}
      <div className="flex-1 p-8 bg-slate-50/30 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center space-y-4">
            <div className="bg-white p-8 rounded-full shadow-inner">
              <LayoutGrid size={64} className="opacity-10" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-400">尚未產生分組</p>
              <p className="text-sm">設定分組規則後點擊「開始分組」</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-500">
                成功將 <span className="text-indigo-600 font-bold">{participants.length}</span> 位參與者分成 
                <span className="text-indigo-600 font-bold"> {groups.length} </span> 組
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-slate-200 bg-white/50 text-sm font-medium shadow-sm"
                >
                  <Copy size={16} />
                  複製結果
                </button>
                <button 
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-3 py-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all border border-emerald-100 bg-emerald-50/30 text-sm font-medium shadow-sm"
                >
                  <FileSpreadsheet size={16} />
                  下載 CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groups.map((group) => (
                <div key={group.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-pop-in">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-sm">{group.name}</h4>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                      {group.members.length} 人
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-1">
                    {group.members.map((member, mIdx) => (
                      <div key={member.id} className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="text-[10px] font-mono text-slate-300 w-4">{mIdx + 1}.</span>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

// Internal icon for refreshing
const RefreshCcw = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 16h5v5"/>
  </svg>
);

export default GroupingTool;
