/* Brücke zu den nativen Bausteinen der App-Hülle (Capacitor).
   Wird mit „npm run native“ zu www/vendor/native.js gebündelt. Im Browser greifen die Web-Fallbacks. */
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

const isNative = Capacitor.isNativePlatform();

window.Native = {
  isNative,
  platform: Capacitor.getPlatform(),
  /** Sicherung des App-Speichers in den UserDefaults (iOS leert den Web-Speicher unter Umständen). */
  prefs: {
    get: async key => (isNative ? (await Preferences.get({ key })).value : null),
    set: async (key, value) => { if (isNative) await Preferences.set({ key, value }); },
    remove: async key => { if (isNative) await Preferences.remove({ key }); }
  },
  /** Datei über das Teilen-Menü weitergeben (AirDrop, Dateien, Mail …). */
  async shareText(fileName, text, title) {
    if (!isNative) return false;
    const res = await Filesystem.writeFile({ path: fileName, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title, files: [res.uri] });
    return true;
  },
  async speak(text, lang) {
    if (!isNative) return false;
    try { await TextToSpeech.stop(); } catch (e) { /* nichts zu stoppen */ }
    await TextToSpeech.speak({ text, lang, rate: 0.95, category: 'playback' });
    return true;
  },
  async stopSpeak() { if (isNative) { try { await TextToSpeech.stop(); } catch (e) { /* egal */ } } }
};
