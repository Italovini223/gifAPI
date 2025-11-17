import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import { MultipartFile } from "@fastify/multipart";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { promisify } from "util";
import { BackblazeService } from "./backblazeService";

// Configurar os caminhos do ffmpeg e ffprobe
ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

// Converter o fs.writeFile para uma versão async/await
const writeFileAsync = promisify(fs.writeFile);

type VideoInput = MultipartFile | { filename: string; buffer: Buffer };

export class GifService {
  private backblazeService = new BackblazeService();

  async generate(video: VideoInput, app: string, empresaId: bigint | number | string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Criar pasta temporária, se não existir
        const tmpDir = path.join(process.cwd(), "tmp");
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Criar caminho para salvar o vídeo e o GIF
        const videoPath = path.join(tmpDir, `${randomUUID()}-${video.filename}`);
        const gifPath = videoPath.replace(/\.[^/.]+$/, ".gif");

        // ✅ Salvar o vídeo antes de usá-lo
        const buffer = (video as any).buffer ? (video as any).buffer as Buffer : await (video as MultipartFile).toBuffer();
        await writeFileAsync(videoPath, buffer);

        // ✅ Verificar se o arquivo foi realmente salvo antes de processar
        if (!fs.existsSync(videoPath)) {
          return reject(new Error("O arquivo de vídeo não foi salvo corretamente."));
        }

        // ✅ Executar ffprobe para garantir que o vídeo é válido
        ffmpeg.ffprobe(videoPath, async (err, metadata) => {
          if (err) {
            console.error("❌ Erro ao analisar o vídeo:", err);
            return reject(new Error("Arquivo de vídeo inválido."));
          }

          // Pegar a duração do vídeo
          const duration = Number(metadata.format.duration ?? 0);
          let maxDuration = Math.min(isFinite(duration) && duration > 0 ? duration : 6, 6); // fallback para 6s quando não disponível


          // ✅ Converter vídeo para GIF
          const command = ffmpeg(videoPath)
            .setStartTime("00:00:00")
            .setDuration(maxDuration)
            .outputOptions([
              "-vf", "fps=10,scale=480:-1:flags=lanczos",
              "-loop", "0"
            ])
            .toFormat("gif")
            .on("end", async () => {

              // ✅ Upload do GIF para o Backblaze
              const gifUrl = await this.backblazeService.uploadFile(gifPath, app, empresaId);
              
              // Excluir arquivos temporários
              fs.unlinkSync(videoPath);
              fs.unlinkSync(gifPath);

              if (gifUrl) {
                resolve(gifUrl);
              } else {
                reject(new Error("Erro ao fazer upload do GIF para o Backblaze"));
              }
            })
            .on("error", (err) => {
              console.error("❌ Erro ao gerar GIF:", err);
              try { if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); } catch {}
              try { if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath); } catch {}
              reject(err);
            });

          command.save(gifPath);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}
