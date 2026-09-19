// app/deck/[id]/add-card.tsx
import { useLocalSearchParams } from "expo-router";

import AddCardManualScreen from "../../../screens/AddCardManualScreen";

export default function AddCardRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AddCardManualScreen deckId={id} />;
}