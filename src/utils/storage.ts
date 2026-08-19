import { ExamPackage, ExamResult, StudentInfo, StudentAnswerSubmission } from '../types';
import { DEFAULT_EXAMS, INITIAL_STUDENT_RESULTS } from '../data/defaultExams';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'eduthcs_current_student',
  RESULTS: 'eduthcs_exam_results',
  CUSTOM_EXAMS: 'eduthcs_custom_exams',
  TEACHER_PIN: 'eduthcs_teacher_pin',
  ACTIVE_TAB: 'eduthcs_active_view',
};

export function getSavedStudent(): StudentInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStudent(student: StudentInfo) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
  } catch (e) {
    console.error('Failed to save student', e);
  }
}

export function clearStudent() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
  } catch {}
}

export function getAllExams(): ExamPackage[] {
  let custom: ExamPackage[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXAMS);
    if (raw) custom = JSON.parse(raw);
  } catch {}
  return [...DEFAULT_EXAMS, ...custom];
}

export function saveCustomExam(exam: ExamPackage) {
  try {
    const current = getAllExams().filter(e => !DEFAULT_EXAMS.some(d => d.id === e.id));
    const updated = [exam, ...current.filter(e => e.id !== exam.id)];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXAMS, JSON.stringify(updated));

    // Also sync to server if available
    fetch('/api/custom-exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save custom exam', e);
  }
}

export function deleteCustomExam(examId: string) {
  try {
    const current = getAllExams().filter(e => !DEFAULT_EXAMS.some(d => d.id === e.id));
    const filtered = current.filter(e => e.id !== examId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXAMS, JSON.stringify(filtered));

    fetch(`/api/custom-exams/${examId}`, { method: 'DELETE' }).catch(() => {});
  } catch (e) {
    console.error('Failed to delete custom exam', e);
  }
}

export function getAllResults(): ExamResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  // Initialize with samples if empty
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(INITIAL_STUDENT_RESULTS));
  return INITIAL_STUDENT_RESULTS;
}

export function saveExamResult(result: ExamResult): ExamResult[] {
  try {
    const all = getAllResults();
    const updated = [result, ...all.filter(r => r.id !== result.id)];
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));

    // Also sync with server
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }).catch(() => {});

    return updated;
  } catch (e) {
    console.error('Failed to save exam result', e);
    return getAllResults();
  }
}

export function deleteExamResult(resultId: string): ExamResult[] {
  try {
    const all = getAllResults();
    const filtered = all.filter(r => r.id !== resultId);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(filtered));

    fetch(`/api/results/${resultId}`, { method: 'DELETE' }).catch(() => {});
    return filtered;
  } catch {
    return getAllResults();
  }
}

export function clearAllResults(): ExamResult[] {
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
    fetch('/api/results', { method: 'DELETE' }).catch(() => {});
  } catch {}
  return [];
}

