import { createBlankQuestion } from "./quizTypes";
import type { QuestionType, QuizQuestion } from "./quizTypes";

export type FileKind = "document" | "pdf" | "presentation";

export type PickedFile = {
  kind: FileKind;
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
};

type GenerateOptions = {
  count: number;
  types: QuestionType[];
};

export async function generateQuestionsFromFile(
  file: PickedFile,
  { count, types }: GenerateOptions
): Promise<QuizQuestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500)); 

  const topic = file.name.replace(/\.[^.]+$/, "");
  const pool: QuestionType[] = types.length > 0 ? types : ["multiple_choice"];
  const total = Math.min(Math.max(count, 1), 20);

  return Array.from({ length: total }, (_, i) => {
    const type = pool[i % pool.length];
    const question = createBlankQuestion(type);
    question.prompt = `Sample question ${i + 1} from "${topic}"`;

    if (type === "multiple_choice") {
      question.options = ["Sample answer A", "Sample answer B", "Sample answer C", "Sample answer D"];
      question.correctIndex = 0;
    } else if (type === "true_false") {
      question.trueFalseAnswer = true;
    } else {
      question.shortAnswer = "Sample answer";
    }
    return question;
  });
}