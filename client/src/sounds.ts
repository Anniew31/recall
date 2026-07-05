import * as Tone from 'tone'

const backgroundAudio = new Audio('/background.mp3')
backgroundAudio.loop = true
backgroundAudio.volume = 0.7

export const startBackgroundMusic = () => {
    backgroundAudio.play()
    backgroundAudio.play().catch((err) => {
        console.log('Audio blocked:', err)
    })
}

export const stopBackgroundMusic = () => {
    backgroundAudio.pause()
    backgroundAudio.currentTime = 0
}

export const playSubmit = () => {
    const synth = new Tone.Synth().toDestination()
    synth.volume.value = -10
    synth.triggerAttackRelease('C5', '0.1')
}

export const playReveal = () => {
    const synth = new Tone.PolySynth().toDestination()
    synth.volume.value = -10
    synth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '0.5')
}

export const playGameOver = () => {
    stopBackgroundMusic()
    const synth = new Tone.PolySynth().toDestination()
    synth.volume.value = -10
    synth.triggerAttackRelease(['C4', 'E4', 'G4'], '0.3')
    setTimeout(() => synth.triggerAttackRelease(['F4', 'A4', 'C5'], '0.3'), 400)
    setTimeout(() => synth.triggerAttackRelease(['G4', 'B4', 'D5', 'G5'], '0.8'), 800)
}