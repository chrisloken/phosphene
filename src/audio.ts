export type MicStatus = "idle" | "live" | "denied" | "missing";

export type AudioHandle = {
  muted: boolean;
  micStatus: MicStatus;
  start: () => Promise<void>;
  startMic: () => Promise<MicStatus>;
  tick: () => number;
  toggleMuted: () => boolean;
  captureStream: () => MediaStream | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    brown = clamp(brown + white * 0.02, -1, 1);
    data[i] = white * 0.72 + brown * 0.28;
  }
  return buffer;
}

export function createAudio(): AudioHandle {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let localOut: GainNode | null = null;
  let sendDest: MediaStreamAudioDestinationNode | null = null;
  let gate: GainNode | null = null;
  let analyser: AnalyserNode | null = null;
  let analyserData: Float32Array<ArrayBuffer> | null = null;
  let started = false;
  let muted = false;
  let micStatus: MicStatus = "idle";
  let nextGlitch = 0;
  let nextCrackle = 0;
  let nextScratch = 0;
  let crackleGain: GainNode | null = null;
  let scratchGain: GainNode | null = null;

  const handle: AudioHandle = {
    get muted() {
      return muted;
    },
    get micStatus() {
      return micStatus;
    },
    async start() {
      if (started) {
        await ctx?.resume();
        return;
      }
      const audio = new AudioContext();
      ctx = audio;
      await audio.resume();

      master = audio.createGain();
      master.gain.value = 0;
      const limiter = audio.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 6;
      limiter.ratio.value = 2.2;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.22;
      localOut = audio.createGain();
      localOut.gain.value = muted ? 0 : 1;
      sendDest = audio.createMediaStreamDestination();
      master.connect(limiter);
      limiter.connect(localOut);
      localOut.connect(audio.destination);
      limiter.connect(sendDest);

      const pad = audio.createGain();
      pad.gain.value = 0.78;
      const padFilter = audio.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 1400;
      padFilter.Q.value = 0.55;
      pad.connect(padFilter);
      padFilter.connect(master);

      const filterLfo = audio.createOscillator();
      filterLfo.type = "sine";
      filterLfo.frequency.value = 0.037;
      const filterDepth = audio.createGain();
      filterDepth.gain.value = 420;
      filterLfo.connect(filterDepth);
      filterDepth.connect(padFilter.frequency);
      filterLfo.start();

      const breath = audio.createOscillator();
      breath.type = "sine";
      breath.frequency.value = 0.08;
      const breathGain = audio.createGain();
      breathGain.gain.value = 0.1;
      breath.connect(breathGain);
      breathGain.connect(pad.gain);
      breath.start();

      const chord = [55, 82.41, 110, 164.81, 220, 329.63];
      const types: OscillatorType[] = ["sine", "sine", "triangle", "sine", "sine", "triangle"];
      chord.forEach((freq, index) => {
        const osc = audio.createOscillator();
        osc.type = types[index] ?? "sine";
        osc.frequency.value = freq;
        osc.detune.value = (index % 2 === 0 ? -5 : 6) + index;
        const voice = audio.createGain();
        voice.gain.value = index < 3 ? 0.65 : 0.4;
        const lfo = audio.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.05 + index * 0.011;
        const lfoGain = audio.createGain();
        lfoGain.gain.value = 6 + index;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.detune);
        osc.connect(voice);
        voice.connect(pad);
        osc.start();
        lfo.start();
      });

      const noise = audio.createBufferSource();
      noise.buffer = noiseBuffer(audio, 3);
      noise.loop = true;

      const rumble = audio.createBiquadFilter();
      rumble.type = "lowpass";
      rumble.frequency.value = 140;
      const rumbleGain = audio.createGain();
      rumbleGain.gain.value = 0.26;
      noise.connect(rumble);
      rumble.connect(rumbleGain);
      rumbleGain.connect(master);

      const hiss = audio.createBiquadFilter();
      hiss.type = "highpass";
      hiss.frequency.value = 7200;
      const hissGain = audio.createGain();
      hissGain.gain.value = 0.16;
      noise.connect(hiss);
      hiss.connect(hissGain);
      hissGain.connect(master);

      const crackleFilter = audio.createBiquadFilter();
      crackleFilter.type = "bandpass";
      crackleFilter.frequency.value = 2400;
      crackleFilter.Q.value = 1.4;
      const crackle = audio.createGain();
      crackle.gain.value = 0.0001;
      noise.connect(crackleFilter);
      crackleFilter.connect(crackle);
      crackle.connect(master);

      const scratchFilter = audio.createBiquadFilter();
      scratchFilter.type = "bandpass";
      scratchFilter.frequency.value = 1600;
      scratchFilter.Q.value = 2.2;
      const scratch = audio.createGain();
      scratch.gain.value = 0.0001;
      noise.connect(scratchFilter);
      scratchFilter.connect(scratch);
      scratch.connect(master);

      noise.start();
      crackleGain = crackle;
      scratchGain = scratch;

      const now = audio.currentTime;
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 1.2);

      started = true;
      nextGlitch = now + 3 + Math.random() * 5;
      nextCrackle = now + 0.2;
      nextScratch = now + 4 + Math.random() * 4;
    },
    async startMic() {
      if (!ctx || !master) {
        await handle.start();
      }
      if (!ctx || !master) {
        micStatus = "missing";
        return micStatus;
      }
      if (micStatus === "live") {
        return micStatus;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        micStatus = "missing";
        return micStatus;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        const source = ctx.createMediaStreamSource(stream);
        const hipass = ctx.createBiquadFilter();
        hipass.type = "highpass";
        hipass.frequency.value = 90;
        analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.6;
        analyserData = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));
        gate = ctx.createGain();
        gate.gain.value = 1;
        const delay = ctx.createDelay(4);
        delay.delayTime.value = 1.72;
        const loopFilter = ctx.createBiquadFilter();
        loopFilter.type = "lowpass";
        loopFilter.frequency.value = 1800;
        loopFilter.Q.value = 0.4;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.62;
        const wet = ctx.createGain();
        wet.gain.value = 1.15;
        const dry = ctx.createGain();
        dry.gain.value = 1;
        source.connect(hipass);
        hipass.connect(analyser);
        analyser.connect(gate);
        gate.connect(delay);
        gate.connect(dry);
        delay.connect(loopFilter);
        loopFilter.connect(feedback);
        feedback.connect(delay);
        delay.connect(wet);
        wet.connect(master);
        dry.connect(master);
        micStatus = "live";
        return micStatus;
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        micStatus = name === "NotAllowedError" || name === "PermissionDeniedError" ? "denied" : "missing";
        return micStatus;
      }
    },
    tick() {
      if (!ctx || !master || !started) {
        return 0;
      }
      const t = ctx.currentTime;
      if (crackleGain) {
        while (nextCrackle < t + 0.05) {
          const amp = 0.38 + Math.random() * 0.37;
          const dur = 0.006 + Math.random() * 0.03;
          crackleGain.gain.setValueAtTime(0.0001, nextCrackle);
          crackleGain.gain.linearRampToValueAtTime(amp, nextCrackle + 0.001);
          crackleGain.gain.exponentialRampToValueAtTime(0.0001, nextCrackle + dur);
          nextCrackle += 0.08 + Math.random() * 0.9;
        }
      }
      if (scratchGain && t >= nextScratch) {
        const dur = 0.05 + Math.random() * 0.12;
        scratchGain.gain.cancelScheduledValues(t);
        scratchGain.gain.setValueAtTime(0.0001, t);
        scratchGain.gain.linearRampToValueAtTime(0.45 + Math.random() * 0.3, t + 0.01);
        scratchGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        nextScratch = t + 4 + Math.random() * 8;
      }
      if (t >= nextGlitch) {
        fireGlitch(ctx, master, t);
        nextGlitch = t + 3 + Math.random() * 8;
      }
      return tickMic();
    },
    toggleMuted() {
      muted = !muted;
      if (localOut && ctx) {
        localOut.gain.cancelScheduledValues(ctx.currentTime);
        localOut.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.08);
      }
      return muted;
    },
    captureStream() {
      return sendDest?.stream ?? null;
    },
  };

  function fireGlitch(audio: AudioContext, dest: AudioNode, at: number): void {
    const osc = audio.createOscillator();
    osc.type = Math.random() > 0.5 ? "square" : "sawtooth";
    osc.frequency.value = 120 + Math.random() * 1400;
    const g = audio.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.4 + Math.random() * 0.3, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03 + Math.random() * 0.07);
    const crush = audio.createWaveShaper();
    crush.curve = makeCrushCurve();
    osc.connect(crush);
    crush.connect(g);
    g.connect(dest);
    osc.start(at);
    osc.stop(at + 0.16);
  }

  function tickMic(): number {
    if (!analyser || !ctx || !analyserData) {
      return 0;
    }
    analyser.getFloatTimeDomainData(analyserData);
    let sum = 0;
    for (let i = 0; i < analyserData.length; i++) {
      const s = analyserData[i];
      sum += s * s;
    }
    const rms = Math.sqrt(sum / analyserData.length);
    return clamp(rms * 4, 0, 1);
  }

  return handle;
}

function makeCrushCurve(): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  const steps = 6;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.round(x * steps) / steps;
  }
  return curve;
}
