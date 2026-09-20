import type { QuizQuestion } from "./quizTypes";

export type ActiveQuiz = {
  title: string;
  deckTitle: string;
  questions: QuizQuestion[];
  randomize: boolean;
  showAnswers: boolean;
};

let activeQuiz: ActiveQuiz | null = null;

export const setActiveQuiz = (quiz: ActiveQuiz | null) => {
  activeQuiz = quiz;
};

export const getActiveQuiz = () => activeQuiz;