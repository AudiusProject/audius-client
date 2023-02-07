/* globals Audio, Hls, Event, Blob */
/* This file is copied straightaway from Audius dapp */

import Hls from "hls.js";

import fetchCID from "../util/fetchCID";
import { generateM3U8, generateM3U8Variants } from "../util/hlsUtil";

const FADE_IN_EVENT = new window.Event("fade-in");
const FADE_OUT_EVENT = new window.Event("fade-out");
const VOLUME_CHANGE_BASE = 10;
const BUFFERING_DELAY_MILLISECONDS = 500;

// This calculation comes from chrome's audio SourceBuffer max of
// 12MB. Each segment is ~260KB, so we can only fit ~ 47 segments in memory.
// Read more: https://github.com/w3c/media-source/issues/172
const MAX_SEGMENTS = 47;
const AVERAGE_SEGMENT_DURATION = 6; /* seconds */
const MAX_BUFFER_LENGTH = MAX_SEGMENTS * AVERAGE_SEGMENT_DURATION;

// Account for possibility of no-window in Preact pre-render
const IS_CHROME_LIKE =
  typeof window !== "undefined" &&
  /Chrome/.test(navigator.userAgent) &&
  /Google Inc/.test(navigator.vendor);

// Custom fragment loader for HLS that utilizes the audius CID resolver.
class fLoader extends Hls.DefaultConfig.loader {
  getFallbacks = () => [];

  constructor(config) {
    super(config);
    const load = this.load.bind(this);
    this.load = function(context, config, callbacks) {
      const segmentUrl = context.frag.relurl;
      if (!segmentUrl.startsWith("blob")) {
        fetchCID(segmentUrl, this.getFallbacks(), /* cache */ false).then(
          resolved => {
            const updatedContext = { ...context, url: resolved };
            load(updatedContext, config, callbacks);
          }
        );
      } else {
        load(context, config, callbacks);
      }
    };
  }
}

const HlsConfig = {
  maxBufferLength: MAX_BUFFER_LENGTH,
  fLoader: fLoader
};

class AudioStream {
  constructor() {
    this.audio = new Audio();
    // Connect this.audio to the window so that 3P's can interact with it.
    window.audio = this.audio;

    this.audioCtx = null;
    this.source = null;
    this.gainNode = null;

    // Because we use a media stream, we need the duration from an
    // outside source. Audio.duration returns Infinity until all the streams are
    // concatenated together.
    this.duration = 0;
    this.bufferingTimeout = null;
    this.buffering = false;
    this.isRecordedListened = false;

    this.concatBufferInterval = null;
    this.nextBufferIndex = 0;
    // Keeps a (monotonic) unique id for each load, so we know when to cancel the previous load.
    this.loadCounter = 0;

    this.recordListenedTime = 5; /* seconds */
    // Event listeners
    this.endedListener = null;
    this.waitingListener = null;
    this.canPlayListener = null;

    this.hls = null;
  }

  _initContext = () => {
    this.isRecordedListened = false;

    this.audio.addEventListener("canplay", () => {
      if (!this.audioCtx) {
        // Set up WebAudio API handles
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.connect(this.audioCtx.destination);
        this.source = this.audioCtx.createMediaElementSource(this.audio);
        this.source.connect(this.gainNode);
      }

      clearTimeout(this.bufferingTimeout);
      this.buffering = false;
    });
  };

  load = (
    segments,
    onEnd,
    prefetchedSegments = [],
    gateways = [],
    info = { title: "", artist: "" }
  ) => {
    this._initContext();

    if (Hls.isSupported()) {
      // Clean up any existing hls.
      if (this.hls) {
        this.hls.destroy();
      }
      // Hls.js via MediaExtensions
      const m3u8 = generateM3U8(segments, prefetchedSegments);
      class creatorFLoader extends fLoader {
        getFallbacks = () => gateways;
      }
      const hlsConfig = { ...HlsConfig, fLoader: creatorFLoader };
      this.hls = new Hls(hlsConfig);
      const m3u8Blob = new Blob([m3u8], {
        type: "application/vnd.apple.mpegURL"
      });
      const url = URL.createObjectURL(m3u8Blob);
      this.hls.loadSource(url);
      this.hls.attachMedia(this.audio);
    } else {
      // Native HLS (ios Safari)
      const m3u8Gateways = [gateways[0]]
      const m3u8 = generateM3U8Variants(
        segments,
        prefetchedSegments,
        m3u8Gateways
      );

      this.audio.src = m3u8;
      this.audio.title =
        info.title && info.artist
          ? `${info.title} by ${info.artist}`
          : "Audius";
    }

    this.duration = segments.reduce(
      (duration, segment) => duration + parseFloat(segment.duration),
      0
    );

    // Set audio listeners.
    this.audio.removeEventListener("ended", this.endedListener);
    this.endedListener = () => {
      onEnd();
    };
    this.audio.addEventListener("ended", this.endedListener);

    this.audio.removeEventListener("waiting", this.waitingListener);
    this.waitingListener = () => {
      this.bufferingTimeout = setTimeout(() => {
        this.buffering = true;
      }, BUFFERING_DELAY_MILLISECONDS);
    };
    this.audio.addEventListener("waiting", this.waitingListener);
  };

