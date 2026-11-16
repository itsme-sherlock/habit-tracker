import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification appearance in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /**
   * Request notification permission from user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Android notification channel setup
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Study Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#00D4AA',
          });
        } catch (channelError) {
          console.warn('Channel setup warning:', channelError);
        }
      }

      return true;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  },

  /**
   * Helper to construct message based on pending tasks
   */
  getMessage(pendingTasksCount: number, dayNum: number, pendingHabitsCount: number = 0) {
    if (pendingTasksCount > 0) {
      return {
        title: `⏰ DE60 Study Reminder (${pendingTasksCount} Pending)`,
        body: `You still have ${pendingTasksCount} task${
          pendingTasksCount > 1 ? 's' : ''
        } pending for today (Day ${dayNum})! Please complete them to keep your streak.`,
      };
    } else if (pendingHabitsCount > 0) {
      return {
        title: `⚡ Core Tasks Done (${pendingHabitsCount} Habits Pending)`,
        body: `Great job on Day ${dayNum} tasks! You still have ${pendingHabitsCount} micro-habits pending for today. Please complete them.`,
      };
    } else {
      return {
        title: `🎉 Day ${dayNum} Fully Complete!`,
        body: `Awesome effort! All tasks and habits for today are finished. Keep up the momentum!`,
      };
    }
  },

  /**
   * Schedule hourly repeating reminder (every 3600 seconds / 1 hour)
   */
  async scheduleHourlyReminder(
    pendingTasksCount: number = 3,
    dayNum: number = 16,
    pendingHabitsCount: number = 0
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      await Notifications.cancelAllScheduledNotificationsAsync();

      const { title, body } = this.getMessage(pendingTasksCount, dayNum, pendingHabitsCount);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3600, // Repeats every 1 hour
          repeats: true,
        },
      });

      console.log('Hourly reminder scheduled (repeats every 1h):', id);
      return id;
    } catch (e) {
      console.error('Error scheduling hourly reminder:', e);
      return null;
    }
  },

  /**
   * Schedule daily reminder (e.g. 1:00 PM / 13:00)
   */
  async scheduleDailyReminder(
    hour: number = 13,
    minute: number = 0,
    dayNum: number = 16,
    pendingTasksCount: number = 3
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      await Notifications.cancelAllScheduledNotificationsAsync();

      const { title, body } = this.getMessage(pendingTasksCount, dayNum);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      return id;
    } catch (e) {
      console.error('Error scheduling daily reminder:', e);
      return null;
    }
  },

  /**
   * Send an immediate test notification right now so the user can verify
   */
  async sendInstantPendingReminder(
    pendingTasksCount: number = 3,
    dayNum: number = 16,
    pendingHabitsCount: number = 0
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      const { title, body } = this.getMessage(pendingTasksCount, dayNum, pendingHabitsCount);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 [Hourly Alert] ${title}`,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1, // Fires immediately
        },
      });

      return true;
    } catch (e) {
      console.error('Error sending instant pending reminder:', e);
      return false;
    }
  },

  /**
   * Send an instant test notification (alias for convenience)
   */
  async sendInstantTestNotification(dayNum: number = 16): Promise<boolean> {
    return this.sendInstantPendingReminder(3, dayNum, 0);
  },

  /**
   * Cancel all notifications
   */
  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error('Error cancelling notifications:', e);
    }
  },

  /**
   * Check all scheduled notifications
   */
  async getScheduled(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (e) {
      return [];
    }
  },
};
