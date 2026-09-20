import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';

export function useAudioPlayer(audioUrl) {
  const soundRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const playbackRef = useRef({
    positionMillis: 0,
    durationMillis: 0,
    isPlaying: false,
    rate: 1,
    updatedAt: Date.now(),
  });
  const [status, setStatus] = useState({
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
  });
  const [speed, setSpeed] = useState(1);
  const [sleepMinutes, setSleepMinutes] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      if (!audioUrl) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          shouldPlay: false,
          // More frequent ticks → smoother scrubber + better sync base for auto-scroll.
          progressUpdateIntervalMillis: 100,
        },
        (next) => {
          if (!mounted || !next?.isLoaded) return;
          playbackRef.current = {
            positionMillis: next.positionMillis ?? 0,
            durationMillis: next.durationMillis ?? 0,
            isPlaying: !!next.isPlaying,
            rate: next.rate ?? playbackRef.current.rate ?? 1,
            updatedAt: Date.now(),
          };
          setStatus({
            isPlaying: !!next.isPlaying,
            positionMillis: next.positionMillis ?? 0,
            durationMillis: next.durationMillis ?? 0,
          });
        }
      );
      soundRef.current = sound;
    }

    load();

    return () => {
      mounted = false;
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      soundRef.current?.unloadAsync();
    };
  }, [audioUrl]);

  /** Wall-clock estimate between native status callbacks — keeps scroll continuous. */
  const getEstimatedPositionMillis = useCallback(() => {
    const p = playbackRef.current;
    if (!p.isPlaying || !p.durationMillis) return p.positionMillis;
    const elapsed = Date.now() - p.updatedAt;
    return Math.min(p.durationMillis, Math.max(0, p.positionMillis + elapsed * (p.rate || 1)));
  }, []);

  const toggle = async () => {
    if (!soundRef.current) return;
    const playing = status.isPlaying;
    if (playing) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
  };

  const seekBy = async (deltaMs) => {
    if (!soundRef.current) return;
    const next = Math.max(0, getEstimatedPositionMillis() + deltaMs);
    await soundRef.current.setPositionAsync(next);
  };

  const seekTo = async (ratio) => {
    if (!soundRef.current || !status.durationMillis) return;
    const next = Math.max(0, Math.min(1, ratio)) * status.durationMillis;
    await soundRef.current.setPositionAsync(next);
  };

  const changeSpeed = async () => {
    const rates = [1, 1.25, 1.5, 2];
    const idx = rates.indexOf(speed);
    const next = rates[(idx + 1) % rates.length];
    setSpeed(next);
    playbackRef.current = {
      ...playbackRef.current,
      rate: next,
      positionMillis: getEstimatedPositionMillis(),
      updatedAt: Date.now(),
    };
    if (soundRef.current) {
      await soundRef.current.setRateAsync(next, true);
    }
  };

  const setSleepTimer = (minutes) => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    setSleepMinutes(minutes);
    if (minutes > 0) {
      sleepTimerRef.current = setTimeout(async () => {
        await soundRef.current?.pauseAsync();
        setSleepMinutes(0);
      }, minutes * 60 * 1000);
    }
  };

  return {
    status,
    speed,
    sleepMinutes,
    toggle,
    seekBy,
    seekTo,
    changeSpeed,
    setSleepTimer,
    getEstimatedPositionMillis,
  };
}
