import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export function Screen({
  children,
  contentStyle,
  scroll = true,
}: {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'web' ? Math.max(67, insets.top + 10) : insets.top + 10;
  const paddingBottom = Platform.OS === 'web' ? 120 : Math.max(insets.bottom, 18) + 24;
  const content = (
    <View
      style={[
        styles.screenContent,
        { paddingTop: paddingTop, paddingBottom: paddingBottom },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

export function AppText({
  children,
  style,
  muted = false,
  ...props
}: React.ComponentProps<typeof Text> & { muted?: boolean }) {
  const colors = useColors();
  return (
    <Text
      {...props}
      style={[
        {
          color: muted ? colors.mutedForeground : colors.foreground,
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          lineHeight: 22,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.flex}>
        <AppText style={styles.screenTitle}>{title}</AppText>
        {subtitle ? <AppText muted style={styles.screenSubtitle}>{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'quiet';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const color =
    variant === 'primary'
      ? colors.primaryForeground
      : variant === 'danger'
        ? colors.destructiveForeground
        : variant === 'quiet'
          ? colors.primary
          : colors.secondaryForeground;
  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.destructive
        : variant === 'secondary'
          ? colors.secondary
          : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: variant === 'outline' ? colors.border : 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={17} color={color} /> : null}
          <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  size = 42,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  label: string;
  size?: number;
  color?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { width: size, height: size, opacity: pressed ? 0.65 : 1 }]}
    >
      <Feather name={icon} size={20} color={color ?? colors.foreground} />
    </Pressable>
  );
}

export function Field({
  label,
  error,
  containerStyle,
  ...props
}: Omit<TextInputProps, 'style'> & { label: string; error?: string; containerStyle?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return (
    <View style={[styles.fieldWrap, containerStyle]}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <TextInput
        {...props}
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel={label}
        style={[
          styles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.border,
          },
        ]}
      />
      {error ? <AppText style={[styles.fieldError, { color: colors.destructive }]}>{error}</AppText> : null}
    </View>
  );
}

export function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  const colors = useColors();
  return (
    <AppText style={[styles.eyebrow, { color: color ?? colors.mutedForeground }]}>{children}</AppText>
  );
}

export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'good' | 'warning' | 'danger';
}) {
  const colors = useColors();
  const palette =
    tone === 'good'
      ? { backgroundColor: colors.goodSurface, color: colors.good }
      : tone === 'warning'
        ? { backgroundColor: colors.warningSurface, color: colors.warning }
        : tone === 'danger'
          ? { backgroundColor: '#F9E9E7', color: colors.destructive }
          : { backgroundColor: colors.secondary, color: colors.secondaryForeground };
  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <AppText style={[styles.pillText, { color: palette.color }]}>{label}</AppText>
    </View>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color ?? colors.primary },
        ]}
      />
    </View>
  );
}

export function Avatar({
  name,
  onPress,
  size = 44,
}: {
  name: string;
  onPress?: () => void;
  size?: number;
}) {
  const colors = useColors();
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? 'Open profile' : undefined}
      onPress={onPress}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.secondary,
        },
      ]}
    >
      <AppText style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: size * 0.3 }}>
        {initials}
      </AppText>
    </Pressable>
  );
}

export function BrandMark({ size = 58 }: { size?: number }) {
  return (
    <Image
      source={require('../assets/images/icon_2.png')}
      style={{ width: size, height: size, borderRadius: size * 0.23 }}
      accessibilityLabel="Shoulder movement app icon"
    />
  );
}