// Grading & Evaluation Engine
export function gradeSubmission(
  exam: ExamPackage,
  student: StudentInfo,
  submission: StudentAnswerSubmission,
  timeSpentSeconds: number
): ExamResult {
  // 1. Evaluate Part 1 (MCQ)
  const part1Details: any[] = [];
  let part1Score = 0;
  let part1CorrectCount = 0;
  const part1Total = exam.questions.part1_mcq.length;
  const part1MaxScore = exam.questions.part1_mcq.reduce((acc, q) => acc + q.points, 0);

  exam.questions.part1_mcq.forEach(q => {
    const userSelected = submission.part1_mcq[q.id] || '';
    const isCorrect = userSelected === q.correctOptionId;
    const score = isCorrect ? q.points : 0;
    if (isCorrect) part1CorrectCount++;
    part1Score += score;

    const userOpt = q.options.find(o => o.id === userSelected);
    const correctOpt = q.options.find(o => o.id === q.correctOptionId);

    part1Details.push({
      questionId: q.id,
      prompt: q.prompt,
      userAnswer: userSelected,
      correctAnswer: q.correctOptionId,
      userAnswerText: userOpt ? userOpt.text : 'Chưa chọn',
      correctAnswerText: correctOpt ? correctOpt.text : '',
      isCorrect,
      score,
      explanation: q.explanation,
    });
  });

  // 2. Evaluate Part 2 (True/False)
  const part2Details: any[] = [];
  let part2Score = 0;
  let part2CorrectCount = 0;
  let part2TotalCount = 0;
  const part2MaxScore = exam.questions.part2_tf.reduce((acc, q) => acc + q.points, 0);

  exam.questions.part2_tf.forEach(q => {
    const userSubAnswers = submission.part2_tf[q.id] || {};
    const statementsResult: any[] = [];
    let qCorrectCount = 0;

    q.statements.forEach(st => {
      part2TotalCount++;
      const userVal = userSubAnswers[st.id];
      const isCorrect = userVal === st.isCorrect;
      if (isCorrect) {
        qCorrectCount++;
        part2CorrectCount++;
      }
      statementsResult.push({
        statementId: st.id,
        text: st.statement,
        userValue: userVal,
        correctValue: st.isCorrect,
        isCorrect,
      });
    });

    // Score proportional to correct statements
    const qScore = q.statements.length > 0 ? (qCorrectCount / q.statements.length) * q.points : 0;
    part2Score += qScore;

    part2Details.push({
      questionId: q.id,
      prompt: q.prompt,
      statements: statementsResult,
      score: Number(qScore.toFixed(2)),
    });
  });

  // 3. Evaluate Part 3 (Drag & Drop Matching)
  const part3Details: any[] = [];
  let part3Score = 0;
  let part3CorrectCount = 0;
  let part3TotalCount = 0;
  const part3MaxScore = exam.questions.part3_drag.reduce((acc, q) => acc + q.points, 0);

  exam.questions.part3_drag.forEach(q => {
    const userMatches = submission.part3_drag[q.id] || {};
    const matchesResult: any[] = [];
    let qCorrectPairs = 0;

    q.pairs.forEach(pair => {
      part3TotalCount++;
      const userMatchedRight = userMatches[pair.id] || '';
      const isCorrect = userMatchedRight.trim().toLowerCase() === pair.rightItem.trim().toLowerCase();
      if (isCorrect) {
        qCorrectPairs++;
        part3CorrectCount++;
      }
      matchesResult.push({
        leftId: pair.id,
        leftText: pair.leftItem,
        userRightText: userMatchedRight || 'Chưa ghép',
        correctRightText: pair.rightItem,
        isCorrect,
      });
    });

    const qScore = q.pairs.length > 0 ? (qCorrectPairs / q.pairs.length) * q.points : 0;
    part3Score += qScore;

    part3Details.push({
      questionId: q.id,
      prompt: q.prompt,
      matches: matchesResult,
      score: Number(qScore.toFixed(2)),
    });
  });

  // 4. Evaluate Part 4 (Fill in the blanks)
  const part4Details: any[] = [];
  let part4Score = 0;
  let part4CorrectCount = 0;
  let part4TotalCount = 0;
  const part4MaxScore = exam.questions.part4_fill.reduce((acc, q) => acc + q.points, 0);

  const normalizeStr = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

  exam.questions.part4_fill.forEach(q => {
    const userBlanks = submission.part4_fill[q.id] || {};
    const blanksResult: any[] = [];
    let qCorrectBlanks = 0;

    q.blanks.forEach(b => {
      part4TotalCount++;
      const userAns = userBlanks[b.key] || '';
      const normUser = normalizeStr(userAns);
      const isCorrect = b.correctAnswers.some(ans => normalizeStr(ans) === normUser);
      
      if (isCorrect) {
        qCorrectBlanks++;
        part4CorrectCount++;
      }

      blanksResult.push({
        key: b.key,
        userAnswer: userAns || '(Bỏ trống)',
        correctAnswers: b.correctAnswers,
        isCorrect,
      });
    });

    const qScore = q.blanks.length > 0 ? (qCorrectBlanks / q.blanks.length) * q.points : 0;
    part4Score += qScore;

    part4Details.push({
      questionId: q.id,
      prompt: q.prompt,
      blanks: blanksResult,
      score: Number(qScore.toFixed(2)),
      explanation: q.explanation,
    });
  });

  const totalCalculated = Number((part1Score + part2Score + part3Score + part4Score).toFixed(1));
  const maxPossible = exam.totalPoints || 10;
  const normalizedTotal = Math.min(maxPossible, totalCalculated);
  const percentage = Math.round((normalizedTotal / maxPossible) * 100);

  let gradeClassification: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Cần cố gắng' = 'Đạt';
  let feedback = '';

  if (percentage >= 90) {
    gradeClassification = 'Xuất sắc';
    feedback = 'Tuyệt vời! Em nắm bài rất sâu sắc, giải quyết xuất sắc tất cả 4 dạng bài tập.';
  } else if (percentage >= 80) {
    gradeClassification = 'Giỏi';
    feedback = 'Rất tốt! Em hiểu rõ nội dung trọng tâm và thao tác làm bài rất thuần thục.';
  } else if (percentage >= 65) {
    gradeClassification = 'Khá';
    feedback = 'Khá tốt! Em đã nắm được các ý chính, hãy rà soát kỹ lại những câu còn nhầm lẫn nhé.';
  } else if (percentage >= 50) {
    gradeClassification = 'Đạt';
    feedback = 'Em đã đạt chuẩn yêu cầu cần đạt. Cần ôn tập kỹ hơn các khái niệm cơ bản để nâng cao điểm số.';
  } else {
    gradeClassification = 'Cần cố gắng';
    feedback = 'Em cần dành thêm thời gian ôn tập lại lý thuyết và làm thêm các bài tập tự luyện.';
  }

  const result: ExamResult = {
    id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    student,
    examId: exam.id,
    examTitle: exam.title,
    subject: exam.subject,
    grade: exam.grade,
    totalScore: normalizedTotal,
    maxScore: maxPossible,
    percentage,
    gradeClassification,
    submittedAt: new Date().toISOString(),
    timeSpentSeconds,
    partScores: {
      part1: { score: Number(part1Score.toFixed(1)), max: part1MaxScore, correctCount: part1CorrectCount, totalCount: part1Total },
      part2: { score: Number(part2Score.toFixed(1)), max: part2MaxScore, correctCount: part2CorrectCount, totalCount: part2TotalCount },
      part3: { score: Number(part3Score.toFixed(1)), max: part3MaxScore, correctCount: part3CorrectCount, totalCount: part3TotalCount },
      part4: { score: Number(part4Score.toFixed(1)), max: part4MaxScore, correctCount: part4CorrectCount, totalCount: part4TotalCount },
    },
    details: {
      part1_mcq: part1Details,
      part2_tf: part2Details,
      part3_drag: part3Details,
      part4_fill: part4Details,
    },
    feedback,
  };

  return result;
}
