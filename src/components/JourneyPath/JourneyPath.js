import { View, Text, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './JourneyPath.styles';

const VW = 360;
const VH = 600;

// S-curve aligned with alpine trail (bottom-left → summit top-right)
const PATH_D =
  'M 38 545 C 85 500, 70 430, 115 375 C 165 318, 95 272, 148 225 C 198 178, 138 135, 188 95 C 228 62, 205 45, 255 35';

const SEGMENTS = [
  { p0: { x: 38, y: 545 }, p1: { x: 85, y: 500 }, p2: { x: 70, y: 430 }, p3: { x: 115, y: 375 } },
  { p0: { x: 115, y: 375 }, p1: { x: 165, y: 318 }, p2: { x: 95, y: 272 }, p3: { x: 148, y: 225 } },
  { p0: { x: 148, y: 225 }, p1: { x: 198, y: 178 }, p2: { x: 138, y: 135 }, p3: { x: 188, y: 95 } },
  { p0: { x: 188, y: 95 }, p1: { x: 228, y: 62 }, p2: { x: 205, y: 45 }, p3: { x: 255, y: 35 } },
];

const MILESTONES = [
  {
    id: '1',
    type: 'number',
    value: '1',
    lines: ['Start Your', 'Journey'],
    t: 0.04,
  },
  {
    id: 'cert',
    type: 'trophy',
    lines: ['Get Certified', 'Life Coach'],
    t: 0.34,
    gold: true,
  },
  {
    id: '20',
    type: 'number',
    value: '20',
    lines: ['Complete Main', 'Course'],
    t: 0.58,
  },
  {
    id: 'adv',
    type: 'grad',
    lines: ['Advanced', 'Courses'],
    t: 0.88,
    labelDark: true,
  },
];

function cubicAt(t) {
  const segCount = SEGMENTS.length;
  const scaled = Math.min(Math.max(t, 0), 0.999) * segCount;
  const idx = Math.min(Math.floor(scaled), segCount - 1);
  const localT = scaled - idx;
  const s = SEGMENTS[idx];

  const u = 1 - localT;
  const tt = localT * localT;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * localT;

  return {
    x: uuu * s.p0.x + 3 * uu * localT * s.p1.x + 3 * u * tt * s.p2.x + ttt * s.p3.x,
    y: uuu * s.p0.y + 3 * uu * localT * s.p1.y + 3 * u * tt * s.p2.y + ttt * s.p3.y,
  };
}

function MilestonePin({ item, size = 46 }) {
  return (
    <View style={[styles.pinOuter, { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 }]}>
      <View
        style={[
          styles.pin,
          { width: size, height: size, borderRadius: size / 2 },
          item.gold ? styles.pinGold : styles.pinBlue,
        ]}
      >
        {item.type === 'number' && <Text style={styles.pinText}>{item.value}</Text>}
        {item.type === 'trophy' && (
          <MaterialCommunityIcons name="trophy" size={20} color={colors.gold} />
        )}
        {item.type === 'grad' && (
          <Ionicons name="school" size={18} color={colors.white} />
        )}
      </View>
    </View>
  );
}

function MilestoneLabel({ item, labelWidth, flip }) {
  return (
    <View
      style={[
        styles.labelPill,
        flip && styles.labelPillFlip,
        item.labelDark && styles.labelPillDark,
        { width: labelWidth, maxWidth: labelWidth },
      ]}
    >
      {item.lines.map((line, index) => (
        <Text
          key={line}
          style={[
            styles.labelText,
            item.labelDark && styles.labelTextDark,
            index > 0 && styles.labelTextSecond,
          ]}
          numberOfLines={1}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

export default function JourneyPath() {
  const { width: screenW } = useWindowDimensions();
  const labelWidth = Math.min(118, screenW * 0.32);

  const points = MILESTONES.map((m) => {
    const p = cubicAt(m.t);
    const xPct = (p.x / VW) * 100;
    const yPct = (p.y / VH) * 100;
    const flip = xPct > 48;
    return { ...m, xPct, yPct, flip };
  });

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
        style={styles.svg}
      >
        <Defs>
          <LinearGradient id="roadSurface" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#E8EDF3" stopOpacity="0.92" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="roadEdge" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#C5CDD8" stopOpacity="0.85" />
            <Stop offset="1" stopColor="#F1F5F9" stopOpacity="0.95" />
          </LinearGradient>
        </Defs>

        {/* Road shadow — semi-transparent so real trail shows through */}
        <Path
          d={PATH_D}
          stroke="rgba(15,23,42,0.18)"
          strokeWidth={40}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          transform="translate(2, 4)"
        />
        <Path
          d={PATH_D}
          stroke="url(#roadEdge)"
          strokeWidth={34}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.88}
        />
        <Path
          d={PATH_D}
          stroke="url(#roadSurface)"
          strokeWidth={26}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.82}
        />
        <Path
          d={PATH_D}
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8,12"
          fill="none"
        />
      </Svg>

      {points.map((item) => {
        const pinSize = item.id === 'adv' ? 42 : 46;
        const offsetX = item.flip ? -(pinSize / 2 + labelWidth + 14) : -(pinSize / 2);

        return (
          <View
            key={item.id}
            style={[
              styles.milestone,
              item.flip && styles.milestoneFlip,
              {
                left: `${item.xPct}%`,
                top: `${item.yPct}%`,
                transform: [{ translateX: offsetX }, { translateY: -(pinSize / 2) }],
              },
            ]}
          >
            {item.flip ? (
              <>
                <MilestoneLabel item={item} labelWidth={labelWidth} flip />
                <MilestonePin item={item} size={pinSize} />
              </>
            ) : (
              <>
                <MilestonePin item={item} size={pinSize} />
                <MilestoneLabel item={item} labelWidth={labelWidth} flip={false} />
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
