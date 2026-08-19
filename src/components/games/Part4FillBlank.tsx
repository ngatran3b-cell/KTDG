import { useState } from 'react';
import { Edit3, Sparkles, HelpCircle, Check, BookOpen } from 'lucide-react';
import { FillBlankQuestion } from '../../types';
import { sounds } from '../../utils/soundEffects';

interface Part4Props {
  questions: FillBlankQuestion[];
  answers: Record<string, Record<string, string>>;
  onSetBlankAnswer: (questionId: string, blankKey: string, text: string) => void;
}

export function Part4FillBlank({ questions, answers, onSetBlankAnswer }: Part4Props) {
  const [activeBlankKey, setActiveBlankKey] = useState<string | null>(null);

  if (!questions || questions.length === 0) {
    return <div className="p-6 text-center text-slate-500">Không có câu hỏi Điền khuyết.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm">
            4
          </span>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
              Trò 4: Điền khuyết hoàn thành nội dung
            </h3>
            <p className="text-xs text-slate-600">
              Nhập từ còn thiếu vào các ô trống hoặc chọn từ trong ngân hàng từ gợi ý bên dưới
            </p>
          </div>
        </div>

        <div className="text-xs font-bold px-3 py-1 bg-rose-100 text-rose-800 rounded-xl">
          Tư duy ngôn ngữ & Khái niệm
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-8">
        {questions.map((q, qIdx) => {
          const qBlanks = answers[q.id] || {};
          const totalBlanks = q.blanks.length;
          const filledCount = Object.values(qBlanks).filter(v => v && v.trim().length > 0).length;

          // Split template text by {{blank_x}}
          const renderTemplateWithInputs = () => {
            const parts = q.templateText.split(/(\{\{blank_\d+\}\})/g);

            return parts.map((part, idx) => {
              const match = part.match(/^\{\{(blank_\d+)\}\}$/);
              if (match) {
                const blankKey = match[1];
                const blankDef = q.blanks.find(b => b.key === blankKey);
                const currentVal = qBlanks[blankKey] || '';
                const isActive = activeBlankKey === `${q.id}_${blankKey}`;

                return (
                  <span key={idx} className="inline-block mx-1.5 align-middle my-1">
                    <input
                      type="text"
                      value={currentVal}
                      onFocus={() => setActiveBlankKey(`${q.id}_${blankKey}`)}
                      onChange={(e) => onSetBlankAnswer(q.id, blankKey, e.target.value)}
                      placeholder={blankDef?.placeholder || `[Ô trống ${blankKey.replace('blank_', '')}]`}
                      className={`px-3 py-1.5 text-sm sm:text-base font-bold rounded-xl border-2 transition-all shadow-xs text-center min-w-[140px] max-w-[240px] focus:outline-none ${
                        isActive
                          ? 'border-rose-600 bg-white ring-2 ring-rose-300 text-rose-800'
                          : currentVal.trim()
                          ? 'border-rose-500 bg-white text-rose-700 font-bold'
                          : 'border-rose-300 bg-white/90 text-slate-800 placeholder-rose-300'
                      }`}
                    />
                  </span>
                );
              }
              return <span key={idx}>{part}</span>;
            });
          };

          const handleWordBankClick = (word: string) => {
            sounds.playClick();
            // If active blank is in this question, fill it
            if (activeBlankKey && activeBlankKey.startsWith(`${q.id}_`)) {
              const blankKey = activeBlankKey.replace(`${q.id}_`, '');
              onSetBlankAnswer(q.id, blankKey, word);
            } else {
              // Find first empty blank
              const firstEmpty = q.blanks.find(b => !qBlanks[b.key]?.trim());
              if (firstEmpty) {
                onSetBlankAnswer(q.id, firstEmpty.key, word);
                setActiveBlankKey(`${q.id}_${firstEmpty.key}`);
              }
            }
          };

          return (
            <div
              key={q.id}
              className="bg-rose-50/70 border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-rose-200/60 pb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="px-3 py-1 bg-rose-200 text-rose-700 text-xs font-bold rounded-lg uppercase tracking-tight">
                      Trò 4: Điền khuyết
                    </span>
                    <span className="text-rose-700 font-mono text-sm font-bold">
                      Câu {qIdx + 1}/{questions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({q.points} điểm)
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                    {q.prompt}
                  </h4>
                  {q.instruction && (
                    <p className="text-xs text-slate-500 mt-1">{q.instruction}</p>
                  )}
                </div>

                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full shrink-0">
                  Đã điền: {filledCount}/{totalBlanks} ô
                </span>
              </div>

              {/* Dynamic Interactive Reading Text */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-rose-200 text-base sm:text-lg text-slate-800 leading-loose shadow-xs font-medium">
                {renderTemplateWithInputs()}
              </div>

              {/* Word Bank Suggestions */}
              {q.wordBank && q.wordBank.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-rose-600" /> Ngân hàng từ gợi ý:
                    </span>
                    <span className="text-[11px] text-rose-600 font-semibold">
                      Bấm vào từ để chèn nhanh vào ô đang chọn
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {q.wordBank.map((word, wIdx) => (
                      <button
                        type="button"
                        key={wIdx}
                        onClick={() => handleWordBankClick(word)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-bold hover:bg-rose-500 hover:text-white hover:border-rose-500 shadow-xs transition-all cursor-pointer"
                      >
                        + {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints list if present */}
              {q.blanks.some(b => !!b.hint) && (
                <div className="text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-rose-100 space-y-1">
                  <span className="font-bold text-slate-700">💡 Gợi ý làm bài:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {q.blanks.filter(b => b.hint).map(b => (
                      <li key={b.key}>
                        <strong>Ô {b.key.replace('blank_', '')}:</strong> {b.hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
