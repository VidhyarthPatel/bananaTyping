"use client";

import { useEffect, useRef } from "react";

interface SoundPackConfig {
  sound: string;
  key_define_type: "single" | "multi";
  defines: Record<string, [number, number] | string | null>;
}

interface AudioCacheItem {
  type: "single" | "multi";
  buffer?: AudioBuffer;
  buffers?: Record<string, AudioBuffer>;
  config: SoundPackConfig;
}

const cache: Record<string, AudioCacheItem> = {};
let audioCtx: AudioContext | null = null;

let mouseClickBuffer: AudioBuffer | null = null;
let clickBufferLoadingPromise: Promise<AudioBuffer | null> | null = null;

const loadMouseClickSound = async (): Promise<AudioBuffer | null> => {
  if (mouseClickBuffer) return mouseClickBuffer;
  if (clickBufferLoadingPromise) return clickBufferLoadingPromise;

  clickBufferLoadingPromise = (async () => {
    try {
      const res = await fetch("/sounds/click-sound.wav");
      if (!res.ok) throw new Error("Failed to load mouse click sound file");
      const arrayBuffer = await res.arrayBuffer();
      const ctx = getAudioContext();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      mouseClickBuffer = buffer;
      return buffer;
    } catch (err) {
      console.error("Failed to load mouse click sound", err);
      return null;
    }
  })();

  return clickBufferLoadingPromise;
};

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

const loadSoundPack = async (packId: string): Promise<AudioCacheItem> => {
  if (cache[packId]) {
    return cache[packId];
  }

  try {
    // Fetch config.json
    const configRes = await fetch(`/sounds/${packId}/config.json`);
    if (!configRes.ok) {
      throw new Error(`Failed to load sound config for ${packId}`);
    }
    const config = (await configRes.json()) as SoundPackConfig;
    const isMulti = config.key_define_type === "multi";

    if (isMulti) {
      // Find all unique filenames in the defines mapping
      const uniqueFiles = new Set<string>();
      Object.values(config.defines).forEach((val) => {
        if (typeof val === "string") {
          uniqueFiles.add(val);
        }
      });
      // Also add the default sound if specified
      if (config.sound) {
        uniqueFiles.add(config.sound);
      }

      // Load all unique files in parallel
      const buffers: Record<string, AudioBuffer> = {};
      const ctx = getAudioContext();

      await Promise.all(
        Array.from(uniqueFiles).map(async (filename) => {
          try {
            const audioRes = await fetch(`/sounds/${packId}/${filename}`);
            if (!audioRes.ok) {
              throw new Error(`Failed to load file ${filename}`);
            }
            const arrayBuffer = await audioRes.arrayBuffer();
            const buffer = await ctx.decodeAudioData(arrayBuffer);
            buffers[filename] = buffer;
          } catch (e) {
            console.error(`Error loading multi file ${filename} in pack ${packId}`, e);
          }
        })
      );

      const item: AudioCacheItem = { type: "multi", buffers, config };
      cache[packId] = item;
      return item;
    } else {
      // Fetch the single audio file (.ogg)
      const soundFileName = config.sound || "sound.ogg";
      const audioRes = await fetch(`/sounds/${packId}/${soundFileName}`);
      if (!audioRes.ok) {
        throw new Error(`Failed to load sound file for ${packId}`);
      }
      const arrayBuffer = await audioRes.arrayBuffer();

      // Decode audio data
      const ctx = getAudioContext();
      const buffer = await ctx.decodeAudioData(arrayBuffer);

      const item: AudioCacheItem = { type: "single", buffer, config };
      cache[packId] = item;
      return item;
    }
  } catch (err) {
    console.warn(`Failed to load standard pack ${packId}, falling back to click-sound.wav`, err);

    try {
      // Fallback: Load click-sound.wav which has native support in Safari and all browsers
      const fallbackRes = await fetch("/sounds/click-sound.wav");
      if (!fallbackRes.ok) {
        throw new Error("Failed to load fallback click-sound.wav");
      }
      const arrayBuffer = await fallbackRes.arrayBuffer();
      const ctx = getAudioContext();
      const buffer = await ctx.decodeAudioData(arrayBuffer);

      // Create a mock config where all keys play the entire wav file (start: 0, duration: buffer.duration * 1000)
      const config: SoundPackConfig = {
        sound: "click-sound.wav",
        key_define_type: "single",
        defines: {}
      };

      const item: AudioCacheItem = { type: "single", buffer, config };
      cache[packId] = item;
      return item;
    } catch (fallbackErr) {
      console.error("Critical: Failed to load fallback sound", fallbackErr);
      throw fallbackErr;
    }
  }
};