export function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.choiceRow}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={[
              styles.choice,
              {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <AppText
              style={[
                styles.choiceText,
                { color: selected ? colors.primaryForeground : colors.secondaryForeground },
              ]}
            >
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MetricTile({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  return (
    <Card style={styles.metricTile}>
      <View style={styles.metricTop}>
        {icon ? <Feather name={icon} size={15} color={colors.primary} /> : null}
        <Eyebrow>{label}</Eyebrow>
      </View>
      <View style={styles.metricValueRow}>
        <AppText style={styles.metricValue}>{value}</AppText>
        {unit ? <AppText muted style={styles.metricUnit}>{unit}</AppText> : null}
      </View>
    </Card>
  );
}

export function TwinIllustration({
  leftAngle,
  rightAngle,
  compact = false,
}: {
  leftAngle: number;
  rightAngle: number;
  compact?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={[styles.twinWrap, compact && styles.twinCompact, { backgroundColor: colors.heroSoft }]}>
      <Svg width="100%" height={compact ? 172 : 208} viewBox="0 0 300 220">
        <Path d="M123 34 Q150 22 177 34 L191 58 Q203 67 209 87 L213 139 L197 156 L184 111 L183 190 L117 190 L116 111 L103 156 L87 139 L91 87 Q97 67 109 58 Z" fill={colors.card} stroke={colors.border} strokeWidth="2" />
        <Path d="M111 59 Q150 73 189 59" fill="none" stroke={colors.mutedForeground} strokeWidth="2" strokeLinecap="round" />
        <Path d="M110 63 Q92 69 83 88 L67 132" fill="none" stroke={colors.primary} strokeWidth="11" strokeLinecap="round" />
        <Path d="M67 132 L55 177" fill="none" stroke={colors.primary} strokeWidth="9" strokeLinecap="round" />
        <Path d="M190 63 Q208 69 217 88 L232 129" fill="none" stroke={colors.accent} strokeWidth="11" strokeLinecap="round" />
        <Path d="M232 129 L244 174" fill="none" stroke={colors.accent} strokeWidth="9" strokeLinecap="round" />
        <Circle cx="110" cy="64" r="7" fill={colors.primary} />
        <Circle cx="190" cy="64" r="7" fill={colors.accent} />
        <Circle cx="67" cy="132" r="5" fill={colors.primary} />
        <Circle cx="232" cy="129" r="5" fill={colors.accent} />
        <Path d="M223 146 Q250 121 250 91" fill="none" stroke={colors.warning} strokeWidth="2" strokeDasharray="5 6" />
        <Path d="M246 96 L251 88 L256 98" fill="none" stroke={colors.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <SvgText x="18" y="204" fill={colors.secondaryForeground} fontSize="10" fontWeight="600">LEFT {leftAngle}°</SvgText>
        <SvgText x="209" y="204" fill={colors.secondaryForeground} fontSize="10" fontWeight="600">RIGHT {rightAngle}°</SvgText>
        <SvgText x="115" y="18" fill={colors.mutedForeground} fontSize="9" fontWeight="600" letterSpacing="1">SHOULDER MOVEMENT</SvgText>
      </Svg>
    </View>
  );
}

export function MiniLineChart({
  values,
  color,
  height = 128,
}: {
  values: number[];
  color?: string;
  height?: number;
}) {
  const colors = useColors();
  const width = 300;
  const chartHeight = 100;
  const safeValues = values.length > 1 ? values : [0, ...values];
  const minValue = Math.min(...safeValues) - 4;
  const maxValue = Math.max(...safeValues) + 4;
  const points = safeValues.map((value, index) => {
    const x = 10 + (index * (width - 20)) / Math.max(safeValues.length - 1, 1);
    const y =
      chartHeight - 8 - ((value - minValue) / Math.max(maxValue - minValue, 1)) * (chartHeight - 20);
    return { x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[25, 55, 85].map((y) => (
        <Path key={y} d={`M 0 ${y} L ${width} ${y}`} stroke={colors.border} strokeWidth="1" />
      ))}
      <Path d={path} fill="none" stroke={color ?? colors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <Circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="4" fill={color ?? colors.primary} stroke={colors.card} strokeWidth="2" />
      ))}
    </Svg>
  );
}

export function EmptyState({
  title,
  description,
  icon = 'inbox',
}: {
  title: string;
  description: string;
  icon?: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <Feather name={icon} size={30} color={colors.mutedForeground} />
      <AppText style={styles.emptyTitle}>{title}</AppText>
      <AppText muted style={styles.centerText}>{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  screenContent: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 20, gap: 20 },
  flex: { flex: 1 },
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 1 },
  screenTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, lineHeight: 31, letterSpacing: -0.6 },
  screenSubtitle: { fontSize: 13, marginTop: 3 },
  card: { borderRadius: 22, borderWidth: 1, padding: 18, gap: 14 },
  button: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, borderWidth: 1 },
  buttonLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  iconButton: { alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 15, fontFamily: 'Inter_400Regular', fontSize: 15 },
  fieldError: { fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, lineHeight: 15, letterSpacing: 1.1, textTransform: 'uppercase' },
  pill: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, lineHeight: 15 },
  progressTrack: { width: '100%', height: 7, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minHeight: 42, borderWidth: 1, borderRadius: 99, paddingHorizontal: 14, justifyContent: 'center' },
  choiceText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  metricTile: { flex: 1, minWidth: 135, padding: 15, gap: 11 },
  metricTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metricValue: { fontFamily: 'Inter_700Bold', fontSize: 27, letterSpacing: -0.8 },
  metricUnit: { fontSize: 12 },
  twinWrap: { borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', minHeight: 195 },
  twinCompact: { minHeight: 164 },
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 30, paddingHorizontal: 22 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, textAlign: 'center' },
  centerText: { textAlign: 'center' },
});