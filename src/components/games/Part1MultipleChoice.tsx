import { useState } from 'react';
import { CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';
import { MultipleChoiceQuestion } from '../../types';
import { sounds } from '../../utils/soundEffects';

interface Part1Props {
  questions: MultipleChoiceQuestion[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, optionId: string) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export function Part1MultipleChoice({ questions, answers, onSelectAnswer }: Part1Props) {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  if (!questions || questions.length === 0) {
    return <div className="p-6 text-center text-slate-500">Không có câu hỏi trắc nghiệm.</div>;
  }

  const currentQ = questions[activeQuestionIdx];
  const selectedOptionId = answers[currentQ.id];

  const handleChoose = (optId: string) => {
    sounds.playClick();
    onSelectAnswer(currentQ.id, optId);
  };

  const answeredCount = questions.filter(q => !!answers[q.id]).length;

  return (
    <div className="space-y-6">
      {/* Mini Progress & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            1
          </span>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
              Trò 1: Trắc nghiệm khách quan nhiều lựa chọn
            </h3>
            <p className="text-xs text-slate-500">
              Chọn 1 đáp án chính xác nhất cho mỗi câu hỏi bên dưới
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === activeQuestionIdx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveQuestionIdx(idx);
                }}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'ring-2 ring-blue-500 bg-blue-600 text-white shadow-xs'
                    : isAnswered
                    ? 'bg-blue-100 text-blue-800 border border-blue-200 font-bold'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Bento Card */}
      <div className="bg-blue-50/80 border border-blue-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-blue-200 text-blue-700 text-xs font-bold rounded-lg uppercase tracking-tight">
              Trò 1: Trắc nghiệm
            </span>
            <span className="text-blue-600 font-mono text-sm font-bold">
              Q{activeQuestionIdx + 1}/{questions.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({currentQ.points} điểm)
            </span>
          </div>

          <div className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Đã làm: {answeredCount}/{questions.length}
          </div>
        </div>

        {/* Prompt */}
        <h4 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug mb-6">
          {currentQ.prompt}
        </h4>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const label = OPTION_LABELS[idx] || `${idx + 1}`;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleChoose(opt.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer text-left ${
                  isSelected
                    ? 'p-3 bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'p-3 bg-white border-blue-200 text-slate-700 hover:border-blue-500'
                }`}
              >
                <div
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-white text-blue-600'
                      : 'border-2 border-blue-500 text-blue-500'
                  }`}
                >
                  {label}
                </div>

                <span className={`text-sm sm:text-base leading-snug flex-1 ${isSelected ? 'font-bold' : ''}`}>
                  {opt.text}
                </span>

                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-auto" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Question Controls */}
        <div className="mt-8 pt-6 border-t border-blue-200/60 flex items-center justify-between">
          <button
            type="button"
            disabled={activeQuestionIdx === 0}
            onClick={() => {
              sounds.playClick();
              setActiveQuestionIdx(prev => Math.max(0, prev - 1));
            }}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-blue-100 border border-blue-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Câu trước
          </button>

          {activeQuestionIdx < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveQuestionIdx(prev => prev + 1);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              Câu tiếp theo →
            </button>
          ) : (
            <span className="text-xs text-blue-700 font-bold bg-blue-100 px-3 py-1.5 rounded-xl">
              ✓ Đã xem hết câu hỏi Trò 1
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
