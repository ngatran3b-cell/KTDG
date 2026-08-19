import React, { useState } from 'react';
import { UserCheck, School, Sparkles, X, ArrowRight, User } from 'lucide-react';
import { StudentInfo } from '../types';
import { sounds } from '../utils/soundEffects';

interface StudentAuthModalProps {
  isOpen: boolean;
  initialData?: StudentInfo | null;
  onSave: (info: StudentInfo) => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

const COMMON_CLASSES = ['6A1', '6A2', '6A3', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2'];

export function StudentAuthModal({
  isOpen,
  initialData,
  onSave,
  onClose,
  isMandatory = false,
}: StudentAuthModalProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [className, setClassName] = useState(initialData?.className || '6A1');
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || 'THCS Lê Quý Đôn');
  const [studentCode, setStudentCode] = useState(initialData?.studentCode || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và tên của em.');
      return;
    }
    if (!className.trim()) {
      setError('Vui lòng chọn hoặc nhập Lớp học.');
      return;
    }

    sounds.playSuccess();
    onSave({
      fullName: fullName.trim(),
      className: className.trim().toUpperCase(),
      schoolName: schoolName.trim() || 'Trường THCS',
      studentCode: studentCode.trim() || `HS-${className.trim()}-${Math.floor(10 + Math.random() * 89)}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-3 shadow-md shadow-blue-600/30">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">Thông tin Học sinh THCS</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
            Điền thông tin để hệ thống ghi nhận kết quả và lưu vào sổ theo dõi của giáo viên
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="font-bold">Lưu ý:</span> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ví dụ: Nguyễn Văn An, Trần Thu Hà..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lớp học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Nhập lớp (VD: 6A1, 7A2, 8B, 9C)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium mb-2.5"
            />
            {/* Quick Class Selection Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CLASSES.map((cls) => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => setClassName(cls)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                    className.toUpperCase() === cls
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trường học (Tùy chọn)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <School className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="VD: THCS Chu Văn An, THCS Lê Quý Đôn..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-600/30 transition-all cursor-pointer text-sm"
            >
              <span>Xác nhận & Bắt đầu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