  play = () => {
    // In case we haven't faded out the last pause, pause again and
    // clear our listener for the end of the pause fade.
    this.audio.removeEventListener("fade-out", this._pauseInternal);
    if (this.audio.currentTime !== 0) {
      this._fadeIn();
    } else if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(1, 0);
    }

    // This is a very nasty "hack" to fix a bug in chrome-like webkit browsers.
    // Calling a traditional `audio.pause()` / `play()` and switching tabs leaves the
    // AudioContext in a weird state where after the browser tab enters the background,
    // and then comes back into the foreground, the AudioContext gives misinformation.
    // Weirdly, the audio's playback rate is no longer maintained on resuming playback after a pause.
    // Though the audio itself claims audio.playbackRate = 1.0, the actual resumed speed
    // is nearish 0.9.
    //
    // In chrome like browsers (opera, edge), we disconnect and reconnect the source node
    // instead of playing and pausing the audio element itself, which seems to fix this issue
    // without any side-effects (though this behavior could change?).
    //
    // Another solution to this problem is calling `this.audioCtx.suspend()` and `resume()`,
    // however, that doesn't play nicely with Analyser nodes (e.g. visualizer) because it
    // freezes in place rather than naturally "disconnecting" it from audio.
    //
    // Web resources on this problem are limited (or none?), but this is a start:
    // https://stackoverflow.com/questions/11506180/web-audio-api-resume-from-pause
    if (this.audioCtx && IS_CHROME_LIKE) {
      this.source.connect(this.gainNode);
    }

    const promise = this.audio.play();
    if (promise) {
      promise.catch(_ => {
        // Let pauses interrupt plays (as the user could be rapidly skipping through tracks).
      });
    }
  };

  pause = () => {
    clearInterval(this.timeout);
    this.audio.addEventListener("fade-out", this._pauseInternal);
    this._fadeOut();
  };

  _pauseInternal = () => {
    if (this.audioCtx && IS_CHROME_LIKE) {
      // See comment above in the `play()` method.
      this.source.disconnect();
    } else {
      this.audio.pause();
    }
  };

  stop = () => {
    this.audio.pause();
    // Normally canplaythrough should be required to set currentTime, but in the case
    // of setting curtingTime to zero, pushing to the end of the event loop works.
    // This fixes issues in Firefox, in particular `the operation was aborted`
    setTimeout(() => {
      this.audio.currentTime = 0;
    }, 0);
  };

  isPlaying = () => {
    return !this.audio.paused;
  };

  isPaused = () => {
    return this.audio.paused;
  };

  isBuffering = () => {
    return this.buffering;
  };

  getDuration = () => {
    return this.duration;
  };

  getPosition = () => {
    return this.audio.currentTime;
  };

  seek = seconds => {
    this.audio.currentTime = seconds;
  };

  setVolume = value => {
    this.audio.volume =
      (Math.pow(VOLUME_CHANGE_BASE, value) - 1) / (VOLUME_CHANGE_BASE - 1);
  };

  _fadeIn = () => {
    if (this.gainNode) {
      const fadeTime = 320;
      setTimeout(() => {
        this.audio.dispatchEvent(FADE_IN_EVENT);
      }, fadeTime);
      this.gainNode.gain.exponentialRampToValueAtTime(
        1,
        this.audioCtx.currentTime + fadeTime / 1000.0
      );
    } else {
      this.audio.dispatchEvent(FADE_IN_EVENT);
    }
  };

  _fadeOut = () => {
    if (this.gainNode) {
      const fadeTime = 200;
      setTimeout(() => {
        this.audio.dispatchEvent(FADE_OUT_EVENT);
      }, fadeTime);
      this.gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + fadeTime / 1000.0
      );
    } else {
      this.audio.dispatchEvent(FADE_OUT_EVENT);
    }
  };
}

export default AudioStream;
