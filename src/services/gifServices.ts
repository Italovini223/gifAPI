import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import { MultipartFile } from "@fastify/multipart";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { promisify } from "util";

// Configurar os caminhos do ffmpeg e ffprobe
ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

// Converter o fs.writeFile para uma versão async/await
const writeFileAsync = promisify(fs.writeFile);

export class GifService {
  async generate(video: MultipartFile): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Criar pasta temporária, se não existir
        const tmpDir = path.join(__dirname, "../../tmp");
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Criar caminho para salvar o vídeo e o GIF
        const videoPath = path.join(tmpDir, `${randomUUID()}-${video.filename}`);
        const gifPath = videoPath.replace(/\.[^/.]+$/, ".gif");

        // ✅ Salvar o vídeo antes de usá-lo
        await writeFileAsync(videoPath, await video.toBuffer());

        // ✅ Verificar se o arquivo foi realmente salvo antes de processar
        if (!fs.existsSync(videoPath)) {
          return reject(new Error("O arquivo de vídeo não foi salvo corretamente."));
        }

        // ✅ Executar ffprobe para garantir que o vídeo é válido
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) {
            console.error("❌ Erro ao analisar o vídeo:", err);
            return reject(new Error("Arquivo de vídeo inválido."));
          }

          // Pegar a duração do vídeo
          const duration = metadata.format.duration || 0;
          const maxDuration = Math.min(duration, 6); // Máximo de 6 segundos

          // ✅ Converter vídeo para GIF
          ffmpeg(videoPath)
            .setStartTime("00:00:00")
            .setDuration(maxDuration) // Máximo de 6s
            .outputOptions([
              "-vf", "fps=10,scale=480:-1:flags=lanczos",
              "-loop", "0"
            ])
            .toFormat("gif")
            .save(gifPath)
            .on("end", () => {
              console.log(`✅ GIF gerado: ${gifPath}`);
              resolve(gifPath);
            })
            .on("error", (err) => {
              console.error("❌ Erro ao gerar GIF:", err);
              reject(err);
            });
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}