const playSlice = (startMs: number, durationMs: number, buffer: AudioBuffer) => {
  try {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.8; // Default comfortable volume

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    let startTimeSec = typeof startMs === "number" && isFinite(startMs) ? startMs / 1000 : 0;
    let durationSec = typeof durationMs === "number" && isFinite(durationMs) ? durationMs / 1000 : 0.1;

    if (startTimeSec < 0 || isNaN(startTimeSec)) startTimeSec = 0;
    if (durationSec <= 0 || isNaN(durationSec)) durationSec = 0.1;

    if (buffer) {
      // Ensure we don't start beyond buffer duration
      if (startTimeSec >= buffer.duration) {
        startTimeSec = 0;
      }
      // Ensure we don't play beyond buffer duration
      if (startTimeSec + durationSec > buffer.duration) {
        durationSec = Math.max(0.01, buffer.duration - startTimeSec);
      }
    }

    source.start(0, startTimeSec, durationSec);
  } catch (err) {
    console.error("Failed to play keypress sound slice", err);
  }
};

const playKeySound = (keyCode: number, cacheItem: AudioCacheItem) => {
  const { type, buffer, buffers, config } = cacheItem;
  const define = config.defines[keyCode.toString()];

  if (type === "multi") {
    // Look up filename
    let filename = typeof define === "string" ? define : null;
    if (!filename) {
      // Fallback: use default sound in config or fallback to any loaded buffer
      filename = config.sound || Object.keys(buffers || {})[0];
    }

    const targetBuffer = buffers?.[filename];
    if (targetBuffer) {
      // Play the entire buffer for this file
      playSlice(0, targetBuffer.duration * 1000, targetBuffer);
    }
  } else {
    // Single sprite sheet type
    if (!define || !Array.isArray(define)) {
      // If we are using the fallback click-sound.wav or a key is not defined:
      // Play the entire buffer length if defines mapping is empty
      if (Object.keys(config.defines).length === 0 && buffer) {
        playSlice(0, buffer.duration * 1000, buffer);
        return;
      }

      // Fallback to a default key (like code 70 for key 'F' or 32 for space)
      const fallbackDefine = config.defines["70"] || config.defines["32"];
      if (fallbackDefine && Array.isArray(fallbackDefine) && buffer) {
        playSlice(fallbackDefine[0], fallbackDefine[1], buffer);
      }
      return;
    }

    if (buffer) {
      playSlice(define[0], define[1], buffer);
    }
  }
};

export default function KeyboardSoundManager({
  soundPack,
  clickSound,
}: {
  soundPack: string;
  clickSound: string;
}) {
  const currentPackItem = useRef<AudioCacheItem | null>(null);

  // Global user interaction triggers to unlock browser Web Audio restrictions
  useEffect(() => {
    const resumeAudio = () => {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
    };
    window.addEventListener("click", resumeAudio, { once: true });
    window.addEventListener("keydown", resumeAudio, { once: true });
    return () => {
      window.removeEventListener("click", resumeAudio);
      window.removeEventListener("keydown", resumeAudio);
    };
  }, []);

  // Load sound pack when soundPack changes
  useEffect(() => {
    if (soundPack === "off") {
      currentPackItem.current = null;
      return;
    }

    let active = true;
    loadSoundPack(soundPack)
      .then((item) => {
        if (active) {
          currentPackItem.current = item;
        }
      })
      .catch((err) => {
        console.error("Error loading keyboard sound pack", err);
      });

    return () => {
      active = false;
    };
  }, [soundPack]);

  // keydown event listener
  useEffect(() => {
    if (soundPack === "off") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't play sound if modifier keys are pressed (except backspace/space)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (currentPackItem.current) {
        // Resume context on first keypress if it was suspended
        getAudioContext();
        playKeySound(e.keyCode, currentPackItem.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [soundPack]);

  // Load mouse click sound when clickSound is enabled
  useEffect(() => {
    if (clickSound === "on") {
      loadMouseClickSound();
    }
  }, [clickSound]);

  // mousedown (mouse click / trackpad click) event listener
  useEffect(() => {
    if (clickSound === "off") return;

    const handleMouseDown = () => {
      getAudioContext();
      if (mouseClickBuffer) {
        playSlice(0, mouseClickBuffer.duration * 1000, mouseClickBuffer);
      } else {
        loadMouseClickSound().then((buffer) => {
          if (buffer) {
            playSlice(0, buffer.duration * 1000, buffer);
          }
        });
      }
    };

    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [clickSound]);

  return null; // Non-presentational logic component
}
