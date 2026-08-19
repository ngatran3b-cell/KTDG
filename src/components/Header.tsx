import { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  Sparkles,
  BookCheck,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import { StudentInfo } from '../types';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  currentView: 'student_home' | 'exam_running' | 'exam_result' | 'teacher_dashboard';
  student: StudentInfo | null;
  onSwitchView: (view: 'student_home' | 'teacher_dashboard') => void;
  onOpenStudentModal: () => void;
  onLogoutStudent: () => void;
}

export function Header({
  currentView,
  student,
  onSwitchView,
  onOpenStudentModal,
  onLogoutStudent,
}: HeaderProps) {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const toggleSound = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
    if (!next) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-100/90 backdrop-blur-md pt-3 pb-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => {
            if (currentView !== 'exam_running') {
              onSwitchView('student_home');
            }
          }}
          className="flex items-center gap-3.5 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20 transition-transform group-hover:scale-105">
            TH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-800 uppercase tracking-tight">
                Hệ Thống Kiểm Tra Thường Xuyên
              </h1>
              <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-700">
                THCS GDPT 2018
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Cổng thông tin khảo thí & đánh giá trực tuyến 4 trò chơi
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Student Status Badge / Login */}
          {student ? (
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-3.5 rounded-full border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border-2 border-white shadow-xs flex items-center justify-center text-white font-bold text-xs">
                {student.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs text-left">
                <p className="font-bold text-slate-700 truncate max-w-[120px] sm:max-w-[150px]">
                  {student.fullName}
                </p>
                <p className="text-[11px] text-slate-500">
                  Lớp: <span className="font-semibold text-blue-700">{student.className}</span> {student.studentCode ? `• Mã: ${student.studentCode}` : ''}
                </p>
              </div>
              {currentView !== 'exam_running' && (
                <button
                  type="button"
                  onClick={onLogoutStudent}
                  title="Đổi thông tin học sinh"
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-full hover:bg-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            currentView !== 'exam_running' && (
              <button
                type="button"
                onClick={onOpenStudentModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Điền thông tin HS</span>
              </button>
            )
          )}

          {/* View Switcher (Student vs Teacher) */}
          {currentView !== 'exam_running' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSwitchView('student_home');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'student_home' || currentView === 'exam_result'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Học sinh</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSwitchView('teacher_dashboard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'teacher_dashboard'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Giáo viên</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
