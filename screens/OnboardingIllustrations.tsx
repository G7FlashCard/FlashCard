import React from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from './theme';

export type IllustrationProps = { size?: number };

/** Slide 1: person studying on a tablet, with a lightbulb and floating shapes. */
export function LearnIllustration({ size = 300 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      <Defs>
        <ClipPath id="learnClip">
          <Circle cx={150} cy={160} r={120} />
        </ClipPath>
      </Defs>

      <Circle cx={150} cy={160} r={120} fill={colors.primaryTint} />

      {/* Lightbulb */}
      <Circle cx={72} cy={82} r={18} fill={colors.primarySoft} stroke={colors.primary} strokeWidth={2.5} />
      <Rect x={65} y={99} width={14} height={8} rx={2} fill={colors.primary} />
      <Line x1={72} y1={52} x2={72} y2={58} stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={50} y1={61} x2={54} y2={66} stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={94} y1={61} x2={90} y2={66} stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" />

      {/* Floating shapes */}
      <Polygon points="246,95 238,109 222,109 214,95 222,81 238,81" fill={colors.primaryMid} />
      <Circle cx={252} cy={150} r={5} fill={colors.primaryMid} />
      <Circle cx={46} cy={150} r={4} fill={colors.primaryMid} />
      <Path
        d="M258 196 L258 212 M250 204 L266 204"
        stroke={colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Person, clipped to the circle so the torso sits inside it */}
      <G clipPath="url(#learnClip)">
        {/* Torso */}
        <Path
          d="M88 300 C88 235 108 205 140 205 C172 205 192 235 192 300 Z"
          fill={colors.navy}
        />
        {/* Arms (drawn before the tablet so the tablet overlaps them) */}
        <Path
          d="M104 228 C106 252 130 262 154 248"
          stroke={colors.navy}
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M176 228 C196 246 214 246 226 236"
          stroke={colors.navy}
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />
        {/* Tablet */}
        <G rotation={-8} origin="190, 225">
          <Rect x={152} y={198} width={76} height={54} rx={8} fill="#232B4A" />
          <Rect x={157} y={203} width={66} height={44} rx={4} fill="#FFFFFF" />
          <Rect x={163} y={210} width={30} height={5} rx={2.5} fill={colors.primary} />
          <Rect x={163} y={221} width={52} height={4} rx={2} fill={colors.primarySoft} />
          <Rect x={163} y={230} width={40} height={4} rx={2} fill={colors.primarySoft} />
          <Circle cx={211} cy={238} r={5} fill={colors.primary} />
          {/* Hands */}
          <Circle cx={152} cy={236} r={7} fill={colors.skin} />
          <Circle cx={228} cy={232} r={7} fill={colors.skin} />
        </G>
      </G>

      {/* Neck and head sit above the clip so nothing is cut off */}
      <Rect x={132} y={178} width={16} height={30} rx={6} fill={colors.skin} />
      <Ellipse cx={140} cy={150} rx={26} ry={30} fill={colors.skin} />
      <Circle cx={150} cy={104} r={13} fill={colors.hair} />
      <Path
        d="M113 152 C109 118 130 108 143 110 C162 110 172 128 167 152 C162 136 150 128 138 128 C126 128 117 138 113 152 Z"
        fill={colors.hair}
      />
      {/* Eyes looking down at the tablet, and a small smile */}
      <Path d="M129 152 Q133 155 137 152" stroke={colors.hair} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M147 152 Q151 155 155 152" stroke={colors.hair} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M136 166 Q141 170 146 166" stroke="#C27F6A" strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Slide 2: a stack of flashcards with an AI sparkle badge. */
export function DecksIllustration({ size = 300 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      <Circle cx={150} cy={160} r={120} fill={colors.primaryTint} />

      {/* Back cards */}
      <G rotation={-12} origin="150, 165">
        <Rect x={88} y={78} width={124} height={170} rx={16} fill={colors.primaryMid} />
      </G>
      <G rotation={8} origin="150, 165">
        <Rect x={88} y={78} width={124} height={170} rx={16} fill={colors.primarySoft} />
      </G>

      {/* Front card */}
      <Rect x={88} y={78} width={124} height={170} rx={16} fill="#FFFFFF" stroke={colors.primary} strokeWidth={3} />
      <SvgText x={150} y={170} fontSize={72} fontWeight="bold" fill={colors.primary} textAnchor="middle">
        ?
      </SvgText>
      <Rect x={116} y={196} width={68} height={6} rx={3} fill={colors.primarySoft} />
      <Rect x={130} y={210} width={40} height={6} rx={3} fill={colors.primarySoft} />

      {/* AI helper badge */}
      <Circle cx={222} cy={90} r={26} fill={colors.primary} />
      <Path
        d="M222 73 C223 83 228 88 238 89 C228 90 223 95 222 105 C221 95 216 90 206 89 C216 88 221 83 222 73 Z"
        fill="#FFFFFF"
      />
      <Circle cx={240} cy={68} r={4} fill={colors.primaryMid} />

      {/* Floating shapes */}
      <Circle cx={52} cy={110} r={6} fill={colors.primaryMid} />
      <Polygon points="66,222 58,236 42,236 34,222 42,208 58,208" fill={colors.primaryMid} />
      <Path
        d="M258 196 L258 212 M250 204 L266 204"
        stroke={colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Slide 3: progress chart with a streak flame and a completed check. */
export function ProgressIllustration({ size = 300 }: IllustrationProps) {
  const bars = [
    { x: 74, h: 32 },
    { x: 104, h: 52 },
    { x: 134, h: 42 },
    { x: 164, h: 74 },
    { x: 194, h: 100 },
  ];
  const baseline = 216;

  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      <Circle cx={150} cy={160} r={120} fill={colors.primaryTint} />

      {/* Chart card */}
      <Rect x={50} y={92} width={200} height={150} rx={20} fill="#FFFFFF" stroke={colors.primarySoft} strokeWidth={3} />
      <Line x1={68} y1={baseline} x2={232} y2={baseline} stroke={colors.border} strokeWidth={2} strokeLinecap="round" />
      {bars.map((bar, i) => (
        <Rect
          key={bar.x}
          x={bar.x}
          y={baseline - bar.h}
          width={22}
          height={bar.h}
          rx={6}
          fill={i === bars.length - 1 ? colors.primary : colors.primaryMid}
        />
      ))}
      <Rect x={68} y={110} width={46} height={6} rx={3} fill={colors.primarySoft} />

      {/* Streak flame */}
      <Circle cx={236} cy={86} r={26} fill={colors.flameSoft} />
      <Path
        d="M236 68 C244 78 250 84 248 93 C246 102 226 102 224 93 C223 87 228 84 230 78 C232 82 234 82 236 68 Z"
        fill={colors.flame}
      />

      {/* Completed check */}
      <Circle cx={62} cy={238} r={18} fill={colors.success} />
      <Path
        d="M54 238 L60 244 L71 231"
        stroke="#FFFFFF"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Floating shapes */}
      <Circle cx={40} cy={130} r={5} fill={colors.primaryMid} />
      <Polygon points="268,180 260,194 244,194 236,180 244,166 260,166" fill={colors.primaryMid} />
    </Svg>
  );
}