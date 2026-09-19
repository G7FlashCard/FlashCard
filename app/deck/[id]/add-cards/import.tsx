// app/deck/[id]/add-cards/import.tsx
import { useLocalSearchParams } from "expo-router";

import ImportFromFileScreen from "../../../../screens/ImportFromFileScreen";

export default function ImportFromFileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ImportFromFileScreen deckId={id} />;
}