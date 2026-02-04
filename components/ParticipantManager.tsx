
import React, { useState, useMemo } from 'react';
import { Upload, FileText, UserPlus, X, Users, Beaker, Trash2, AlertCircle } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantManagerProps {
  participants: Participant[];
  onAdd: (names: string[]) => void;
  onRemove: (id: string) => void;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({ participants, onAdd, onRemove, setParticipants }) => {
  const [inputText, setInputText] = useState('');

  const handleTextSubmit = () => {
    const names = inputText.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    if (names.length > 0) {
      onAdd(names);
      setInputText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const names = text.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
      onAdd(names);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const generateMockData = () => {
    const mockNames = [
      "陳小明", "林大華", "張美麗", "王志強", "李曉芬", 
      "周杰倫", "蔡依林", "吳名氏", "趙子龍", "孫悟空",
      "陳小明", "黃阿瑪", "許功蓋", "曾參祥", "郭台銘",
      "馬雲龍", "李小龍", "林青霞", "林大華", "王祖賢"
    ];
    onAdd(mockNames);
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const uniqueList = participants.filter(p => {
      const isDuplicate = seen.has(p.name);
      seen.add(p.name);
      return !isDuplicate;
    });
    setParticipants(uniqueList);
  };

  // 檢測重複姓名
  const duplicateNames = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return Object.keys(counts).filter(name => counts[name] > 1);
  }, [participants]);

  const hasDuplicates = duplicateNames.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">管理參與者名單</h2>
          <p className="text-slate-500 text-sm">貼上姓名或上傳檔案。重複的姓名將被系統自動標記。</p>
        </div>
        <button
          onClick={generateMockData}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors"
        >
          <Beaker size={16} />
          產生模擬名單
        </button>
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        {/* Input Section */}
        <div className="space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={16} />
              手動輸入名單
            </label>
            <textarea
              className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-sm"
              placeholder="請輸入姓名，多位姓名請用換行或逗號隔開..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!inputText.trim()}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              加入名單
            </button>
          </div>

          <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors group">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="text-slate-400 group-hover:text-indigo-500 transition-colors" size={32} />
              <p className="text-sm font-medium text-slate-600">上傳 CSV 或 TXT 檔案</p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 flex flex-col min-h-[400px] lg:h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              目前的參與者 ({participants.length})
              {hasDuplicates && (
                <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
                  <AlertCircle size={10} /> 有重複項目
                </span>
              )}
            </span>
            {hasDuplicates && (
              <button 
                onClick={removeDuplicates}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg"
              >
                <Trash2 size={12} /> 移除重複項
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {participants.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Users size={40} className="opacity-20" />
                <p>目前還沒有人...</p>
              </div>
            ) : (
              participants.map((p) => {
                const isDuplicate = duplicateNames.includes(p.name);
                return (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border group shadow-sm transition-colors ${isDuplicate ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-medium">{p.name}</span>
                      {isDuplicate && (
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">Duplicate</span>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(p.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantManager;
