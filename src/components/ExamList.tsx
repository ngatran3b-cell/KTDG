import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  Layers, 
  Sparkles, 
  UserCheck, 
  Play, 
  HelpCircle,
  Award,
  CheckCircle2,
  Atom,
  Calculator,
  Compass,
  Languages,
  Laptop,
  ShieldCheck,
  Search
} from 'lucide-react';
import { ExamPackage, SubjectId, GradeLevel, StudentInfo } from '../types';
import { SUBJECTS } from '../data/defaultExams';
import { sounds } from '../utils/soundEffects';

interface ExamListProps {
  exams: ExamPackage[];
  student: StudentInfo | null;
  onSelectExam: (exam: ExamPackage) => void;
  onOpenStudentModal: () => void;
}

export function ExamList({
  exams,
  student,
  onSelectExam,
  onOpenStudentModal,
}: ExamListProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExams = useMemo(() => {
    return exams.filter(ex => {
      if (selectedSubject !== 'all' && ex.subject !== selectedSubject) {
        return false;
      }
      if (selectedGrade !== 'all' && ex.grade !== selectedGrade) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ex.title.toLowerCase().includes(q);
        const matchDesc = ex.description.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [exams, selectedSubject, selectedGrade, searchQuery]);

  const getSubjectIcon = (subId: SubjectId) => {
    switch (subId) {
      case 'khtn': return <Atom className="w-5 h-5" />;
      case 'toan': return <Calculator className="w-5 h-5" />;
      case 'van': return <BookOpen className="w-5 h-5" />;
      case 'su_dia': return <Compass className="w-5 h-5" />;
      case 'tieng_anh': return <Languages className="w-5 h-5" />;
      case 'tin_hoc': return <Laptop className="w-5 h-5" />;
      case 'gdcd': return <ShieldCheck className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getSubjectColor = (subId: SubjectId) => {
    switch (subId) {
      case 'khtn': return 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:border-emerald-400';
      case 'toan': return 'bg-blue-50 text-blue-700 border-blue-200 group-hover:border-blue-400';
      case 'van': return 'bg-amber-50 text-amber-800 border-amber-200 group-hover:border-amber-400';
      case 'su_dia': return 'bg-orange-50 text-orange-800 border-orange-200 group-hover:border-orange-400';
      case 'tieng_anh': return 'bg-purple-50 text-purple-700 border-purple-200 group-hover:border-purple-400';
      case 'tin_hoc': return 'bg-cyan-50 text-cyan-700 border-cyan-200 group-hover:border-cyan-400';
      case 'gdcd': return 'bg-rose-50 text-rose-700 border-rose-200 group-hover:border-rose-400';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Student Profile Card if logged in / Prompt if not */}
      {!student ? (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm border border-blue-500 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold tracking-wide uppercase text-blue-100">
              Cổng Khảo Thí THCS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Kiểm Tra & Đánh Giá Thường Xuyên
            </h2>
            <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
              Điền Họ tên và Lớp để bắt đầu làm bài thi trực tuyến với 4 dạng thức trò chơi tương tác chuẩn GDPT 2018.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenStudentModal();
            }}
            className="px-6 py-3.5 bg-white text-blue-900 hover:bg-slate-50 font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2.5 shrink-0 cursor-pointer text-sm"
          >
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Điền thông tin học sinh</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">
                  {student.fullName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                  Lớp {student.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {student.schoolName || 'Trường THCS'} • Sẵn sàng làm bài kiểm tra
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenStudentModal}
            className="text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Đổi thông tin
          </button>
        </div>
      )}

      {/* 4 Bento Game Structure Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-blue-200 text-blue-700 text-xs font-bold rounded-lg uppercase tracking-tight">
              Trò 1: Trắc nghiệm
            </span>
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Nhiều lựa chọn (MCQ)</h4>
            <p className="text-xs text-slate-600 mt-1">4 phương án A, B, C, D</p>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-emerald-200 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-tight">
              Trò 2: Đúng / Sai
            </span>
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Nhận định Đúng / Sai</h4>
            <p className="text-xs text-slate-600 mt-1">Định dạng GDPT 2018</p>
          </div>
        </div>

        <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-amber-200 text-amber-700 text-xs font-bold rounded-lg uppercase tracking-tight">
              Trò 3: Kéo thả
            </span>
            <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Ghép nối khái niệm</h4>
            <p className="text-xs text-slate-600 mt-1">Kéo thả thẻ & Bấm ghép đôi</p>
          </div>
        </div>

        <div className="bg-rose-50 rounded-3xl p-5 border border-rose-100 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-rose-200 text-rose-700 text-xs font-bold rounded-lg uppercase tracking-tight">
              Trò 4: Điền khuyết
            </span>
            <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Hoàn thành đoạn văn</h4>
            <p className="text-xs text-slate-600 mt-1">Ô nhập & Ngân hàng từ gợi ý</p>
          </div>
        </div>
      </div>

      {/* Filter and Selection Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Subject Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedSubject('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả môn học
          </button>

          {SUBJECTS.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedSubject(sub.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {getSubjectIcon(sub.id)}
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>

        {/* Grade Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGrade === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả khối
            </button>
            {(['6', '7', '8', '9'] as GradeLevel[]).map(gr => (
              <button
                key={gr}
                type="button"
                onClick={() => setSelectedGrade(gr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGrade === gr ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khối {gr}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài kiểm tra, chủ đề..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bento Exam Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full inline-block"></span>
            Danh Sách Đề Kiểm Tra ({filteredExams.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Tự động chấm điểm & Lưu kết quả
          </span>
        </div>

        {filteredExams.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-2 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">Không tìm thấy bài kiểm tra nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map((exam) => {
              const subInfo = SUBJECTS.find(s => s.id === exam.subject);

              return (
                <div
                  key={exam.id}
                  className="group bg-white border border-slate-200 hover:border-blue-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-tight border ${getSubjectColor(exam.subject)}`}>
                          {subInfo?.shortName || exam.subject.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                          Lớp {exam.grade}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{exam.durationMinutes} phút</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                      {exam.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>

                    {/* 4 Games Inclusion Badges */}
                    <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        Trò 1: MCQ
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Trò 2: Đúng/Sai
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                        Trò 3: Kéo thả
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                        Trò 4: Điền khuyết
                      </span>
                    </div>
                  </div>

                  {/* Start Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      Thang điểm: 10đ
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        if (!student) {
                          onOpenStudentModal();
                        } else {
                          onSelectExam(exam);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Bắt đầu làm bài</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
