import React, { useState } from 'react';
import { 
  Move, 
  Sparkles, 
  Link2, 
  RotateCcw, 
  CheckCircle, 
  ArrowRight,
  Hand,
  Layers
} from 'lucide-react';
import { DragDropQuestion } from '../../types';
import { sounds } from '../../utils/soundEffects';

interface Part3Props {
  questions: DragDropQuestion[];
  answers: Record<string, Record<string, string>>;
  onSetPairMatch: (questionId: string, leftId: string, rightText: string) => void;
  onClearQuestionMatches: (questionId: string) => void;
}

export function Part3DragDrop({
  questions,
  answers,
  onSetPairMatch,
  onClearQuestionMatches,
}: Part3Props) {
  // Selected left item for click-to-pair mode (great for touch/mobile)
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [draggedLeftId, setDraggedLeftId] = useState<string | null>(null);

  if (!questions || questions.length === 0) {
    return <div className="p-6 text-center text-slate-500">Không có câu hỏi Kéo thả.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm">
            3
          </span>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
              Trò 3: Kéo thả nội dung & Ghép nối thẻ
            </h3>
            <p className="text-xs text-slate-600">
              <span className="font-bold text-amber-900">Cách 1:</span> Kéo thẻ bên trái thả vào ô bên phải. <span className="font-bold text-amber-900">Cách 2:</span> Bấm chọn thẻ trái rồi bấm ô phải để ghép.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-xl flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5" /> Hỗ trợ cảm ứng & Kéo thả
          </span>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-8">
        {questions.map((q, qIdx) => {
          const qMatches = answers[q.id] || {};
          const matchedCount = Object.keys(qMatches).length;
          const totalPairs = q.pairs.length;

          // Collect all right-side targets
          const rightTargets = q.pairs.map(p => p.rightItem);

          const handleLeftClick = (leftId: string) => {
            sounds.playClick();
            if (selectedLeftId === leftId) {
              setSelectedLeftId(null);
            } else {
              setSelectedLeftId(leftId);
            }
          };

          const handleRightClick = (rightItem: string) => {
            if (selectedLeftId) {
              sounds.playMatchPair();
              onSetPairMatch(q.id, selectedLeftId, rightItem);
              setSelectedLeftId(null);
            }
          };

          const handleDragStart = (e: React.DragEvent, leftId: string) => {
            e.dataTransfer.setData('text/plain', leftId);
            setDraggedLeftId(leftId);
          };

          const handleDrop = (e: React.DragEvent, rightItem: string) => {
            e.preventDefault();
            const leftId = e.dataTransfer.getData('text/plain') || draggedLeftId;
            if (leftId) {
              sounds.playMatchPair();
              onSetPairMatch(q.id, leftId, rightItem);
            }
            setDraggedLeftId(null);
          };

          const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
          };

          return (
            <div
              key={q.id}
              className="bg-amber-50/70 border border-amber-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Question Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="px-3 py-1 bg-amber-200 text-amber-700 text-xs font-bold rounded-lg uppercase tracking-tight">
                      Trò 3: Kéo thả
                    </span>
                    <span className="text-amber-700 font-mono text-sm font-bold">
                      Câu {qIdx + 1}/{questions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({q.points} điểm)
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                    {q.prompt}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    Đã ghép: {matchedCount}/{totalPairs} cặp
                  </span>

                  {matchedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onClearQuestionMatches(q.id);
                        setSelectedLeftId(null);
                      }}
                      className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm lại câu này</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Selection Indicator */}
              {selectedLeftId && (
                <div className="p-3.5 bg-amber-100 border-2 border-amber-400 rounded-2xl text-xs text-amber-900 font-bold flex items-center justify-between animate-pulse shadow-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>
                      Đang chọn thẻ: <strong>{q.pairs.find(p => p.id === selectedLeftId)?.leftItem}</strong>
                    </span>
                  </div>
                  <span>👉 Hãy bấm vào ô bên phải để ghép đôi!</span>
                </div>
              )}

              {/* Matching Board: 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Column Left: Draggable / Selectable Tokens */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" /> Thẻ nội dung / Khái niệm
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold">Kéo hoặc Bấm chọn</span>
                  </div>

                  <div className="space-y-2.5">
                    {q.pairs.map((pair, pIdx) => {
                      const isSelected = selectedLeftId === pair.id;
                      const matchedTarget = qMatches[pair.id];
                      const isMatched = !!matchedTarget;

                      return (
                        <div
                          key={pair.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, pair.id)}
                          onClick={() => handleLeftClick(pair.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing select-none flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                              : isMatched
                              ? 'border-emerald-300 bg-emerald-50 text-slate-800'
                              : 'border-amber-200 bg-white text-slate-800 hover:border-amber-400 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {pIdx + 1}
                            </span>
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                              {pair.leftItem}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isMatched && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                                <Link2 className="w-3.5 h-3.5" /> Đã ghép
                              </span>
                            )}
                            <Move className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'} shrink-0`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column Right: Drop Targets / Definitions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-emerald-600" /> Ô nhận / Ý nghĩa tương ứng
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Thả thẻ vào đây</span>
                  </div>

                  <div className="space-y-2.5">
                    {rightTargets.map((rightText, rIdx) => {
                      // Find which left pair is currently attached to this right text
                      const matchedLeftPair = q.pairs.find(
                        p => qMatches[p.id]?.trim().toLowerCase() === rightText.trim().toLowerCase()
                      );

                      return (
                        <div
                          key={rIdx}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, rightText)}
                          onClick={() => handleRightClick(rightText)}
                          className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[76px] flex flex-col justify-center ${
                            matchedLeftPair
                              ? 'border-emerald-500 bg-white border-solid shadow-xs'
                              : selectedLeftId
                              ? 'border-amber-500 bg-amber-100/50 hover:bg-amber-100'
                              : 'border-amber-300 bg-white/90 hover:border-amber-400'
                          }`}
                        >
                          <div className="text-xs font-bold text-amber-800 mb-1">
                            Mục tiêu {String.fromCharCode(65 + rIdx)}:
                          </div>

                          <p className="text-sm text-slate-800 leading-snug font-medium">
                            {rightText}
                          </p>

                          {/* Connected Badge */}
                          {matchedLeftPair ? (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                Đã ghép với: "{matchedLeftPair.leftItem}"
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sounds.playClick();
                                  onSetPairMatch(q.id, matchedLeftPair.id, '');
                                }}
                                className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer px-2 py-0.5 rounded-md hover:bg-rose-50"
                              >
                                Gỡ ghép
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic mt-1">
                              Kéo đáp án vào đây
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
