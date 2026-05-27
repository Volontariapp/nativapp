import React, { useRef, useState, useMemo, useReducer } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  type PressableStateCallbackType,
  type ViewStyle,
} from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { HttpMethodBadge } from '@/components/ui/HttpMethodBadge';
import { HTTP_METHOD_COLORS } from '@/shared/themes/http-method-colors';
import { AdminCard } from '../AdminCard';
import { theme } from '@/shared/themes/theme';
import Icon from 'react-native-vector-icons/Feather';
import type { EndpointMeta, ApiResponse, ApiFunction } from './types';

interface EndpointModalProps {
  visible: boolean;
  methodName: string | null;
  meta: EndpointMeta | null;
  fn: ApiFunction | null;
  onClose: () => void;
}

// ── Execution state: useReducer avoids cascading setState calls ────────────────
interface ExecState {
  loading: boolean;
  response: ApiResponse | null;
  /** User overrides for JSON inputs – null means "use the example from meta" */
  payloadOverride: string | null;
  pathParamsOverride: string | null;
}

type ExecAction =
  | { type: 'START' }
  | { type: 'SUCCESS'; data: unknown }
  | { type: 'ERROR'; error: string }
  | { type: 'SET_PAYLOAD'; value: string }
  | { type: 'SET_PATH_PARAMS'; value: string }
  | { type: 'RESET' };

function execReducer(state: ExecState, action: ExecAction): ExecState {
  switch (action.type) {
    case 'START':
      return { ...state, loading: true, response: null };
    case 'SUCCESS':
      return { ...state, loading: false, response: { status: 'SUCCESS', data: action.data } };
    case 'ERROR':
      return { ...state, loading: false, response: { status: 'ERROR', error: action.error } };
    case 'SET_PAYLOAD':
      return { ...state, payloadOverride: action.value };
    case 'SET_PATH_PARAMS':
      return { ...state, pathParamsOverride: action.value };
    case 'RESET':
      return { loading: false, response: null, payloadOverride: null, pathParamsOverride: null };
    default:
      return state;
  }
}

