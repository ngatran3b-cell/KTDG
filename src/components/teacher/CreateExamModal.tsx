import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  X, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  FileCode2,
  Clock,
  Layers
} from 'lucide-react';
import { ExamPackage, SubjectId, GradeLevel } from '../../types';
import { SUBJECTS } from '../../data/defaultExams';
import { sounds } from '../../utils/soundEffects';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (exam: ExamPackage) => void;
}

export function CreateExamModal({ isOpen, onClose, onSaveExam }: CreateExamModalProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  
  // AI Form State
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('khtn');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('6');
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample quick topics for teachers to click
  const sampleTopics: Record<SubjectId, string[]> = {
    khtn: ['Tế bào và cơ thể đa bào', 'Nguyên tử và bảng tuần hoàn', 'Ánh sáng và phản xạ ánh sáng', 'Quang hợp và hô hấp ở thực vật'],
    toan: ['Tập hợp số hữu tỉ và các phép tính', 'Hai đường thẳng song song và đối đỉnh', 'Tam giác bằng nhau', 'Thống kê và biểu đồ'],
    van: ['Biện pháp tu từ: Nói quá, Nói giảm nói tránh', 'Đọc hiểu thơ lục bát và truyện ngắn', 'Thực hành Tiếng Việt: Trợ từ, Thán từ', 'Văn bản nghị luận xã hội'],
    su_dia: ['Văn minh sông Hồng và nước Văn Lang', 'Khí hậu và cảnh quan châu Á', 'Lịch sử Việt Nam thời Lý - Trần', 'Tài nguyên khoáng sản Việt Nam'],
    tieng_anh: ['Unit 1: Local Environment and Crafts', 'Unit 2: City Life & Phrasal Verbs', 'Grammar: Conditional Sentences', 'Vocabulary: Health and Fitness'],
    tin_hoc: ['Mạng máy tính và Internet an toàn', 'Thuật toán tìm kiếm và sắp xếp', 'Bảng tính Excel và hàm tính toán', 'Bản quyền số và ứng dụng CNTT'],
    gdcd: ['Tôn trọng sự thật và tự hào truyền thống', 'Phòng chống bạo lực học đường', 'Quyền và nghĩa vụ học tập của học sinh', 'Bảo vệ môi trường và tài nguyên'],
  };

  if (!isOpen) return null;

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage('Vui lòng nhập chủ đề hoặc bài học cần tạo đề.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          topic: topic.trim(),
          durationMinutes: Number(durationMinutes) || 15,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi tạo đề kiểm tra bằng AI.');
      }

      sounds.playSuccess();
      onSaveExam(data.exam);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Không thể tạo đề lúc này, vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Biên Soạn Đề Kiểm Tra Thường Xuyên</h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5 font-medium">
                Chuẩn cấu trúc 4 trò chơi tương tác theo chương trình GDPT 2018
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="font-semibold">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleGenerateAI} className="space-y-5">
            {/* Subject Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Môn học THCS
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SUBJECTS.map((sub) => (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      selectedSubject === sub.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{sub.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Level & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Khối lớp
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['6', '7', '8', '9'] as GradeLevel[]).map((gr) => (
                    <button
                      type="button"
                      key={gr}
                      onClick={() => setSelectedGrade(gr)}
                      className={`py-2.5 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                        selectedGrade === gr
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Lớp {gr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Thời lượng làm bài
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={10}>10 phút (Kiểm tra 15p rút gọn)</option>
                    <option value={15}>15 phút (Đánh giá thường xuyên)</option>
                    <option value={20}>20 phút (Ôn tập chủ đề)</option>
                    <option value={45}>45 phút (Kiểm tra giữa kỳ)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Chủ đề / Bài học / Yêu cầu cần đạt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Cấu tạo tế bào, Số hữu tỉ, Nói quá - Nói giảm nói tránh, Traditional Crafts..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
              />

              {/* Sample Topics Suggestions */}
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  💡 Gợi ý chủ đề nhanh môn {SUBJECTS.find(s => s.id === selectedSubject)?.name}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleTopics[selectedSubject]?.map((tp, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setTopic(tp)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      + {tp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Generation Notice */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-blue-950">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-blue-900">AI Trợ lý Khảo thí THCS:</strong>
                <p className="mt-0.5 leading-relaxed text-blue-800 font-medium">
                  Hệ thống tự động biên soạn chuẩn 4 phần: Trắc nghiệm 4 lựa chọn, Đúng/Sai chuẩn GDPT 2018, Kéo thả ghép nối cặp và Điền khuyết có đáp án giải thích.
                </p>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang biên soạn 4 dạng bài...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo Đề Thi Tự Động</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
