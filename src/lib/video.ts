// İş videosunu telefonda (brauzerdə) yükləmədən əvvəl sıxır: qısa tərəf 720px, H.264 (MP4), ≤ 1,8 Mbps + səs 96 kbps.
// 2 dəqiqəlik telefon videosu (1080p ~240 MB) ~28 MB olur. WebCodecs işlədilir (mediabunny), server lazım deyil.
// mediabunny yalnız video seçiləndə yüklənir (dinamik import): forma ağırlaşmır.

// Müddət limiti yoxdur (istifadəçi: "bir işin videosu 5–6 dəq. də ola bilər"). Fayl bucket limitinə (50 MB, 0089) sığmalıdır:
// uzun videoda bitreyt avtomatik azalır (2 dəq. → 1,8 Mbps, 6 dəq. → ~1 Mbps, 10 dəq. → ~0,6 Mbps), lazım olsa ölçü 540p/480p-yə düşür.
// R2-yə keçəndə limit qalxacaq.
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const TARGET_BYTES = 45 * 1024 * 1024; // konteyner və bitreyt sapması üçün ehtiyat
const SHORT_SIDE = 720;
const MAX_VIDEO_BITRATE = 1_800_000;
const MIN_VIDEO_BITRATE = 450_000; // bundan aşağı görüntü yararsızdır (~13 dəq.-dən uzun video)
const AUDIO_BITRATE = 96_000;

export type CompressedVideo = { file: File; originalBytes: number; bytes: number; seconds: number; width: number; height: number };

export class VideoError extends Error {}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

// Encoder (xüsusən telefonun aparat encoder-i) aşağı bitreyti həmişə saxlamır: sınaqda 0,95 Mbps hədəfində 720p ~1,7 Mbps verdi.
// Ona görə nəticə 50 MB-dan böyükdürsə, daha kiçik ölçüdə və faktiki aşmaya görə azaldılmış bitreytlə yenidən sıxılır.
const SIDES = [SHORT_SIDE, 540, 480];

export async function compressVideo(source: File, onProgress?: (p: number) => void): Promise<CompressedVideo> {
  const { ALL_FORMATS, BlobSource, BufferTarget, canEncodeVideo, Conversion, Input, Mp4OutputFormat, Output, Quality } = await import("mediabunny");
  const open = () => new Input({ source: new BlobSource(source), formats: ALL_FORMATS });

  const probe = open();
  let seconds: number, w: number, h: number;
  try {
    const track = await probe.getPrimaryVideoTrack();
    if (!track) throw new VideoError("Faylda video tapılmadı.");
    seconds = await probe.computeDuration();
    w = track.displayWidth;
    h = track.displayHeight;
  } finally {
    probe.dispose();
  }
  const fit = Math.floor((TARGET_BYTES * 8) / Math.max(seconds, 1) - AUDIO_BITRATE);
  if (fit < MIN_VIDEO_BITRATE) throw new VideoError(`Video çox uzundur (${formatSeconds(seconds)}): 50 MB-a sığmır. Videonu hissələrə bölüb ayrı-ayrı əlavə et.`);
  let bitrate = Math.min(MAX_VIDEO_BITRATE, fit);

  for (let i = 0; i < SIDES.length; i++) {
    // Qısa tərəf hədəfdən böyükdürsə kiçilir (şaquli video 720×1280, üfüqi 1280×720); kiçikdirsə ölçü qalır
    const scale = Math.min(1, SIDES[i] / Math.min(w, h));
    const width = even(w * scale), height = even(h * scale);
    const quality = new Quality({ bitrate });
    if (i === 0 && !(await canEncodeVideo("avc", { width, height, quality }))) {
      throw new VideoError("Bu brauzer videonu sıxa bilmir. Chrome və ya Safari-nin yeni versiyası lazımdır.");
    }

    const input = open();
    let buffer: ArrayBuffer | null;
    try {
      const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
      const conversion = await Conversion.init({
        input, output, showWarnings: false,
        video: { width, height, fit: "contain", codec: "avc", quality, allowTransformationMetadata: false },
        audio: { codec: "aac", quality: new Quality({ bitrate: AUDIO_BITRATE }) },
      });
      if (!conversion.isValid) throw new VideoError("Video formatı tanınmadı.");
      // Təkrar sıxmada irəliləyiş sıfırdan başlamasın: hər cəhd qalan hissəni doldurur
      conversion.onProgress = (p) => onProgress?.(Math.min(0.99, (i + p) / (i + 1)));
      await conversion.execute();
      buffer = output.target.buffer;
    } finally {
      input.dispose();
    }
    if (!buffer) throw new VideoError("Video sıxılmadı.");

    if (buffer.byteLength <= VIDEO_MAX_BYTES) {
      const name = source.name.replace(/\.[^.]+$/, "") + ".mp4";
      const file = new File([buffer], name, { type: "video/mp4" });
      return { file, originalBytes: source.size, bytes: file.size, seconds, width, height };
    }
    bitrate = Math.max(MIN_VIDEO_BITRATE, Math.floor(bitrate * (TARGET_BYTES / buffer.byteLength) * 0.9));
  }
  throw new VideoError("Video 50 MB-a sığmadı. Videonu hissələrə bölüb ayrı-ayrı əlavə et.");
}

// "238,4 MB"
export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

// "2:05"
export const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
