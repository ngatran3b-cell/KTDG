import { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  FileSpreadsheet, 
  BookOpen, 
  Layers, 
  ArrowUpDown,
  Sparkles,
  BarChart3,
  Calendar,
  School
} from 'lucide-react';
import { ExamResult, ExamPackage, SubjectId, GradeLevel } from '../../types';
import { SUBJECTS } from '../../data/defaultExams';
import { CreateExamModal } from './CreateExamModal';
import { sounds } from '../../utils/soundEffects';

interface TeacherDashboardProps {
  results: ExamResult[];
  exams: ExamPackage[];
  onDeleteResult: (id: string) => void;
  onClearAllResults: () => void;
  onSaveNewExam: (exam: ExamPackage) => void;
  onDeleteExam: (id: string) => void;
  onPreviewExam: (exam: ExamPackage) => void;
}

export function TeacherDashboard({
  results,
  exams,
  onDeleteResult,
  onClearAllResults,
  onSaveNewExam,
  onDeleteExam,
  onPreviewExam,
}: TeacherDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'score_desc' | 'score_asc' | 'name_asc'>('date_desc');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState<ExamResult | null>(null);

  // Extract distinct class names
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    results.forEach(r => {
      if (r.student.className) set.add(r.student.className);
    });
    return Array.from(set).sort();
  }, [results]);

  // Filtered and Sorted Results
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      // Search by student name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.student.fullName.toLowerCase().includes(q);
        const matchesCode = (r.student.studentCode || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode) return false;
      }

      // Class filter
      if (selectedClass !== 'all' && r.student.className !== selectedClass) {
        return false;
      }

      // Subject filter
      if (selectedSubject !== 'all' && r.subject !== selectedSubject) {
        return false;
      }

      // Exam filter
      if (selectedExamId !== 'all' && r.examId !== selectedExamId) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortBy === 'score_desc') {
        return b.totalScore - a.totalScore;
      }
      if (sortBy === 'score_asc') {
        return a.totalScore - b.totalScore;
      }
      if (sortBy === 'name_asc') {
        return a.student.fullName.localeCompare(b.student.fullName, 'vi');
      }
      return 0;
    });
  }, [results, searchQuery, selectedClass, selectedSubject, selectedExamId, sortBy]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const count = filteredResults.length;
    if (count === 0) {
      return {
        count: 0,
        avgScore: 0,
        passRate: 0,
        excellentRate: 0,
        avgTimeMinutes: 0,
      };
    }

    const totalScore = filteredResults.reduce((acc, r) => acc + r.totalScore, 0);
    const passCount = filteredResults.filter(r => r.totalScore >= 5.0).length;
    const excellentCount = filteredResults.filter(r => r.totalScore >= 8.0).length;
    const totalTime = filteredResults.reduce((acc, r) => acc + r.timeSpentSeconds, 0);

    return {
      count,
      avgScore: Number((totalScore / count).toFixed(2)),
      passRate: Math.round((passCount / count) * 100),
      excellentRate: Math.round((excellentCount / count) * 100),
      avgTimeMinutes: Math.round(totalTime / count / 60),
    };
  }, [filteredResults]);

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredResults.length === 0) {
      alert('Không có dữ liệu bài làm để xuất file.');
      return;
    }

    const headers = [
      'STT',
      'Họ và tên học sinh',
      'Lớp',
      'Mã học sinh',
      'Đề kiểm tra',
      'Môn học',
      'Khối',
      'Tổng điểm (thang 10)',
      'Xếp loại',
      'Trò 1 (Trắc nghiệm)',
      'Trò 2 (Đúng/Sai)',
      'Trò 3 (Kéo thả)',
      'Trò 4 (Điền khuyết)',
      'Thời gian làm bài (giây)',
      'Thời điểm nộp',
      'Nhận xét',
    ];

    const rows = filteredResults.map((r, idx) => [
      idx + 1,
      `"${r.student.fullName}"`,
      `"${r.student.className}"`,
      `"${r.student.studentCode || ''}"`,
      `"${r.examTitle.replace(/"/g, '""')}"`,
      `"${r.subject}"`,
      `"Lớp ${r.grade}"`,
      r.totalScore,
      `"${r.gradeClassification}"`,
      r.partScores.part1.score,
      r.partScores.part2.score,
      r.partScores.part3.score,
      r.partScores.part4.score,
      r.timeSpentSeconds,
      `"${new Date(r.submittedAt).toLocaleString('vi-VN')}"`,
      `"${(r.feedback || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Diem_Danh_Gia_THCS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getClassificationBadge = (grade: string) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-xl text-xs font-bold tracking-wide uppercase text-blue-300">
              Cổng Quản Trị Khảo Thí
            </span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-xl">
              Chuẩn GDPT 2018
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sổ Theo Dõi Đánh Giá Thường Xuyên
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Hệ thống lưu trữ, phân tích kết quả 4 dạng thức kiểm tra tương tác theo từng học sinh, khối lớp và bộ môn THCS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đề Mới (AI / Thủ công)</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards (Bento Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt làm bài</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.count}</h3>
            <span className="text-[11px] text-slate-500 font-medium">học sinh đã nộp</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm trung bình</p>
            <h3 className="text-2xl font-black text-emerald-600">{stats.avgScore} <span className="text-xs text-slate-400 font-normal">/10</span></h3>
            <span className="text-[11px] text-emerald-700 font-bold">{stats.passRate}% đạt chuẩn</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ Khá / Giỏi</p>
            <h3 className="text-2xl font-black text-amber-600">{stats.excellentRate}%</h3>
            <span className="text-[11px] text-slate-500 font-medium">từ 8.0 trở lên</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian TB</p>
            <h3 className="text-2xl font-black text-rose-600">{stats.avgTimeMinutes} <span className="text-xs text-slate-400 font-normal">phút</span></h3>
            <span className="text-[11px] text-slate-500 font-medium">cho mỗi bài thi</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm học sinh theo họ tên hoặc mã học sinh..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            />
          </div>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Tất cả các lớp</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>Lớp {cls}</option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Tất cả môn học</option>
              {SUBJECTS.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="date_desc">Mới nộp gần đây</option>
              <option value="score_desc">Điểm cao nhất ↓</option>
              <option value="score_asc">Điểm thấp nhất ↑</option>
              <option value="name_asc">Họ tên A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              Danh sách kết quả ({filteredResults.length})
            </h3>
            {filteredResults.length !== results.length && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl font-bold">
                Đang lọc từ {results.length} bài
              </span>
            )}
          </div>

          {results.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ kết quả bài làm không?')) {
                  onClearAllResults();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-bold cursor-pointer"
            >
              Xóa tất cả kết quả
            </button>
          )}
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">Chưa có kết quả nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Học sinh</th>
                  <th className="px-4 py-3.5">Lớp</th>
                  <th className="px-5 py-3.5">Bài kiểm tra</th>
                  <th className="px-4 py-3.5 text-center">Tổng điểm</th>
                  <th className="px-3 py-3.5 text-center">Trò 1 (MCQ)</th>
                  <th className="px-3 py-3.5 text-center">Trò 2 (Đ/S)</th>
                  <th className="px-3 py-3.5 text-center">Trò 3 (Kéo)</th>
                  <th className="px-3 py-3.5 text-center">Trò 4 (Điền)</th>
                  <th className="px-4 py-3.5">Thời gian</th>
                  <th className="px-4 py-3.5 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Name */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{res.student.fullName}</div>
                      <span className="text-[11px] text-slate-400">{res.student.studentCode || 'HS-THCS'}</span>
                    </td>

                    {/* Class */}
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">
                        {res.student.className}
                      </span>
                    </td>

                    {/* Exam Title */}
                    <td className="px-5 py-4 max-w-[220px]">
                      <div className="font-semibold text-slate-800 line-clamp-1" title={res.examTitle}>
                        {res.examTitle}
                      </div>
                      <span className="text-[11px] text-blue-600 font-bold">
                        Môn {res.subject.toUpperCase()} (Lớp {res.grade})
                      </span>
                    </td>

                    {/* Total Score & Badge */}
                    <td className="px-4 py-4 text-center">
                      <div className="text-base font-black text-slate-900">{res.totalScore}đ</div>
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getClassificationBadge(res.gradeClassification)}`}>
                        {res.gradeClassification}
                      </span>
                    </td>

                    {/* Part Scores */}
                    <td className="px-3 py-4 text-center text-xs font-bold text-slate-700">
                      {res.partScores.part1.score}
                    </td>
                    <td className="px-3 py-4 text-center text-xs font-bold text-slate-700">
                      {res.partScores.part2.score}
                    </td>
                    <td className="px-3 py-4 text-center text-xs font-bold text-slate-700">
                      {res.partScores.part3.score}
                    </td>
                    <td className="px-3 py-4 text-center text-xs font-bold text-slate-700">
                      {res.partScores.part4.score}
                    </td>

                    {/* Date / Time */}
                    <td className="px-4 py-4 text-xs text-slate-500">
                      <div className="font-semibold">{new Date(res.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[11px] text-slate-400">{new Date(res.submittedAt).toLocaleDateString('vi-VN')}</div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-4 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setViewingResult(res);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                        title="Xem chi tiết bài làm"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xóa kết quả của học sinh ${res.student.fullName}?`)) {
                            onDeleteResult(res.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Xóa bài làm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bank of Exams Manager */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Ngân Hàng Đề Kiểm Tra ({exams.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-2xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm đề thi mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((ex) => (
            <div
              key={ex.id}
              className="p-5 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between gap-3 bg-slate-50/50 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-[11px] font-bold">
                    Lớp {ex.grade} • {ex.subject.toUpperCase()}
                  </span>
                  {ex.isOfficial && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-lg">
                      Chính thức
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm line-clamp-2 leading-snug">
                  {ex.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {ex.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">{ex.durationMinutes} phút • 10đ</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPreviewExam(ex)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors cursor-pointer shadow-xs"
                  >
                    Xem thử
                  </button>
                  {!ex.isOfficial && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Xóa đề thi "${ex.title}"?`)) {
                          onDeleteExam(ex.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa đề này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Exam Modal */}
      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveExam={(exam) => {
          onSaveNewExam(exam);
          setIsCreateModalOpen(false);
        }}
      />

      {/* Student Result Details Modal */}
      {viewingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">
                    {viewingResult.totalScore}/10 điểm
                  </span>
                  <span className="text-xs text-slate-300">
                    Lớp {viewingResult.student.className}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-1">{viewingResult.student.fullName}</h3>
                <p className="text-xs text-slate-400">{viewingResult.examTitle}</p>
              </div>

              <button
                onClick={() => setViewingResult(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Scores summary */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-800 block">Trò 1 (MCQ)</span>
                  <span className="text-base font-black text-slate-800">{viewingResult.partScores.part1.score}đ</span>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl">
                  <span className="text-[11px] font-bold text-sky-800 block">Trò 2 (Đ/S)</span>
                  <span className="text-base font-black text-slate-800">{viewingResult.partScores.part2.score}đ</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-800 block">Trò 3 (Kéo)</span>
                  <span className="text-base font-black text-slate-800">{viewingResult.partScores.part3.score}đ</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <span className="text-[11px] font-bold text-purple-800 block">Trò 4 (Điền)</span>
                  <span className="text-base font-black text-slate-800">{viewingResult.partScores.part4.score}đ</span>
                </div>
              </div>

              {/* Feedback */}
              {viewingResult.feedback && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs">
                  <strong>Nhận xét bài làm:</strong> {viewingResult.feedback}
                </div>
              )}

              {/* Question list review */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Chi tiết bài nộp của học sinh:</h4>
                
                {/* MCQ */}
                {viewingResult.details.part1_mcq?.map((m, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border text-xs ${m.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}`}>
                    <p className="font-semibold text-slate-800">Câu {idx + 1}: {m.prompt}</p>
                    <p className="mt-1 text-slate-600">Đã chọn: <strong className={m.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{m.userAnswerText}</strong></p>
                    {!m.isCorrect && <p className="text-emerald-700 font-medium">Đáp án đúng: {m.correctAnswerText}</p>}
                  </div>
                ))}

                {/* True False */}
                {viewingResult.details.part2_tf?.map((tf, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <p className="font-semibold text-slate-800">{tf.prompt}</p>
                    {tf.statements?.map(st => (
                      <div key={st.statementId} className="flex items-center justify-between text-[11px] border-b border-slate-200/50 pb-1">
                        <span className="text-slate-600">{st.text}</span>
                        <span className={`font-bold ${st.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {st.userValue ? 'Đúng' : 'Sai'} {st.isCorrect ? '✓' : `(Sai - Đ/A: ${st.correctValue ? 'Đúng' : 'Sai'})`}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingResult(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
