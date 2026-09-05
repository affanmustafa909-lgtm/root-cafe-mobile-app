import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { BrandMark } from '../components/BrandMark';
import { HeaderBack } from '../components/HeaderBack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FadeIn } from '../components/FadeIn';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { LEGAL_URLS } from '../constants/config';
import { radii, spacing } from '../constants/theme';
import { useAuth } from '../store/AuthContext';
import { useAppTheme } from '../store/ThemeContext';
import { friendlyError } from '../utils/errors';

const schema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    acceptTerms: z.boolean().refine((v) => v, {
      message: 'Terms must be accepted',
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

type Props = {
  onLogin: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function RegisterScreen({
  onLogin,
  onOpenLegal,
  onSuccess,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { colors, typography } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const accepted = watch('acceptTerms');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        container: {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: 56,
          flexGrow: 1,
        },
        containerWithBack: { paddingTop: 56 },
        header: {
          alignItems: 'center',
          marginBottom: 12,
        },
        title: {
          ...typography.h2,
          marginTop: 10,
          marginBottom: 4,
          textAlign: 'center',
          color: colors.text,
        },
        subtitle: {
          ...typography.caption,
          textAlign: 'center',
          color: colors.textSecondary,
          marginBottom: 8,
        },
        row: {
          flexDirection: 'row',
          gap: 10,
        },
        half: { flex: 1 },
        consent: {
          flexDirection: 'row',
          gap: 10,
          marginBottom: 12,
          marginTop: 4,
          alignItems: 'flex-start',
        },
        checkbox: {
          width: 22,
          height: 22,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          borderRadius: radii.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.panelElevated,
          marginTop: 2,
        },
        checkboxOn: {
          backgroundColor: colors.coral,
          borderColor: colors.coral,
        },
        checkMark: {
          width: 10,
          height: 6,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderColor: '#FFFFFF',
          transform: [{ rotate: '-45deg' }, { translateY: -1 }],
        },
        consentText: {
          flex: 1,
          ...typography.bodySmall,
          color: colors.textMuted,
          lineHeight: 20,
        },
        linkInline: {
          color: colors.sky,
          fontFamily: typography.bodyBold.fontFamily,
        },
        link: { ...typography.bodyBold, color: colors.coral },
        footer: {
          marginTop: 18,
          alignItems: 'center',
          gap: 6,
          flexDirection: 'row',
          justifyContent: 'center',
          paddingBottom: 8,
        },
        footerText: { color: colors.textSecondary },
        error: {
          ...typography.caption,
          color: colors.coral,
          marginBottom: 8,
        },
      }),
    [colors, typography],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        password: values.password,
      });
      onSuccess?.();
    } catch (error) {
      Alert.alert(t('common.error'), friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  });

  const scrollTo = (y: number) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      {onClose ? <HeaderBack onPress={onClose} /> : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.container,
            onClose ? styles.containerWithBack : null,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <FadeIn>
            <View style={styles.header}>
              <BrandMark />
              <Text style={styles.title}>{t('auth.register')}</Text>
              <Text style={styles.subtitle}>{t('auth.tagline')}</Text>
            </View>
          </FadeIn>

          <Card>
            <View style={styles.row}>
              <View style={styles.half}>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label={t('auth.firstName')}
                      value={value}
                      onChangeText={onChange}
                      error={errors.firstName?.message}
                      onFocus={() => scrollTo(40)}
                    />
                  )}
                />
              </View>
              <View style={styles.half}>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label={t('auth.lastName')}
                      value={value}
                      onChangeText={onChange}
                      error={errors.lastName?.message}
                      onFocus={() => scrollTo(40)}
                    />
                  )}
                />
              </View>
            </View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.email')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  onFocus={() => scrollTo(120)}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.phone')}
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => scrollTo(180)}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.password')}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  onFocus={() => scrollTo(260)}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.confirmPassword')}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  onFocus={() => scrollTo(340)}
                />
              )}
            />

            <Pressable
              style={styles.consent}
              onPress={() =>
                setValue('acceptTerms', !accepted, { shouldValidate: true })
              }
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!accepted }}
            >
              <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
                {accepted ? <View style={styles.checkMark} /> : null}
              </View>
              <Text style={styles.consentText}>
                {t('auth.acceptTerms')}{' '}
                <Text
                  style={styles.linkInline}
                  onPress={() => onOpenLegal('terms')}
                >
                  ({t('auth.terms')}
                  {LEGAL_URLS.terms ? '' : ' — TBD'})
                </Text>
                {' / '}
                <Text
                  style={styles.linkInline}
                  onPress={() => onOpenLegal('privacy')}
                >
                  ({t('auth.privacy')}
                  {LEGAL_URLS.privacy ? '' : ' — TBD'})
                </Text>
              </Text>
            </Pressable>
            {errors.acceptTerms ? (
              <Text style={styles.error}>{t('auth.acceptTerms')}</Text>
            ) : null}

            <Button
              title={t('auth.createAccount')}
              onPress={onSubmit}
              loading={submitting}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
            <Pressable onPress={onLogin} accessibilityRole="button">
              <Text style={styles.link}>{t('auth.login')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
