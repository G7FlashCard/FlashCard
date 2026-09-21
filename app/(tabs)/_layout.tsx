import type { ComponentProps } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTotalUnread } from "../../screens/chatStore";
import { colors } from "../../screens/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: "home", title: "Home", icon: "home-outline", iconActive: "home" },
  { name: "decks", title: "Decks", icon: "albums-outline", iconActive: "albums" },
  { name: "timeline", title: "Timeline", icon: "stats-chart-outline", iconActive: "stats-chart" },
  { name: "friends", title: "Friends", icon: "people-outline", iconActive: "people" },
  { name: "messages", title: "Messages", icon: "chatbubble-ellipses-outline", iconActive: "chatbubble-ellipses" },
  { name: "profile", title: "Profile", icon: "person-outline", iconActive: "person" },
];

export default function TabsLayout() {
  // Unread messages (from chats that aren't muted) shown on the Messages tab.
  const unread = useTotalUnread();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarBadgeStyle: { backgroundColor: colors.primary, color: "#FFFFFF", fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarBadge: tab.name === "messages" && unread > 0 ? unread : undefined,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}