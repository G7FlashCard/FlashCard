// app/deck/[id]/study.tsx
import { useLocalSearchParams } from "expo-router";

import FlashcardStudyScreen from "../../../screens/FlashcardStudyScreen";

export default function StudyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FlashcardStudyScreen deckId={id} />;
}