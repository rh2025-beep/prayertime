// Notification & Azan Sound Service
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Embedded local audio assets for 100% offline playback
export const AUDIO_SOURCES = {
  makkah: './audio/makkah.mp3',
  bird_chirp: './audio/bird_chirp.wav',
  silent: null
};

let audioContext = null;
let currentAudio = null;

// Initialize & unlock Web Audio Context on first user gesture
export const initAudioContext = () => {
  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    } catch (e) {
      console.warn("AudioContext init error", e);
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

// Play audio preview or alarm sound
export const playSoundSample = (soundKey) => {
  initAudioContext();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const src = AUDIO_SOURCES[soundKey];
  if (!src) return;

  try {
    currentAudio = new Audio(src);
    currentAudio.volume = 1.0;
    currentAudio.play().catch(e => console.warn("Audio play blocked", e));
  } catch (e) {
    console.error("Play sound error", e);
  }
};

// Create and register native Android notification channels with custom sound files
export const setupNotificationChannels = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const channels = [
        {
          id: 'makkah',
          name: 'Azan Notification',
          description: 'Plays Authentic Azan for Prayer Notifications',
          sound: 'makkah.mp3',
          importance: 5,
          visibility: 1,
          vibration: true
        },
        {
          id: 'bird_chirp',
          name: 'Bird Chirp Notification',
          description: 'Plays Bird Chirp sound for Prayer Notifications',
          sound: 'bird_chirp.wav',
          importance: 5,
          visibility: 1,
          vibration: true
        }
      ];

      for (const ch of channels) {
        try {
          await LocalNotifications.deleteChannel({ id: ch.id });
        } catch (e) {
          // ignore if channel did not exist yet
        }
        await LocalNotifications.createChannel(ch);
      }
    } catch (e) {
      console.warn("Setup notification channels error", e);
    }
  }
};

// Request Notification Permission (Capacitor Native & Web)
export const requestNotificationPermission = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      if (status.display === 'granted') {
        await setupNotificationChannels();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Native notification permission error", e);
    }
  }
  
  if ("Notification" in window) {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
};

// Schedule local prayer notifications for native Android & Web
export const schedulePrayerNotifications = async (timings, notifConfig, lang = 'bn') => {
  if (!timings || !notifConfig || notifConfig.sound === 'silent') return;

  const prayerKeys = [
    { key: 'Fajr', nameBn: 'ফজর', nameEn: 'Fajr', enabled: notifConfig.fajrNotif },
    { key: 'Dhuhr', nameBn: 'যোহর', nameEn: 'Dhuhr', enabled: notifConfig.dhuhrNotif },
    { key: 'Asr', nameBn: 'আসরের', nameEn: 'Asr', enabled: notifConfig.asrNotif },
    { key: 'Maghrib', nameBn: 'মাগরিব', nameEn: 'Maghrib', enabled: notifConfig.maghribNotif },
    { key: 'Isha', nameBn: 'ইশা', nameEn: 'Isha', enabled: notifConfig.ishaNotif }
  ];

  if (Capacitor.isNativePlatform()) {
    try {
      // Ensure notification channels are registered on Android
      await setupNotificationChannels();

      // Cancel previous scheduled notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications && pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const notificationsToSchedule = [];
      let idCounter = 1;
      const now = new Date();

      prayerKeys.forEach(p => {
        if (!p.enabled || !timings[p.key]) return;

        const [hStr, mStr] = timings[p.key].split(':');
        let pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hStr), parseInt(mStr), 0);

        // If prayer time for today has already passed, schedule for tomorrow
        if (pDate <= now) {
          pDate.setDate(pDate.getDate() + 1);
        }

        const prayerName = lang === 'bn' ? p.nameBn : p.nameEn;
        const title = lang === 'bn' ? `${prayerName} সালাতের সময় হয়েছে` : `Time for ${prayerName} Prayer`;
        const body = lang === 'bn' ? `সালাত আদায় করুন` : `It's time to perform your ${prayerName} prayer.`;

        let soundFile = 'makkah.mp3';
        if (notifConfig.sound === 'bird_chirp') soundFile = 'bird_chirp.wav';

        notificationsToSchedule.push({
          title,
          body,
          id: idCounter++,
          schedule: { at: pDate },
          sound: soundFile,
          channelId: notifConfig.sound === 'bird_chirp' ? 'bird_chirp' : 'makkah',
          smallIcon: 'ic_stat_icon',
          iconColor: '#166534'
        });
      });

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      }
    } catch (e) {
      console.warn("Schedule native notifications failed", e);
    }
  }
};



