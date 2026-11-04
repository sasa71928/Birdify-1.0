import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticsService {
  private enabled = Platform.OS !== 'web';

  light() {
    if (!this.enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore if not supported on hardware
    }
  }

  medium() {
    if (!this.enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  }

  selection() {
    if (!this.enabled) return;
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignore
    }
  }

  success() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  }

  warning() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore
    }
  }

  error() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore
    }
  }
}

export const haptics = new HapticsService();

