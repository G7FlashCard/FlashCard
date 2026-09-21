import { StyleSheet, Text, View } from "react-native";

import { colors } from "./theme";

const PALETTE = [
  { bg: colors.primarySoft, fg: colors.primary },
  { bg: "#DDF5E7", fg: "#22A559" },
  { bg: "#FDE7E7", fg: "#E5484D" },
  { bg: "#FEF3C7", fg: "#D97706" },
  { bg: "#EDE9FE", fg: "#8B5CF6" },
];

function paletteFor(name: string) {
  const index = name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[index];
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** Round initials avatar with an optional green "online" dot. */
export function Avatar({
  name,
  size = 48,
  online,
}: {
  name: string;
  size?: number;
  online?: boolean;
}) {
  const palette = paletteFor(name);
  const dot = Math.max(10, Math.round(size * 0.26));

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.bg },
      ]}
    >
      <Text style={{ fontSize: size * 0.34, fontWeight: "800", color: palette.fg }}>
        {initialsOf(name)}
      </Text>
      {online ? (
        <View
          style={[
            styles.dot,
            { width: dot, height: dot, borderRadius: dot / 2 },
          ]}
        />
      ) : null}
    </View>
  );
}

/** A cluster of up to three small avatars, for group chats. */
export function GroupAvatar({ names, size = 56 }: { names: string[]; size?: number }) {
  const d = Math.round(size * 0.58);
  const spots = [
    { left: 0, top: 0 },
    { right: 0, top: Math.round(size * 0.2) },
    { left: Math.round(size * 0.12), bottom: 0 },
  ];

  return (
    <View style={{ width: size, height: size }}>
      {names.slice(0, 3).map((name, i) => {
        const palette = paletteFor(name);
        return (
          <View
            key={name + i}
            style={[
              styles.circle,
              styles.groupCircle,
              spots[i],
              { width: d, height: d, borderRadius: d / 2, backgroundColor: palette.bg },
            ]}
          >
            <Text style={{ fontSize: d * 0.38, fontWeight: "800", color: palette.fg }}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  groupCircle: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.background,
  },
  dot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
});