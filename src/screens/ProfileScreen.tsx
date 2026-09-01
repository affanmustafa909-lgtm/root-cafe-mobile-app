import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { ThemeToggle } from '../components/ThemeToggle';
import { useToast } from '../components/Toast';
import { fonts, radii, spacing } from '../constants/theme';
import { mediaUrl } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useAppTheme } from '../store/ThemeContext';
import { friendlyError } from '../utils/errors';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

type Form = z.infer<typeof schema>;

type Props = {
  onOpenSettings: () => void;
  onSignIn: () => void;
};

function initialsFrom(name?: string | null, email?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  if (parts[0]?.length) return parts[0].slice(0, 2).toUpperCase();
  if (email?.trim()) return email.trim().slice(0, 2).toUpperCase();
  return 'RC';
}

export function ProfileScreen({ onOpenSettings, onSignIn }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const { user, isAuthenticated, updateProfile, uploadAvatar, clearAvatar } =
    useAuth();
  const { colors, mode } = useAppTheme();
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    values: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        content: {
          paddingHorizontal: spacing.md,
          paddingTop: 8,
          paddingBottom: 48,
          gap: 22,
        },
        topBar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        },
        title: {
          fontFamily: fonts.display,
          fontSize: 28,
          lineHeight: 34,
          color: colors.text,
          flexShrink: 1,
        },
        topActions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        iconBtn: {
          width: 42,
          height: 42,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.panel,
          borderWidth: 1,
          borderColor: colors.border,
        },
        hero: {
          alignItems: 'center',
          paddingVertical: 8,
          gap: 10,
        },
        avatar: {
          width: 88,
          height: 88,
          borderRadius: 44,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.coralMuted,
          borderWidth: 2,
          borderColor: colors.coral,
          position: 'relative',
        },
        avatarImage: {
          width: 88,
          height: 88,
          borderRadius: 44,
        },
        avatarText: {
          fontFamily: fonts.sansBold,
          fontSize: 28,
          color: colors.coral,
          letterSpacing: 0.5,
        },
        cameraBadge: {
          position: 'absolute',
          right: -2,
          bottom: -2,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colors.coral,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: colors.background,
        },
        photoActions: {
          flexDirection: 'row',
          gap: 10,
          marginTop: 4,
        },
        photoLink: {
          fontFamily: fonts.sansSemi,
          fontSize: 13,
          color: colors.coral,
        },
        photoLinkMuted: {
          color: colors.textMuted,
        },
        heroName: {
          fontFamily: fonts.sansBold,
          fontSize: 20,
          lineHeight: 26,
          color: colors.text,
          textAlign: 'center',
        },
        heroMeta: {
          fontFamily: fonts.sans,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textMuted,
          textAlign: 'center',
        },
        section: { gap: 12 },
        sectionLabel: {
          fontFamily: fonts.sansSemi,
          fontSize: 12,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.textSecondary,
          marginLeft: 2,
        },
        panel: {
          backgroundColor: colors.panel,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        formGap: { gap: 2 },
        guestActions: { gap: 12 },
        guestHint: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 22,
          color: colors.textMuted,
          textAlign: 'center',
          paddingHorizontal: 12,
        },
      }),
    [colors],
  );

  const onSave = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await updateProfile({
        name: values.name.trim(),
        phone: values.phone?.trim() || '',
      });
      toast.show(t('profile.saved'), 'success');
    } catch (error) {
      Alert.alert(t('common.error'), friendlyError(error));
    } finally {
      setSaving(false);
    }
  });

  const pickAvatar = async () => {
    let ImagePicker: typeof import('expo-image-picker');
    try {
      ImagePicker = await import('expo-image-picker');
    } catch {
      Alert.alert(
        t('common.error'),
        'Photo picker needs a native rebuild. Run: npx expo run:android',
      );
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), 'Photo library permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      setPhotoBusy(true);
      const asset = result.assets[0];
      await uploadAvatar(asset.uri, asset.mimeType ?? 'image/jpeg');
      toast.show(t('profile.photoUpdated'), 'success');
    } catch (error) {
      const msg = friendlyError(error);
      if (
        msg.includes('ExponentImagePicker') ||
        msg.includes('native module')
      ) {
        Alert.alert(
          t('common.error'),
          'Photo picker needs a native rebuild. Run: npx expo run:android',
        );
      } else {
        Alert.alert(t('common.error'), msg);
      }
    } finally {
      setPhotoBusy(false);
    }
  };

  const removeAvatar = async () => {
    setPhotoBusy(true);
    try {
      await clearAvatar();
      toast.show(t('profile.photoUpdated'), 'success');
    } catch (error) {
      Alert.alert(t('common.error'), friendlyError(error));
    } finally {
      setPhotoBusy(false);
    }
  };

  const avatarSrc = mediaUrl(user?.avatarUrl);

  const displayName = isAuthenticated
    ? user?.name?.trim() ||
      (user?.email ? user.email.split('@')[0] : t('home.guest'))
    : 'Roots Cafe';

  const initials = initialsFrom(
    isAuthenticated ? user?.name : 'Roots Cafe',
    user?.email,
  );

  const header = (
    <View style={styles.topBar}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <View style={styles.topActions}>
        <ThemeToggle />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.settings')}
          onPress={onOpenSettings}
          style={styles.iconBtn}
        >
          <Feather name="settings" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <Screen>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {header}
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RC</Text>
            </View>
            <Text style={styles.heroName}>Roots Cafe</Text>
            <Text style={styles.guestHint}>{t('profile.guestHint')}</Text>
          </View>
          <View style={styles.guestActions}>
            <Button title={t('auth.login')} onPress={onSignIn} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {header}

        <View style={styles.hero}>
          <Pressable
            onPress={() => void pickAvatar()}
            disabled={photoBusy}
            accessibilityRole="button"
            accessibilityLabel={t('profile.changePhoto')}
            style={{ alignItems: 'center' }}
          >
            <View style={styles.avatar}>
              {avatarSrc ? (
                <Image
                  source={{ uri: avatarSrc }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
              <View style={styles.cameraBadge}>
                <Feather
                  name="camera"
                  size={14}
                  color={mode === 'dark' ? colors.black : '#FFFFFF'}
                />
              </View>
            </View>
          </Pressable>
          <Text style={styles.heroName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.heroMeta} numberOfLines={1}>
            {user?.email}
          </Text>
          <View style={styles.photoActions}>
            <Pressable onPress={() => void pickAvatar()} disabled={photoBusy}>
              <Text style={styles.photoLink}>{t('profile.changePhoto')}</Text>
            </Pressable>
            {avatarSrc ? (
              <Pressable
                onPress={() => void removeAvatar()}
                disabled={photoBusy}
              >
                <Text style={[styles.photoLink, styles.photoLinkMuted]}>
                  {t('profile.removePhoto')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('profile.account')}</Text>
          <View style={[styles.panel, styles.formGap]}>
            <Input
              label={t('auth.email')}
              value={user?.email ?? ''}
              editable={false}
            />
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.fullName')}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.phone')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />
            <Button
              title={t('common.save')}
              onPress={onSave}
              loading={saving}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
