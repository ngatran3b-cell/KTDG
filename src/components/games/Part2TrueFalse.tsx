import { Check, X, HelpCircle } from 'lucide-react';
import { TrueFalseQuestion } from '../../types';
import { sounds } from '../../utils/soundEffects';

interface Part2Props {
  questions: TrueFalseQuestion[];
  answers: Record<string, Record<string, boolean>>;
  onSetAnswer: (questionId: string, statementId: string, value: boolean) => void;
}

export function Part2TrueFalse({ questions, answers, onSetAnswer }: Part2Props) {
  if (!questions || questions.length === 0) {
    return <div className="p-6 text-center text-slate-500">Không có câu hỏi Đúng/Sai.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
            2
          </span>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
              Trò 2: Trắc nghiệm khách quan Đúng / Sai
            </h3>
            <p className="text-xs text-slate-500">
              Đọc kỹ từng nhận định dưới đây và lựa chọn <span className="font-bold text-emerald-700">Đúng</span> hoặc <span className="font-bold text-rose-700">Sai</span>
            </p>
          </div>
        </div>

        <div className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl">
          Chuẩn GDPT 2018
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const qAnswers = answers[q.id] || {};
          const totalStatements = q.statements.length;
          const answeredStatements = Object.keys(qAnswers).length;

          return (
            <div
              key={q.id}
              className="bg-emerald-50/70 border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
            >
              {/* Question Title & Points */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 bg-emerald-200 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-tight">
                      Trò 2: Đúng / Sai
                    </span>
                    <span className="text-emerald-700 font-mono text-sm font-bold">
                      Câu {qIdx + 1}/{questions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({q.points} điểm)
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug pt-1">
                    {q.prompt}
                  </h4>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full shrink-0">
                  {answeredStatements}/{totalStatements} ý
                </span>
              </div>

              {/* Context if provided */}
              {q.context && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 text-sm text-slate-700 italic">
                  "{q.context}"
                </div>
              )}

              {/* Statements List Table / Card layout */}
              <div className="space-y-3">
                {q.statements.map((st, sIdx) => {
                  const letter = String.fromCharCode(97 + sIdx); // a, b, c, d
                  const val = qAnswers[st.id];

                  return (
                    <div
                      key={st.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        val !== undefined
                          ? 'bg-white border-emerald-300 shadow-xs'
                          : 'bg-white/80 border-emerald-100 hover:border-emerald-200'
                      }`}
                    >
                      {/* Statement Text */}
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {letter})
                        </span>
                        <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                          {st.statement}
                        </p>
                      </div>

                      {/* True / False Buttons */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            onSetAnswer(q.id, st.id, true);
                          }}
                          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            val === true
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                              : 'bg-white border-2 border-emerald-500/40 text-emerald-700 hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>ĐÚNG</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            onSetAnswer(q.id, st.id, false);
                          }}
                          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            val === false
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                              : 'bg-white border-2 border-rose-500/40 text-rose-700 hover:border-rose-500'
                          }`}
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                          <span>SAI</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
