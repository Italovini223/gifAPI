import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// ✅ Pegando os valores corretos do .env
const B2_ACCOUNT_ID = process.env.BACKBLAZE_ACCOUNT_ID!;
const B2_APP_KEY = process.env.BACKBLAZE_APPLICATION_KEY!;
const B2_BUCKET_ID = process.env.BACKBLAZE_BUCKET_ID!;
const B2_BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME!;
const B2_API_URL = process.env.BACKBLAZE_API_URL!;
const B2_DOWNLOAD_URL = process.env.BACKBLAZE_DOWNLOAD_URL!;
const FOLDER_PATH = "nuvempro_static/customer_files/999/app_dp";

interface AuthResponse {
  apiUrl: string;
  authorizationToken: string;
}

export class BackblazeService {
  private apiUrl = "";
  private authToken = "";
  private uploadUrl = "";
  private uploadAuthToken = "";

  /**
   * 🔄 Autentica no Backblaze e obtém o authorizationToken
   */
  async authenticate(): Promise<void> {
    try {
      console.log("🔄 Autenticando no Backblaze...");
      const response = await axios.get(`${B2_API_URL}/b2api/v2/b2_authorize_account`, {
        auth: {
          username: B2_ACCOUNT_ID,
          password: B2_APP_KEY,
        },
      });

      this.apiUrl = response.data.apiUrl;
      this.authToken = response.data.authorizationToken;

      console.log("✅ Autenticação bem-sucedida!");
    } catch (error: any) {
      console.error("❌ Erro ao autenticar no Backblaze:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 🔄 Obtém a URL de upload para enviar arquivos
   */
  async getUploadUrl() {
    try {
      if (!this.authToken || !this.apiUrl) await this.authenticate();

      console.log("🔄 Obtendo URL de upload...");
      const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
        { bucketId: B2_BUCKET_ID },
        { headers: { Authorization: this.authToken } }
      );

      this.uploadUrl = response.data.uploadUrl;
      this.uploadAuthToken = response.data.authorizationToken;

      return {
        uploadUrl: this.uploadUrl,
        uploadAuthToken: this.uploadAuthToken,
      };
    } catch (error: any) {
      console.error("❌ Erro ao obter URL de upload:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 🚀 Faz upload do arquivo para o Backblaze
   * @param filePath Caminho do arquivo no sistema
   * @returns URL pública do arquivo no Backblaze
   */
  async uploadFile(filePath: string): Promise<string | null> {
    try {
      console.log("🚀 Iniciando upload do arquivo...");

      if (!this.uploadUrl || !this.uploadAuthToken) {
        const uploadData = await this.getUploadUrl();
        this.uploadUrl = uploadData.uploadUrl;
        this.uploadAuthToken = uploadData.uploadAuthToken;
      }

      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath); // ✅ Obtém apenas o nome do arquivo
      const sha1 = crypto.createHash("sha1").update(fileBuffer).digest("hex");

      // 🔹 Criar caminho dentro do Backblaze sem usar caminhos absolutos do sistema!
      const finalFilePath = `${FOLDER_PATH}/${fileName}`.replace(/\\/g, "/");

      console.log(`📂 Enviando para: ${finalFilePath}`);

      const response = await axios.post(this.uploadUrl, fileBuffer, {
        headers: {
          Authorization: this.uploadAuthToken,
          "X-Bz-File-Name": encodeURIComponent(finalFilePath),
          "Content-Type": "image/gif",
          "X-Bz-Content-Sha1": sha1,
        },
      });

      console.log("✅ Upload realizado com sucesso!");

      // 🔹 Gerar URL pública corretamente
      const publicUrl = `${B2_DOWNLOAD_URL}/file/${B2_BUCKET_NAME}/${finalFilePath}`;
      console.log("🌍 URL do arquivo:", publicUrl);

      return publicUrl;
    } catch (error: any) {
      console.error("❌ Erro no upload:", error.response?.data || error.message);
      return null;
    }
  }
}