const INITIAL_EXEC_STATE: ExecState = {
  loading: false,
  response: null,
  payloadOverride: null,
  pathParamsOverride: null,
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Section label with icon */
const SectionLabel = ({ icon, label }: { icon: string; label: string }): React.JSX.Element => (
  <View style={modalStyles.sectionLabel}>
    <Icon name={icon} size={13} color={theme.colors.grey} />
    <AppText style={modalStyles.sectionLabelText}>{label}</AppText>
  </View>
);

/** JSON monospace input with focus ring */
const JsonInput = ({
  value,
  onChangeText,
  minHeight = 80,
}: {
  value: string;
  onChangeText: (t: string) => void;
  minHeight?: number;
}): React.JSX.Element => {
  const [focused, setFocused] = useState(false);
  const activateFocus = (): void => {
    setFocused(true);
  };
  const deactivateFocus = (): void => {
    setFocused(false);
  };
  return (
    <TextInput
      style={[
        modalStyles.jsonInput,
        { minHeight },
        focused ? modalStyles.jsonInputFocused : undefined,
      ]}
      multiline
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoCorrect={false}
      placeholderTextColor={theme.colors.grey}
      placeholder="{}"
      onFocus={activateFocus}
      onBlur={deactivateFocus}
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Full-screen modal for executing a single API endpoint.
 *
 * State strategy:
 * - `payloadText` / `pathParamsText` are computed directly during render from `meta`
 *   (derived state). User edits are tracked via `payloadOverride` / `pathParamsOverride`
 *   inside the reducer — no useEffect needed.
 * - Execution status (loading, response) is managed by a single `useReducer` to avoid
 *   cascading `setState` calls.
 */
export const EndpointModal = ({
  visible,
  methodName,
  meta,
  fn,
  onClose,
}: EndpointModalProps): React.JSX.Element => {
  const [execState, dispatch] = useReducer(execReducer, INITIAL_EXEC_STATE);

  // ── Derived values computed inline during render (no useState/useEffect) ──
  const defaultPayloadText = useMemo(
    () => (meta?.examplePayload != null ? JSON.stringify(meta.examplePayload, null, 2) : '{}'),
    [meta],
  );

  const defaultPathParamsText = useMemo(
    () =>
      meta?.examplePathParams != null ? JSON.stringify(meta.examplePathParams, null, 2) : '{}',
    [meta],
  );

  // Use user override if they've typed, otherwise fall back to the example
  const payloadText = execState.payloadOverride ?? defaultPayloadText;
  const pathParamsText = execState.pathParamsOverride ?? defaultPathParamsText;

  // Reset overrides when the selected endpoint changes
  // This is safe to do during render (not in an effect) because it's a conditional reset
  const prevMethodName = useRef(methodName);
  if (methodName !== prevMethodName.current) {
    prevMethodName.current = methodName;
    dispatch({ type: 'RESET' });
  }

  // ── Execution ──────────────────────────────────────────────────────────────
  const execute = async (): Promise<void> => {
    if (fn == null) return;
    dispatch({ type: 'START' });
    try {
      const payloadObj = JSON.parse(payloadText) as Record<string, unknown>;
      const pathParamsObj = JSON.parse(pathParamsText) as Record<string, string>;
      const hasPayload = Object.keys(payloadObj).length > 0;
      const hasPathParams = Object.keys(pathParamsObj).length > 0;

      let res: unknown;
      if (hasPayload && hasPathParams) res = await fn(payloadObj, pathParamsObj);
      else if (hasPayload) res = await fn(payloadObj);
      else if (hasPathParams) res = await fn({}, pathParamsObj);
      else res = await fn();

      dispatch({ type: 'SUCCESS', data: res });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      dispatch({ type: 'ERROR', error: msg });
    }
  };

  const submitExecution = (): void => {
    void execute();
  };

  const closePressStyle = ({ pressed }: PressableStateCallbackType): ViewStyle =>
    pressed ? { ...modalStyles.closeBtn, opacity: 0.5 } : modalStyles.closeBtn;

  // ── Derived display values ─────────────────────────────────────────────────
  const methodColor =
    meta != null ? (HTTP_METHOD_COLORS[meta.method] ?? theme.colors.grey) : theme.colors.grey;

  const responseColor =
    execState.response?.status === 'ERROR' ? theme.colors.danger : theme.colors.success;

  const responseBody =
    execState.response?.status === 'SUCCESS'
      ? JSON.stringify(execState.response.data, null, 2)
      : execState.response?.status === 'ERROR'
        ? execState.response.error
        : '';

  const hasPathParams = meta?.examplePathParams != null;
  const hasBody = meta?.examplePayload != null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.container}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={[modalStyles.header, { borderBottomColor: methodColor + '33' }]}>
          <View style={modalStyles.headerLeft}>
            {meta != null && (
              <HttpMethodBadge method={meta.method} size="md" style={modalStyles.badge} />
            )}
            <View style={modalStyles.headerTitles}>
              <AppText style={modalStyles.fnName}>{methodName}()</AppText>
              {meta?.path != null && <AppText style={modalStyles.path}>{meta.path}</AppText>}
              {meta?.description != null && (
                <AppText style={modalStyles.description}>{meta.description}</AppText>
              )}
            </View>
          </View>
          <Pressable style={closePressStyle} onPress={onClose}>
            <Icon name="x" size={22} color={theme.colors.grey} />
          </Pressable>
        </View>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <ScrollView
          style={modalStyles.scroll}
          contentContainerStyle={modalStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={modalStyles.section}>
            <SectionLabel icon="link" label="Path params" />
            <JsonInput
              value={pathParamsText}
              onChangeText={(v) => {
                dispatch({ type: 'SET_PATH_PARAMS', value: v });
              }}
              minHeight={hasPathParams ? 90 : 50}
            />
          </View>

          <View style={modalStyles.section}>
            <SectionLabel icon="code" label="Body (JSON)" />
            <JsonInput
              value={payloadText}
              onChangeText={(v) => {
                dispatch({ type: 'SET_PAYLOAD', value: v });
              }}
              minHeight={hasBody ? 140 : 60}
            />
          </View>

          <Pressable
            onPress={submitExecution}
            disabled={execState.loading}
            style={({ pressed }) => [
              modalStyles.execBtn,
              { backgroundColor: methodColor },
              (execState.loading || pressed) && modalStyles.execBtnDisabled,
            ]}
          >
            {execState.loading ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <View style={modalStyles.execBtnContent}>
                <Icon name="send" size={16} color={theme.colors.white} />
                <AppText style={modalStyles.execBtnText}>Exécuter</AppText>
              </View>
            )}
          </Pressable>

          {execState.response != null && (
            <AdminCard style={modalStyles.responseCard}>
              <View style={modalStyles.responseHeader}>
                <View style={[modalStyles.statusDot, { backgroundColor: responseColor }]} />
                <AppText style={[modalStyles.responseStatusText, { color: responseColor }]}>
                  {execState.response.status}
                </AppText>
                {execState.response.status === 'SUCCESS' && (
                  <Icon
                    name="check-circle"
                    size={14}
                    color={responseColor}
                    style={{ marginLeft: 4 }}
                  />
                )}
                {execState.response.status === 'ERROR' && (
                  <Icon
                    name="alert-circle"
                    size={14}
                    color={responseColor}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
              <AppText style={modalStyles.responseBody}>{responseBody}</AppText>
            </AdminCard>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 2,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  badge: {
    marginTop: 3,
    flexShrink: 0,
  },
  headerTitles: {
    flex: 1,
    gap: 2,
  },
  fnName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    fontFamily: 'Courier_Prime',
    color: theme.colors.black,
  },
  path: {
    fontSize: 12,
    color: theme.colors.grey,
    fontFamily: 'Courier_Prime',
  },
  description: {
    fontSize: 12,
    color: theme.colors.grey,
    marginTop: 2,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.xs,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.xs,
  },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.grey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  jsonInput: {
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.lightGrey,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontFamily: 'Courier_Prime',
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.black,
    textAlignVertical: 'top',
  },
  jsonInputFocused: {
    borderColor: theme.colors.primarySocio,
  },
  execBtn: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  execBtnDisabled: {
    opacity: 0.65,
  },
  execBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  execBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: theme.typography.fontSize.md,
  },
  responseCard: {
    marginTop: theme.spacing.xs,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  responseStatusText: {
    fontWeight: '700',
    fontSize: theme.typography.fontSize.sm,
  },
  responseBody: {
    fontFamily: 'Courier_Prime',
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.black,
  },
});
