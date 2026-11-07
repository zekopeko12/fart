
const audioContext = new AudioContext();

const button = document.getElementById("play");

let audioBuffer = null;

async function loadAudio() {
    button.disabled = true;

    try {
        const response = await fetch("audio/original.mp3");

        if (!response.ok) {
            throw new Error("Could not load audio file");
        }

        const arrayBuffer = await response.arrayBuffer();

        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        button.disabled = false;

    } catch (error) {
        console.error("Audio loading error:", error);
        button.textContent = "!";
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomEffects() {
    const effects = [];

    const availableEffects = [
        "lowpass",
        "highpass",
        "echo",
        "distortion"
    ];

    const count = Math.floor(random(1, 5));

    while (effects.length < count) {
        const effect = availableEffects[
            Math.floor(Math.random() * availableEffects.length)
        ];

        if (!effects.includes(effect)) {
            effects.push(effect);
        }
    }

    return effects;
}

function playAudio() {
    if (!audioBuffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = random(0.5, 2.5);

    let lastNode = source;
    const effects = randomEffects();

    effects.forEach(effect => {

        if (effect === "lowpass") {
            const filter = audioContext.createBiquadFilter();

            filter.type = "lowpass";
            filter.frequency.value = random(300, 3000);

            lastNode.connect(filter);
            lastNode = filter;
        }
        if (effect === "highpass") {
            const filter = audioContext.createBiquadFilter();

            filter.type = "highpass";
            filter.frequency.value = random(100, 2000);

            lastNode.connect(filter);
            lastNode = filter;
        }
        if (effect === "echo") {
            const delay = audioContext.createDelay();

            delay.delayTime.value = random(0.1, 0.7);

            const feedback = audioContext.createGain();
            feedback.gain.value = 0.3;

            lastNode.connect(delay);
            delay.connect(feedback);
            feedback.connect(delay);

            lastNode = delay;
        }
        if (effect === "distortion") {
            const distortion = audioContext.createWaveShaper();

            const curve = new Float32Array(44100);

            for (let i = 0; i < curve.length; i++) {
                const x = (i * 2) / curve.length - 1;
                curve[i] = Math.tanh(x * random(5, 20));
            }

            distortion.curve = curve;

            lastNode.connect(distortion);
            lastNode = distortion;
        }
    });

    lastNode.connect(audioContext.destination);

    source.start();
}

button.addEventListener("click", async () => {
    await audioContext.resume();

    playAudio();
});

button.disabled = true;
loadAudio();
