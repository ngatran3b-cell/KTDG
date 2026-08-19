import { useState, useEffect } from 'react';
import { 
  Clock, 
  Send, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { 
  ExamPackage, 
  StudentInfo, 
  StudentAnswerSubmission, 
  ExamResult 
} from '../types';
import { Part1MultipleChoice } from './games/Part1MultipleChoice';
import { Part2TrueFalse } from './games/Part2TrueFalse';
import { Part3DragDrop } from './games/Part3DragDrop';
import { Part4FillBlank } from './games/Part4FillBlank';
import { gradeSubmission } from '../utils/storage';
import { sounds } from '../utils/soundEffects';

interface ExamRunnerProps {
  exam: ExamPackage;
  student: StudentInfo;
  onFinish: (result: ExamResult) => void;
  onExit: () => void;
}

export function ExamRunner({ exam, student, onFinish, onExit }: ExamRunnerProps) {
  const [activeTab, setActiveTab] = useState<'part1' | 'part2' | 'part3' | 'part4'>('part1');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.durationMinutes * 60);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Student Answers State
  const [submission, setSubmission] = useState<StudentAnswerSubmission>({
    part1_mcq: {},
    part2_tf: {},
    part3_drag: {},
    part4_fill: {},
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Answer change handlers
  const handlePart1Answer = (questionId: string, optionId: string) => {
    setSubmission(prev => ({
      ...prev,
      part1_mcq: { ...prev.part1_mcq, [questionId]: optionId },
    }));
  };

  const handlePart2Answer = (questionId: string, statementId: string, value: boolean) => {
    setSubmission(prev => ({
      ...prev,
      part2_tf: {
        ...prev.part2_tf,
        [questionId]: {
          ...(prev.part2_tf[questionId] || {}),
          [statementId]: value,
        },
      },
    }));
  };

  const handlePart3Answer = (questionId: string, leftId: string, rightText: string) => {
    setSubmission(prev => {
      const qMatches = { ...(prev.part3_drag[questionId] || {}) };
      if (!rightText) {
        delete qMatches[leftId];
      } else {
        qMatches[leftId] = rightText;
      }
      return {
        ...prev,
        part3_drag: {
          ...prev.part3_drag,
          [questionId]: qMatches,
        },
      };
    });
  };

  const handlePart3Clear = (questionId: string) => {
    setSubmission(prev => {
      const updated = { ...prev.part3_drag };
      delete updated[questionId];
      return { ...prev, part3_drag: updated };
    });
  };

  const handlePart4Answer = (questionId: string, blankKey: string, text: string) => {
    setSubmission(prev => ({
      ...prev,
      part4_fill: {
        ...prev.part4_fill,
        [questionId]: {
          ...(prev.part4_fill[questionId] || {}),
          [blankKey]: text,
        },
      },
    }));
  };

  // Completion calculations
  const p1Total: number = exam.questions.part1_mcq.length;
  const p1Done: number = Object.keys(submission.part1_mcq).length;

  const p2Total: number = exam.questions.part2_tf.reduce((acc: number, q) => acc + q.statements.length, 0);
  const p2Done: number = (Object.values(submission.part2_tf) as Record<string, boolean>[]).reduce(
    (acc: number, obj) => acc + Object.keys(obj || {}).length,
    0
  );

  const p3Total: number = exam.questions.part3_drag.reduce((acc: number, q) => acc + q.pairs.length, 0);
  const p3Done: number = (Object.values(submission.part3_drag) as Record<string, string>[]).reduce(
    (acc: number, obj) => acc + Object.keys(obj || {}).length,
    0
  );

  const p4Total: number = exam.questions.part4_fill.reduce((acc: number, q) => acc + q.blanks.length, 0);
  const p4Done: number = (Object.values(submission.part4_fill) as Record<string, string>[]).reduce(
    (acc: number, obj) =>
      acc + Object.values(obj || {}).filter(v => typeof v === 'string' && v.trim().length > 0).length,
    0
  );

  const totalTasks: number = p1Total + p2Total + p3Total + p4Total;
  const totalTasksDone: number = p1Done + p2Done + p3Done + p4Done;
  const overallPercentage: number = totalTasks > 0 ? Math.round((totalTasksDone / totalTasks) * 100) : 0;

  const handleSubmit = (force = false) => {
    sounds.playCompleteFanfare();
    const result = gradeSubmission(exam, student, submission, timeSpentSeconds);
    onFinish(result);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeftSeconds < 120;

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Sticky Test Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Exit button & Exam Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirm('Em có chắc chắn muốn thoát bài kiểm tra không? Bài làm hiện tại sẽ không được lưu.')) {
                  onExit();
                }
              }}
              className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Thoát bài kiểm tra"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
                {exam.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">HS: {student.fullName}</span>
                <span>•</span>
                <span>Lớp: <strong className="text-slate-700">{student.className}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Timer & Submit Button */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-mono text-sm font-bold border transition-colors ${
                isLowTime
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-600' : 'text-slate-600'}`} />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowSubmitConfirm(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Bento Navigation Tabs between 4 Games */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('part1');
            }}
            className={`p-4 rounded-3xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-xs ${
              activeTab === 'part1'
                ? 'border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                : 'border-blue-100 bg-blue-50/80 hover:bg-blue-100/80 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center ${
                activeTab === 'part1' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
              }`}>
                1
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                activeTab === 'part1' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {p1Done}/{p1Total}
              </span>
            </div>
            <div>
              <p className={`text-xs sm:text-sm font-bold ${activeTab === 'part1' ? 'text-white' : 'text-slate-800'}`}>
                Trò 1: Trắc nghiệm
              </p>
              <p className={`text-[11px] ${activeTab === 'part1' ? 'text-blue-100' : 'text-slate-500'} line-clamp-1`}>
                Nhiều lựa chọn
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('part2');
            }}
            className={`p-4 rounded-3xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-xs ${
              activeTab === 'part2'
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300'
                : 'border-emerald-100 bg-emerald-50/80 hover:bg-emerald-100/80 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center ${
                activeTab === 'part2' ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'
              }`}>
                2
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                activeTab === 'part2' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {p2Done}/{p2Total}
              </span>
            </div>
            <div>
              <p className={`text-xs sm:text-sm font-bold ${activeTab === 'part2' ? 'text-white' : 'text-slate-800'}`}>
                Trò 2: Đúng / Sai
              </p>
              <p className={`text-[11px] ${activeTab === 'part2' ? 'text-emerald-100' : 'text-slate-500'} line-clamp-1`}>
                Chuẩn GDPT 2018
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('part3');
            }}
            className={`p-4 rounded-3xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-xs ${
              activeTab === 'part3'
                ? 'border-amber-500 bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                : 'border-amber-100 bg-amber-50/80 hover:bg-amber-100/80 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center ${
                activeTab === 'part3' ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'
              }`}>
                3
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                activeTab === 'part3' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {p3Done}/{p3Total}
              </span>
            </div>
            <div>
              <p className={`text-xs sm:text-sm font-bold ${activeTab === 'part3' ? 'text-white' : 'text-slate-800'}`}>
                Trò 3: Kéo thả
              </p>
              <p className={`text-[11px] ${activeTab === 'part3' ? 'text-amber-100' : 'text-slate-500'} line-clamp-1`}>
                Ghép nối thẻ
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('part4');
            }}
            className={`p-4 rounded-3xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-xs ${
              activeTab === 'part4'
                ? 'border-rose-500 bg-rose-500 text-white shadow-md ring-2 ring-rose-300'
                : 'border-rose-100 bg-rose-50/80 hover:bg-rose-100/80 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center ${
                activeTab === 'part4' ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
              }`}>
                4
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                activeTab === 'part4' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                {p4Done}/{p4Total}
              </span>
            </div>
            <div>
              <p className={`text-xs sm:text-sm font-bold ${activeTab === 'part4' ? 'text-white' : 'text-slate-800'}`}>
                Trò 4: Điền khuyết
              </p>
              <p className={`text-[11px] ${activeTab === 'part4' ? 'text-rose-100' : 'text-slate-500'} line-clamp-1`}>
                Hoàn thành đoạn văn
              </p>
            </div>
          </button>
        </div>

        {/* Active Game Stage View */}
        <div className="transition-all">
          {activeTab === 'part1' && (
            <Part1MultipleChoice
              questions={exam.questions.part1_mcq}
              answers={submission.part1_mcq}
              onSelectAnswer={handlePart1Answer}
            />
          )}

          {activeTab === 'part2' && (
            <Part2TrueFalse
              questions={exam.questions.part2_tf}
              answers={submission.part2_tf}
              onSetAnswer={handlePart2Answer}
            />
          )}

          {activeTab === 'part3' && (
            <Part3DragDrop
              questions={exam.questions.part3_drag}
              answers={submission.part3_drag}
              onSetPairMatch={handlePart3Answer}
              onClearQuestionMatches={handlePart3Clear}
            />
          )}

          {activeTab === 'part4' && (
            <Part4FillBlank
              questions={exam.questions.part4_fill}
              answers={submission.part4_fill}
              onSetBlankAnswer={handlePart4Answer}
            />
          )}
        </div>

        {/* Bottom Pagination / Next Part Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
          <button
            type="button"
            disabled={activeTab === 'part1'}
            onClick={() => {
              sounds.playClick();
              if (activeTab === 'part4') setActiveTab('part3');
              else if (activeTab === 'part3') setActiveTab('part2');
              else if (activeTab === 'part2') setActiveTab('part1');
            }}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ← Phần trước
          </button>

          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Tiến độ hoàn thành: <strong className="text-blue-600">{overallPercentage}%</strong>
          </span>

          {activeTab !== 'part4' ? (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                if (activeTab === 'part1') setActiveTab('part2');
                else if (activeTab === 'part2') setActiveTab('part3');
                else if (activeTab === 'part3') setActiveTab('part4');
              }}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              Phần tiếp theo →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md transition-colors cursor-pointer"
            >
              Hoàn thành & Nộp bài ✓
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Xác nhận nộp bài?</h3>
                <p className="text-xs text-slate-500">
                  Hệ thống sẽ chấm điểm tự động và lưu kết quả vào sổ theo dõi của giáo viên.
                </p>
              </div>
            </div>

            {/* Checklist of parts */}
            <div className="space-y-2.5 bg-slate-50 p-5 rounded-2xl border border-slate-200/70 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Trò 1 (Trắc nghiệm nhiều lựa chọn):</span>
                <span className={`font-bold ${p1Done === p1Total ? 'text-blue-700' : 'text-amber-600'}`}>
                  {p1Done}/{p1Total} câu
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Trò 2 (Trắc nghiệm Đúng/Sai):</span>
                <span className={`font-bold ${p2Done === p2Total ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {p2Done}/{p2Total} ý
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Trò 3 (Kéo thả ghép nối):</span>
                <span className={`font-bold ${p3Done === p3Total ? 'text-amber-700' : 'text-amber-600'}`}>
                  {p3Done}/{p3Total} cặp
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Trò 4 (Điền khuyết đoạn văn):</span>
                <span className={`font-bold ${p4Done === p4Total ? 'text-rose-700' : 'text-amber-600'}`}>
                  {p4Done}/{p4Total} ô
                </span>
              </div>

              {totalTasksDone < totalTasks && (
                <p className="text-amber-700 font-bold pt-2 border-t border-slate-200">
                  ⚠️ Em còn {totalTasks - totalTasksDone} câu/ý chưa hoàn thành.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
              >
                Tiếp tục làm bài
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Đồng ý nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
