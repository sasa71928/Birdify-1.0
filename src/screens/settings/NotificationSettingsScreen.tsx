import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useT, TranslationKey } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import {
  SettingsScaffold,
  SettingsSection,
  SettingsRow,
} from '../../components/settings';
import { AnimatedSwitch } from '../../components/animated';

interface PushConfigItem {
  id: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: any;
  active: boolean;
}

const DEFAULT_PUSH_CONFIG: PushConfigItem[] = [
  {
    id: '1',
    titleKey: 'settings.notifNewSightingTitle',
    descKey: 'settings.notifNewSightingDesc',
    icon: 'eye-outline',
    active: true,
  },
  {
    id: '2',
    titleKey: 'settings.notifNewCommentTitle',
    descKey: 'settings.notifNewCommentDesc',
    icon: 'chatbubble-outline',
    active: true,
  },
  {
    id: '3',
    titleKey: 'settings.notifNewFollowerTitle',
    descKey: 'settings.notifNewFollowerDesc',
    icon: 'person-add-outline',
    active: true,
  },
  {
    id: '4',
    titleKey: 'settings.notifDirectMessagesTitle',
    descKey: 'settings.notifDirectMessagesDesc',
    icon: 'mail-outline',
    active: true,
  },
];

const DEFAULT_EMAIL_CONFIG: PushConfigItem[] = [
  {
    id: '5',
    titleKey: 'settings.notifWeeklyDigestTitle',
    descKey: 'settings.notifWeeklyDigestDesc',
    icon: 'book-outline',
    active: false,
  },
  {
    id: '6',
    titleKey: 'settings.notifAccountSecurityTitle',
    descKey: 'settings.notifAccountSecurityDesc',
    icon: 'shield-checkmark-outline',
    active: false,
  },
];

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { colors } = useDynamicStyles();
  const { t } = useT();
  const { user } = useAuth();

  const [pushNotifs, setPushNotifs] = useState(DEFAULT_PUSH_CONFIG);
  const [emailNotifs, setEmailNotifs] = useState(DEFAULT_EMAIL_CONFIG);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;
    try {
      let settingsData: any = null;
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_my_notification_settings'
      );

      if (!rpcError && rpcData) {
        settingsData = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      } else if (rpcError?.code === 'PGRST202') {
        const { data, error } = await supabase
          .from('users')
          .select('push_notifications, email_notifications')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        settingsData = data;
      } else if (rpcError) {
        throw rpcError;
      }

      if (settingsData?.push_notifications) {
        const saved = Array.isArray(settingsData.push_notifications)
          ? settingsData.push_notifications
          : [];
        if (saved.length > 0) {
          setPushNotifs((prev) =>
            prev.map((item) => {
              const found = saved.find((s: any) => s.id === item.id);
              return found ? { ...item, active: !!found.active } : item;
            })
          );
        }
      }

      if (settingsData?.email_notifications) {
        const saved = Array.isArray(settingsData.email_notifications)
          ? settingsData.email_notifications
          : [];
        if (saved.length > 0) {
          setEmailNotifs((prev) =>
            prev.map((item) => {
              const found = saved.find((s: any) => s.id === item.id);
              return found ? { ...item, active: !!found.active } : item;
            })
          );
        }
      }
    } catch (e) {
      handleError(e, setToast, 'Error loading notifications settings');
    }
  };

  const togglePush = async (id: string, nextValue: boolean) => {
    const previous = pushNotifs;
    const updated = pushNotifs.map((item) =>
      item.id === id ? { ...item, active: nextValue } : item
    );
    setPushNotifs(updated);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          push_notifications: updated.map((i) => ({ id: i.id, active: i.active })),
        })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (error) {
      setPushNotifs(previous);
      handleError(error, setToast, t('settings.notifsUpdateFailed'));
    }
  };

  return (
    <SettingsScaffold
      title={t('settings.notificationsTitle')}
      onBack={() => navigation.goBack()}
    >
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Push Notifications Section */}
      <SettingsSection title={t('settings.pushTitle')}>
        {pushNotifs.map((item, idx) => (
          <SettingsRow
            key={item.id}
            icon={item.icon}
            label={t(item.titleKey)}
            sublabel={t(item.descKey)}
            showChevron={false}
            isLast={idx === pushNotifs.length - 1}
            rightElement={
              <AnimatedSwitch
                value={item.active}
                onValueChange={(val) => togglePush(item.id, val)}
                accessibilityLabel={t(item.titleKey)}
              />
            }
          />
        ))}
      </SettingsSection>

      {/* Email Notifications Section */}
      <SettingsSection title={t('settings.emailTitle')}>
        {emailNotifs.map((item, idx) => (
          <SettingsRow
            key={item.id}
            icon={item.icon}
            iconColor="#30628A"
            iconBgColor="#30628A18"
            label={t(item.titleKey)}
            sublabel={t(item.descKey)}
            showChevron={false}
            badge={t('common.soon')}
            disabled
            isLast={idx === emailNotifs.length - 1}
            rightElement={
              <AnimatedSwitch
                value={false}
                disabled
                onValueChange={() => {}}
                accessibilityLabel={t(item.titleKey)}
              />
            }
          />
        ))}
      </SettingsSection>
    </SettingsScaffold>
  );
}
