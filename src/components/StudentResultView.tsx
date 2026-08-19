import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Award, 
  FileText,
  Printer,
  Home,
  MessageSquare,
  Users
} from 'lucide-react';
import { ExamResult } from '../types';
import { sounds } from '../utils/soundEffects';

interface ResultViewProps {
  result: ExamResult;
  onRetake: () => void;
  onBackHome: () => void;
  onGoToTeacherDashboard: () => void;
}

export function StudentResultView({
  result,
  onRetake,
  onBackHome,
  onGoToTeacherDashboard,
}: ResultViewProps) {
  const [expandedSection, setExpandedSection] = useState<'all' | 'part1' | 'part2' | 'part3' | 'part4'>('all');

  useEffect(() => {
    // Launch celebratory confetti if score is high
    if (result.percentage >= 65) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result]);

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  const getClassificationColor = (grade: string) => {
    switch (grade) {
      case 'Xuất sắc':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Giỏi':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Khá':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Đạt':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      {/* Score Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Kết quả</span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getClassificationColor(result.gradeClassification)}`}>
                  {result.gradeClassification}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {formatSeconds(result.timeSpentSeconds)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {result.student.fullName}
              </h2>
              <p className="text-sm text-slate-600">
                Lớp <strong className="text-slate-800">{result.student.className}</strong> • {result.examTitle}
              </p>
            </div>
          </div>

          {/* Big Score Number */}
          <div className="text-center bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200 min-w-[140px]">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
              {result.totalScore}
              <span className="text-lg text-slate-400 font-normal">/{result.maxScore}</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
              Đạt {result.percentage}% điểm
            </div>
          </div>
        </div>

        {/* Teacher Feedback / Pedagogical Assessment */}
        {result.feedback && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 text-sm text-emerald-950">
            <MessageSquare className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-emerald-900">Nhận xét của hệ thống & Giáo viên:</strong>
              <p className="mt-0.5 leading-relaxed">{result.feedback}</p>
            </div>
          </div>
        )}

        {/* Breakdown of 4 games */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-3xl shadow-xs">
            <span className="text-[11px] font-bold text-blue-800 uppercase block mb-1">
              Trò 1: Trắc nghiệm
            </span>
            <div className="text-xl font-black text-slate-800">
              {result.partScores.part1.score}
              <span className="text-xs text-slate-400 font-normal">/{result.partScores.part1.max}đ</span>
            </div>
            <span className="text-xs font-semibold text-blue-700">
              Đúng {result.partScores.part1.correctCount}/{result.partScores.part1.totalCount} câu
            </span>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-3xl shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
              Trò 2: Đúng / Sai
            </span>
            <div className="text-xl font-black text-slate-800">
              {result.partScores.part2.score}
              <span className="text-xs text-slate-400 font-normal">/{result.partScores.part2.max}đ</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700">
              Đúng {result.partScores.part2.correctCount}/{result.partScores.part2.totalCount} ý
            </span>
          </div>

          <div className="bg-amber-50/80 border border-amber-100 p-4 rounded-3xl shadow-xs">
            <span className="text-[11px] font-bold text-amber-900 uppercase block mb-1">
              Trò 3: Kéo thả
            </span>
            <div className="text-xl font-black text-slate-800">
              {result.partScores.part3.score}
              <span className="text-xs text-slate-400 font-normal">/{result.partScores.part3.max}đ</span>
            </div>
            <span className="text-xs font-semibold text-amber-800">
              Đúng {result.partScores.part3.correctCount}/{result.partScores.part3.totalCount} cặp
            </span>
          </div>

          <div className="bg-rose-50/80 border border-rose-100 p-4 rounded-3xl shadow-xs">
            <span className="text-[11px] font-bold text-rose-900 uppercase block mb-1">
              Trò 4: Điền khuyết
            </span>
            <div className="text-xl font-black text-slate-800">
              {result.partScores.part4.score}
              <span className="text-xs text-slate-400 font-normal">/{result.partScores.part4.max}đ</span>
            </div>
            <span className="text-xs font-semibold text-rose-800">
              Đúng {result.partScores.part4.correctCount}/{result.partScores.part4.totalCount} ô
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Chọn bài kiểm tra khác</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onGoToTeacherDashboard}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Xem Sổ Theo Dõi Lớp</span>
            </button>

            <button
              type="button"
              onClick={onRetake}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại đề này</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Chi tiết từng câu hỏi & Lời giải
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Xem lại để củng cố kiến thức
          </span>
        </div>

        {/* Part 1 Review */}
        {result.details.part1_mcq.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="font-extrabold text-sm text-blue-800 uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Trò 1: Trắc nghiệm khách quan nhiều lựa chọn
            </h4>

            <div className="space-y-3">
              {result.details.part1_mcq.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${
                    item.isCorrect ? 'bg-blue-50/40 border-blue-200' : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-800">
                      Câu {idx + 1}: {item.prompt}
                    </p>
                    {item.isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đúng (+{item.score}đ)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Sai (0đ)
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs space-y-1">
                    <p className="text-slate-600">
                      Đáp án của em: <strong className={item.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{item.userAnswerText}</strong>
                    </p>
                    {!item.isCorrect && (
                      <p className="text-emerald-700 font-bold">
                        Đáp án đúng: <strong>{item.correctAnswerText}</strong>
                      </p>
                    )}
                    {item.explanation && (
                      <p className="text-slate-500 pt-1 border-t border-slate-200/60 mt-1 italic">
                        💡 Giải thích: {item.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Part 2 Review */}
        {result.details.part2_tf.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="font-extrabold text-sm text-emerald-800 uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Trò 2: Trắc nghiệm Đúng / Sai
            </h4>

            <div className="space-y-3">
              {result.details.part2_tf.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-2">
                  <p className="text-sm font-bold text-slate-800">{item.prompt}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.statements.map((st) => (
                      <div
                        key={st.statementId}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${
                          st.isCorrect ? 'bg-white border-emerald-300' : 'bg-white border-rose-300'
                        }`}
                      >
                        <span className="text-slate-700 font-medium">{st.text}</span>
                        <div className="text-right shrink-0">
                          <span className={`font-bold ${st.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {st.userValue === undefined ? 'Chưa làm' : st.userValue ? 'Đúng' : 'Sai'}
                          </span>
                          {!st.isCorrect && (
                            <span className="block text-[10px] text-slate-500">
                              (Đúng là: {st.correctValue ? 'Đúng' : 'Sai'})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Part 3 Review */}
        {result.details.part3_drag.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="font-extrabold text-sm text-amber-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Trò 3: Kéo thả ghép nối
            </h4>

            <div className="space-y-3">
              {result.details.part3_drag.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100 space-y-2">
                  <p className="text-sm font-bold text-slate-800">{item.prompt}</p>
                  <div className="space-y-2 text-xs">
                    {item.matches.map((m) => (
                      <div
                        key={m.leftId}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          m.isCorrect ? 'bg-white border-emerald-300' : 'bg-white border-rose-300'
                        }`}
                      >
                        <span className="font-bold text-slate-800">
                          {m.leftText}
                        </span>
                        <div className="text-right">
                          <span className={m.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {m.userRightText}
                          </span>
                          {!m.isCorrect && (
                            <span className="block text-[11px] text-emerald-700 font-medium">
                              (Đáp án đúng: {m.correctRightText})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Part 4 Review */}
        {result.details.part4_fill.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="font-extrabold text-sm text-rose-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              Trò 4: Điền khuyết đoạn văn
            </h4>

            <div className="space-y-3">
              {result.details.part4_fill.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100 space-y-2">
                  <p className="text-sm font-bold text-slate-800">{item.prompt}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {item.blanks.map((b) => (
                      <div
                        key={b.key}
                        className={`p-3 rounded-xl border ${
                          b.isCorrect ? 'bg-white border-emerald-300' : 'bg-white border-rose-300'
                        }`}
                      >
                        <span className="text-slate-500 font-medium block">Ô {b.key.replace('blank_', '')}:</span>
                        <strong className={b.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          "{b.userAnswer}"
                        </strong>
                        {!b.isCorrect && (
                          <span className="block text-[10px] text-emerald-700 font-semibold mt-1">
                            Đáp án: {b.correctAnswers.join(' / ')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {item.explanation && (
                    <p className="text-xs text-slate-500 italic mt-2">
                      💡 {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
