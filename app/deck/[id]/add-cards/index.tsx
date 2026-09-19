// app/deck/[id]/add-cards/index.tsx
import { useLocalSearchParams } from "expo-router";

import AddCardsOptionsScreen from "../../../../screens/AddCardsOptionsScreen";

export default function AddCardsIndexRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AddCardsOptionsScreen deckId={id} />;
}