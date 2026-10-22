// Original roulette cues, synthesized locally without downloads or external audio.
export function createRouletteAudio(createContext: () => AudioContext = () => new window.AudioContext()) {
  let context: AudioContext | null = null, master: GainNode | null = null, noise: AudioBuffer | null = null
  let enabled = false, volume = 0, disposed = false, lastTick = -Infinity
  let spinSource: AudioBufferSourceNode | null = null, spinGain: GainNode | null = null
  const voices = new Map<AudioScheduledSourceNode, AudioNode[]>()

  function release(source: AudioScheduledSourceNode) {
    source.onended = null
    const nodes = voices.get(source) ?? []
    voices.delete(source)
    for (const node of [source, ...nodes]) { try { node.disconnect() } catch { /* Already disconnected. */ } }
  }
  function track<T extends AudioScheduledSourceNode>(source: T, nodes: AudioNode[]) {
    voices.set(source, nodes); source.onended = () => release(source)
    return source
  }
  function stop() {
    for (const source of voices.keys()) {
      try { source.stop() } catch { /* An ended source may already be stopping. */ }
      release(source)
    }
    spinSource = null; spinGain = null
  }
  function stopSpin() {
    if (!context || !spinSource || !spinGain) return
    const now = context.currentTime
    spinGain.gain.cancelScheduledValues(now)
    spinGain.gain.setTargetAtTime(0, now, .015)
    try { spinSource.stop(now + .07) } catch { /* The scheduled spin may have ended. */ }
    spinSource = null; spinGain = null
  }
  function play(run: (audio: AudioContext, now: number) => void) {
    if (disposed || !enabled || volume <= 0 || (typeof document !== 'undefined' && document.hidden)) return
    try {
      if (!context || context.state === 'closed') {
        context = createContext(); master = context.createGain()
        master.gain.value = volume * .65; master.connect(context.destination)
        noise = context.createBuffer(1, Math.ceil(context.sampleRate * .5), context.sampleRate)
        const samples = noise.getChannelData(0)
        let seed = 72391
        for (let index = 0; index < samples.length; index++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
          samples[index] = seed / 0x80000000 - 1
        }
      }
      if (context.state === 'suspended') void context.resume().catch(stop)
      run(context, context.currentTime)
    } catch { stop() } // Audio restrictions never block a roll.
  }
  function tone(audio: AudioContext, start: number, frequency: number, duration: number, peak: number, type: OscillatorType = 'sine') {
    const gain = audio.createGain(), oscillator = track(audio.createOscillator(), [gain])
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + .008)
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
    oscillator.connect(gain); gain.connect(master!)
    oscillator.start(start); oscillator.stop(start + duration + .015)
  }
  return {
    configure(nextEnabled: boolean, nextVolume: number) {
      enabled = Boolean(nextEnabled); volume = Number.isFinite(nextVolume) ? Math.max(0, Math.min(1, nextVolume)) : 0
      if (!enabled || !volume) stop()
      if (context && master && context.state !== 'closed') {
        master.gain.cancelScheduledValues(context.currentTime)
        master.gain.setTargetAtTime(enabled ? volume * .65 : 0, context.currentTime, .012)
      }
    },
    start(duration = 3.6) {
      play((audio, now) => {
        stop(); lastTick = -Infinity
        const filter = audio.createBiquadFilter(), gain = audio.createGain()
        const source = track(audio.createBufferSource(), [filter, gain])
        source.buffer = noise; source.loop = true
        filter.type = 'lowpass'; filter.Q.value = .5
        filter.frequency.setValueAtTime(1700, now)
        filter.frequency.exponentialRampToValueAtTime(280, now + duration)
        gain.gain.setValueAtTime(.0001, now)
        gain.gain.exponentialRampToValueAtTime(.055, now + .08)
        gain.gain.exponentialRampToValueAtTime(.0001, now + duration)
        source.connect(filter); filter.connect(gain); gain.connect(master!)
        spinSource = source; spinGain = gain
        source.start(now); source.stop(now + duration + .1)
      })
    },
    tick(progress: number) {
      play((audio, now) => {
        if (now - lastTick < .055) return
        lastTick = now
        const speed = 1 - Math.max(0, Math.min(1, progress))
        const filter = audio.createBiquadFilter(), gain = audio.createGain()
        const source = track(audio.createBufferSource(), [filter, gain])
        source.buffer = noise; filter.type = 'bandpass'; filter.Q.value = .7
        filter.frequency.setValueAtTime(1700 + speed * 600, now)
        gain.gain.setValueAtTime(.0001, now)
        gain.gain.exponentialRampToValueAtTime(.18, now + .002)
        gain.gain.exponentialRampToValueAtTime(.0001, now + .027)
        source.connect(filter); filter.connect(gain); gain.connect(master!)
        source.start(now); source.stop(now + .035)
        tone(audio, now, 320 + speed * 130, .045, .035, 'triangle')
      })
    },
    win() {
      stopSpin()
      play((audio, now) => {
        for (const [index, frequency] of [523.25, 659.25, 783.99, 1046.5].entries()) {
          const start = now + .025 + index * .075
          tone(audio, start, frequency, index === 3 ? .65 : .4, .13)
          tone(audio, start, frequency * 2, .22, .022)
        }
      })
    },
    select(selected = true) {
      play((audio, now) => {
        tone(audio, now, selected ? 610 : 440, .085, .095, 'triangle')
        tone(audio, now, selected ? 915 : 330, .055, .018)
      })
    },
    stop,
    dispose() {
      disposed = true; stop(); master?.disconnect(); master = null; noise = null
      if (context && context.state !== 'closed') void context.close().catch(() => undefined)
      context = null
    },
  }
}
