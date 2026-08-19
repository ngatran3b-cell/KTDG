import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory store initialized with samples (synchronized with frontend storage)
  let storedResults: any[] = [];
  let customExams: any[] = [];

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Results API
  app.get('/api/results', (req, res) => {
    res.json({ results: storedResults });
  });

  app.post('/api/results', (req, res) => {
    try {
      const result = req.body;
      if (!result || !result.student || !result.examId) {
        return res.status(400).json({ error: 'Dữ liệu kết quả không hợp lệ' });
      }
      
      // Update or prepend result
      const existingIdx = storedResults.findIndex(r => r.id === result.id);
      if (existingIdx >= 0) {
        storedResults[existingIdx] = result;
      } else {
        storedResults.unshift(result);
      }

      res.status(201).json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/results/:id', (req, res) => {
    const { id } = req.params;
    storedResults = storedResults.filter(r => r.id !== id);
    res.json({ success: true, message: 'Đã xóa kết quả' });
  });

  app.delete('/api/results', (req, res) => {
    storedResults = [];
    res.json({ success: true, message: 'Đã xóa toàn bộ kết quả' });
  });

  // Custom exams API
  app.get('/api/custom-exams', (req, res) => {
    res.json({ exams: customExams });
  });

  app.post('/api/custom-exams', (req, res) => {
    const exam = req.body;
    if (!exam || !exam.id || !exam.title) {
      return res.status(400).json({ error: 'Đề bài không hợp lệ' });
    }
    const idx = customExams.findIndex(e => e.id === exam.id);
    if (idx >= 0) {
      customExams[idx] = exam;
    } else {
      customExams.unshift(exam);
    }
    res.status(201).json({ success: true, exam });
  });

  app.delete('/api/custom-exams/:id', (req, res) => {
    const { id } = req.params;
    customExams = customExams.filter(e => e.id !== id);
    res.json({ success: true });
  });

  // AI Exam Generator using Gemini API
  app.post('/api/generate-exam', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'Chưa cấu hình GEMINI_API_KEY trong hệ thống.',
        });
      }

      const { subject, grade, topic, durationMinutes = 15 } = req.body;

      if (!subject || !grade || !topic) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ: Môn học, Khối lớp và Chủ đề/Bài học.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Bạn là chuyên gia khảo thí và giáo viên THCS giàu kinh nghiệm của Bộ Giáo dục và Đào tạo Việt Nam.
Hãy biên soạn một đề kiểm tra đánh giá thường xuyên chất lượng cao, đúng chuẩn chương trình GDPT 2018 cho:
- Môn học: ${subject}
- Khối lớp: Lớp ${grade}
- Chủ đề/Bài học: "${topic}"
- Thời lượng: ${durationMinutes} phút

Đề thi BẮT BUỘC phải bao gồm đầy đủ 4 dạng trò chơi/hình thức kiểm tra tương tác sau:
1. "part1_mcq" (Trò 1: Trắc nghiệm khách quan nhiều lựa chọn): gồm 3-4 câu hỏi, mỗi câu 4 phương án (opt_a, opt_b, opt_c, opt_d), 1 đáp án đúng, kèm lời giải thích chi tiết.
2. "part2_tf" (Trò 2: Trắc nghiệm khách quan Đúng/Sai): gồm 1 câu lớn chứa 4 mệnh đề khẳng định (st_1, st_2, st_3, st_4) để học sinh xác định Đúng (true) hoặc Sai (false).
3. "part3_drag" (Trò 3: Kéo thả nội dung / Ghép nối): gồm 1 câu hỏi với 4 cặp ghép (leftItem: khái niệm/công thức/từ khóa, rightItem: định nghĩa/ý nghĩa/kết quả tương ứng).
4. "part4_fill" (Trò 4: Điền khuyết): gồm 1 đoạn văn bản có 3 chỗ trống đánh dấu dạng {{blank_1}}, {{blank_2}}, {{blank_3}}, cung cấp danh sách đáp án chấp nhận được cho mỗi blank và một wordBank (ngân hàng từ gợi ý).

Yêu cầu ngôn ngữ: Tiếng Việt chuẩn mực sư phạm (với môn Tiếng Anh thì câu hỏi và nội dung bằng tiếng Anh).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Tiêu đề bài kiểm tra' },
              description: { type: Type.STRING, description: 'Mô tả ngắn về nội dung và mục tiêu đánh giá' },
              questions: {
                type: Type.OBJECT,
                properties: {
                  part1_mcq: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['multiple-choice'] },
                        prompt: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              text: { type: Type.STRING },
                            },
                            required: ['id', 'text'],
                          },
                        },
                        correctOptionId: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        points: { type: Type.NUMBER },
                      },
                      required: ['id', 'type', 'prompt', 'options', 'correctOptionId', 'explanation', 'points'],
                    },
                  },
                  part2_tf: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['true-false'] },
                        prompt: { type: Type.STRING },
                        statements: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              statement: { type: Type.STRING },
                              isCorrect: { type: Type.BOOLEAN },
                              explanation: { type: Type.STRING },
                            },
                            required: ['id', 'statement', 'isCorrect'],
                          },
                        },
                        points: { type: Type.NUMBER },
                      },
                      required: ['id', 'type', 'prompt', 'statements', 'points'],
                    },
                  },
                  part3_drag: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['drag-drop-matching'] },
                        prompt: { type: Type.STRING },
                        instruction: { type: Type.STRING },
                        pairs: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              leftItem: { type: Type.STRING },
                              rightItem: { type: Type.STRING },
                            },
                            required: ['id', 'leftItem', 'rightItem'],
                          },
                        },
                        points: { type: Type.NUMBER },
                      },
                      required: ['id', 'type', 'prompt', 'pairs', 'points'],
                    },
                  },
                  part4_fill: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['fill-in-blank'] },
                        prompt: { type: Type.STRING },
                        instruction: { type: Type.STRING },
                        templateText: { type: Type.STRING },
                        blanks: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              key: { type: Type.STRING },
                              placeholder: { type: Type.STRING },
                              correctAnswers: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                              hint: { type: Type.STRING },
                            },
                            required: ['key', 'correctAnswers'],
                          },
                        },
                        wordBank: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        points: { type: Type.NUMBER },
                        explanation: { type: Type.STRING },
                      },
                      required: ['id', 'type', 'prompt', 'templateText', 'blanks', 'points'],
                    },
                  },
                },
                required: ['part1_mcq', 'part2_tf', 'part3_drag', 'part4_fill'],
              },
            },
            required: ['title', 'description', 'questions'],
          },
        },
      });

      const jsonText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(jsonText);

      const newExam = {
        id: `exam_ai_${Date.now()}`,
        title: parsedData.title || `Kiểm tra ${subject} ${grade} - ${topic}`,
        subject: subject,
        grade: grade,
        durationMinutes: Number(durationMinutes) || 15,
        totalPoints: 10,
        description: parsedData.description || `Đề kiểm tra thường xuyên môn ${subject} khối ${grade}`,
        isOfficial: false,
        createdAt: new Date().toISOString(),
        createdBy: 'AI Trợ lý Giáo viên (Gemini)',
        questions: parsedData.questions,
      };

      // Add to custom exams list
      customExams.unshift(newExam);

      res.json({ success: true, exam: newExam });
    } catch (error: any) {
      console.error('Error generating exam:', error);
      res.status(500).json({ error: error.message || 'Lỗi tạo đề thi bằng AI' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduTHCS Assessment server running on port ${PORT}`);
  });
}

startServer();
