export type SubjectId = 
  | 'toan'
  | 'khtn'
  | 'van'
  | 'su_dia'
  | 'tieng_anh'
  | 'tin_hoc'
  | 'gdcd';

export type GradeLevel = '6' | '7' | '8' | '9';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
}

// Format 1: Trắc nghiệm khách quan nhiều lựa chọn
export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  prompt: string;
  subPrompt?: string;
  image?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  points: number;
}

// Format 2: Trắc nghiệm khách quan Đúng/Sai
export interface TrueFalseStatement {
  id: string;
  statement: string;
  isCorrect: boolean; // true = Đúng, false = Sai
  explanation?: string;
}

export interface TrueFalseQuestion {
  id: string;
  type: 'true-false';
  prompt: string;
  context?: string; // Đoạn văn / ngữ cảnh nếu có
  statements: TrueFalseStatement[];
  points: number;
}

// Format 3: Kéo thả nội dung (Ghép đôi thẻ / Ghép khái niệm với định nghĩa)
export interface DragDropPair {
  id: string;
  leftItem: string;   // Khái niệm / Vế trái / Thẻ kéo
  rightItem: string;  // Định nghĩa / Vế phải / Hộp nhận
}

export interface DragDropQuestion {
  id: string;
  type: 'drag-drop-matching';
  prompt: string;
  instruction: string;
  pairs: DragDropPair[];
  points: number;
}

// Format 4: Điền khuyết
export interface FillBlankItem {
  id: string;
  correctAnswers: string[]; // Các đáp án được chấp nhận (hỗ trợ viết hoa/thường)
  hint?: string;
}

export interface FillBlankQuestion {
  id: string;
  type: 'fill-in-blank';
  prompt: string;
  instruction: string;
  // Văn bản có chứa placeholder như {{blank_1}}, {{blank_2}}
  templateText: string;
  blanks: {
    key: string;
    placeholder: string;
    correctAnswers: string[];
    hint?: string;
  }[];
  wordBank?: string[]; // Gợi ý ngân hàng từ để học sinh chọn hoặc tự gõ
  points: number;
  explanation: string;
}

export type ExamQuestion = 
  | MultipleChoiceQuestion 
  | TrueFalseQuestion 
  | DragDropQuestion 
  | FillBlankQuestion;

export interface ExamPackage {
  id: string;
  title: string;
  subject: SubjectId;
  grade: GradeLevel;
  durationMinutes: number;
  totalPoints: number;
  description: string;
  isOfficial?: boolean;
  createdAt: string;
  createdBy?: string;
  questions: {
    part1_mcq: MultipleChoiceQuestion[];    // Trò 1
    part2_tf: TrueFalseQuestion[];          // Trò 2
    part3_drag: DragDropQuestion[];         // Trò 3
    part4_fill: FillBlankQuestion[];        // Trò 4
  };
}

export interface StudentInfo {
  fullName: string;
  className: string;
  schoolName?: string;
  studentCode?: string;
}

export interface StudentAnswerSubmission {
  part1_mcq: Record<string, string>; // questionId -> selectedOptionId
  part2_tf: Record<string, Record<string, boolean>>; // questionId -> statementId -> userValue
  part3_drag: Record<string, Record<string, string>>; // questionId -> leftId -> rightId
  part4_fill: Record<string, Record<string, string>>; // questionId -> blankKey -> enteredText
}

export interface ExamResult {
  id: string;
  student: StudentInfo;
  examId: string;
  examTitle: string;
  subject: SubjectId;
  grade: GradeLevel;
  totalScore: number;
  maxScore: number;
  percentage: number;
  gradeClassification: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Cần cố gắng';
  submittedAt: string;
  timeSpentSeconds: number;
  partScores: {
    part1: { score: number; max: number; correctCount: number; totalCount: number };
    part2: { score: number; max: number; correctCount: number; totalCount: number };
    part3: { score: number; max: number; correctCount: number; totalCount: number };
    part4: { score: number; max: number; correctCount: number; totalCount: number };
  };
  details: {
    part1_mcq: {
      questionId: string;
      prompt: string;
      userAnswer: string;
      correctAnswer: string;
      userAnswerText: string;
      correctAnswerText: string;
      isCorrect: boolean;
      score: number;
      explanation: string;
    }[];
    part2_tf: {
      questionId: string;
      prompt: string;
      statements: {
        statementId: string;
        text: string;
        userValue?: boolean;
        correctValue: boolean;
        isCorrect: boolean;
      }[];
      score: number;
    }[];
    part3_drag: {
      questionId: string;
      prompt: string;
      matches: {
        leftId: string;
        leftText: string;
        userRightText: string;
        correctRightText: string;
        isCorrect: boolean;
      }[];
      score: number;
    }[];
    part4_fill: {
      questionId: string;
      prompt: string;
      blanks: {
        key: string;
        userAnswer: string;
        correctAnswers: string[];
        isCorrect: boolean;
      }[];
      score: number;
      explanation: string;
    }[];
  };
  feedback: string;
}
