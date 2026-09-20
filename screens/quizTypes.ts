export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export const QUESTION_TYPES: { key: QuestionType; label: string }[] = [
  { key: "multiple_choice", label: "Multiple Choice" },
  { key: "true_false", label: "True or False" },
  { key: "short_answer", label: "Short Answer" },
];


export type QuizQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[]; 
  correctIndex: number; 
  trueFalseAnswer: boolean;
  shortAnswer: string; 
};

let idCounter = 0;
export const newQuestionId = () => `q${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export function createBlankQuestion(type: QuestionType = "multiple_choice"): QuizQuestion {
  return {
    id: newQuestionId(),
    type,
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    trueFalseAnswer: true,
    shortAnswer: "",
  };
}

export function isQuestionComplete(q: QuizQuestion): boolean {
  if (q.prompt.trim().length === 0) return false;
  if (q.type === "multiple_choice") return q.options.every((o) => o.trim().length > 0);
  if (q.type === "short_answer") return q.shortAnswer.trim().length > 0;
  return true; 
}

const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ");

export function isAnswerCorrect(q: QuizQuestion, answer: string | undefined): boolean {
  if (answer === undefined) return false;
  if (q.type === "multiple_choice") return answer === String(q.correctIndex);
  if (q.type === "true_false") return answer === String(q.trueFalseAnswer);
  return normalize(answer) === normalize(q.shortAnswer);
}