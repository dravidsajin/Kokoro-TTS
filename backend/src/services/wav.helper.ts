/**
 * WAV encoding utility for raw Float32 audio samples.
 * Supports concatenating multiple chunks with optional pause silence.
 */

export function floatTo16BitPCM(floatSamples: Float32Array): Buffer {
  const buffer = Buffer.alloc(floatSamples.length * 2);
  for (let i = 0; i < floatSamples.length; i++) {
    // Clamp sample between -1 and 1
    const s = Math.max(-1, Math.min(1, floatSamples[i]));
    buffer.writeInt16LE(s < 0 ? Math.floor(s * 0x8000) : Math.floor(s * 0x7fff), i * 2);
  }
  return buffer;
}

export function createWavBuffer(samples: Float32Array, sampleRate: number = 24000): Buffer {
  const pcmBuffer = floatTo16BitPCM(samples);
  const header = Buffer.alloc(44);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const chunkSize = 36 + dataSize;

  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM subchunk size
  header.writeUInt16LE(1, 20); // Audio format 1 = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Concatenates multiple Float32Arrays with an optional silence gap (in seconds).
 */
export function concatenateAudioChunks(
  chunks: Float32Array[],
  sampleRate: number = 24000,
  silenceSeconds: number = 0.15
): Float32Array {
  if (chunks.length === 0) {
    return new Float32Array(0);
  }
  if (chunks.length === 1) {
    return chunks[0];
  }

  const silenceSamples = Math.floor(sampleRate * silenceSeconds);
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0) + (chunks.length - 1) * silenceSamples;
  const merged = new Float32Array(totalLength);

  let offset = 0;
  for (let i = 0; i < chunks.length; i++) {
    merged.set(chunks[i], offset);
    offset += chunks[i].length;
    if (i < chunks.length - 1 && silenceSamples > 0) {
      // Leaves silence (default 0 values)
      offset += silenceSamples;
    }
  }

  return merged;
}
