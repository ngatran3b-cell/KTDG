import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExamList } from './components/ExamList';
import { ExamRunner } from './components/ExamRunner';
import { StudentResultView } from './components/StudentResultView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentAuthModal } from './components/StudentAuthModal';
import { StudentInfo, ExamPackage, ExamResult } from './types';
import { 
  getSavedStudent, 
  saveStudent, 
  clearStudent, 
  getAllExams, 
  saveCustomExam, 
  deleteCustomExam, 
  getAllResults, 
  saveExamResult, 
  deleteExamResult, 
  clearAllResults 
} from './utils/storage';
import { sounds } from './utils/soundEffects';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<
    'student_home' | 'exam_running' | 'exam_result' | 'teacher_dashboard'
  >('student_home');

  // Student State
  const [student, setStudent] = useState<StudentInfo | null>(() => getSavedStudent());
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [pendingExamToStart, setPendingExamToStart] = useState<ExamPackage | null>(null);

  // Exams & Results State
  const [exams, setExams] = useState<ExamPackage[]>(() => getAllExams());
  const [results, setResults] = useState<ExamResult[]>(() => getAllResults());
  const [activeExam, setActiveExam] = useState<ExamPackage | null>(null);
  const [latestResult, setLatestResult] = useState<ExamResult | null>(null);

  // Sync results with server on mount
  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          setResults(data.results);
        }
      })
      .catch(() => {});

    fetch('/api/custom-exams')
      .then(res => res.json())
      .then(data => {
        if (data.exams && Array.isArray(data.exams)) {
          setExams(getAllExams());
        }
      })
      .catch(() => {});
  }, []);

  // Save student info handler
  const handleSaveStudent = (info: StudentInfo) => {
    saveStudent(info);
    setStudent(info);
    setIsStudentModalOpen(false);

    // If there was a pending exam waiting for student info, start it
    if (pendingExamToStart) {
      setActiveExam(pendingExamToStart);
      setPendingExamToStart(null);
      setCurrentView('exam_running');
    }
  };

  const handleLogoutStudent = () => {
    if (confirm('Em có muốn đổi thông tin học sinh khác không?')) {
      clearStudent();
      setStudent(null);
      setIsStudentModalOpen(true);
    }
  };

  // Exam lifecycle handlers
  const handleSelectExam = (exam: ExamPackage) => {
    if (!student) {
      setPendingExamToStart(exam);
      setIsStudentModalOpen(true);
      return;
    }
    setActiveExam(exam);
    setCurrentView('exam_running');
  };

  const handleFinishExam = (result: ExamResult) => {
    const updatedResults = saveExamResult(result);
    setResults(updatedResults);
    setLatestResult(result);
    setCurrentView('exam_result');
  };

  const handleRetakeExam = () => {
    if (activeExam) {
      setCurrentView('exam_running');
    } else if (latestResult) {
      const found = exams.find(e => e.id === latestResult.examId);
      if (found) {
        setActiveExam(found);
        setCurrentView('exam_running');
      } else {
        setCurrentView('student_home');
      }
    }
  };

  // Teacher actions
  const handleDeleteResult = (id: string) => {
    const updated = deleteExamResult(id);
    setResults(updated);
  };

  const handleClearAllResults = () => {
    const updated = clearAllResults();
    setResults(updated);
  };

  const handleSaveNewExam = (exam: ExamPackage) => {
    saveCustomExam(exam);
    setExams(getAllExams());
  };

  const handleDeleteExam = (examId: string) => {
    deleteCustomExam(examId);
    setExams(getAllExams());
  };

  const handlePreviewExam = (exam: ExamPackage) => {
    setActiveExam(exam);
    setCurrentView('exam_running');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        student={student}
        onSwitchView={(v) => setCurrentView(v)}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
        onLogoutStudent={handleLogoutStudent}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'student_home' && (
          <ExamList
            exams={exams}
            student={student}
            onSelectExam={handleSelectExam}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
          />
        )}

        {currentView === 'exam_running' && activeExam && (
          <ExamRunner
            exam={activeExam}
            student={student || { fullName: 'Học sinh', className: 'THCS' }}
            onFinish={handleFinishExam}
            onExit={() => setCurrentView('student_home')}
          />
        )}

        {currentView === 'exam_result' && latestResult && (
          <StudentResultView
            result={latestResult}
            onRetake={handleRetakeExam}
            onBackHome={() => setCurrentView('student_home')}
            onGoToTeacherDashboard={() => setCurrentView('teacher_dashboard')}
          />
        )}

        {currentView === 'teacher_dashboard' && (
          <TeacherDashboard
            results={results}
            exams={exams}
            onDeleteResult={handleDeleteResult}
            onClearAllResults={handleClearAllResults}
            onSaveNewExam={handleSaveNewExam}
            onDeleteExam={handleDeleteExam}
            onPreviewExam={handlePreviewExam}
          />
        )}
      </main>

      {/* Student Info Modal */}
      <StudentAuthModal
        isOpen={isStudentModalOpen}
        initialData={student}
        onSave={handleSaveStudent}
        onClose={() => {
          setIsStudentModalOpen(false);
          setPendingExamToStart(null);
        }}
        isMandatory={false}
      />

      {/* Footer */}
      {currentView !== 'exam_running' && (
        <footer className="mt-auto border-t border-slate-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">
              Hệ Thống Đánh Giá Thường Xuyên Học Sinh THCS - GDPT 2018
            </p>
            <p>
              Tích hợp 4 dạng thức tương tác: Trắc nghiệm khách quan, Đúng/Sai, Kéo thả ghép nối & Điền khuyết
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
