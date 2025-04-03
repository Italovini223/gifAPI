# API de Geração de GIFs

Esta API permite que os usuários façam upload de vídeos e os convertam em GIFs. Os GIFs gerados são armazenados no Backblaze B2 Cloud Storage, e a API retorna uma URL pública para o GIF.

## Funcionalidades
- Upload de arquivos de vídeo (até 50MB).
- Conversão de vídeos em GIFs (duração máxima: 6 segundos).
- Armazenamento dos GIFs no Backblaze B2 Cloud Storage.
- Retorno de uma URL pública para o GIF gerado.

---

## Deploy

A API foi desenvolvida para rodar em um servidor Fastify. Caso a API já esteja em deploy, utilize a URL base fornecida pelo ambiente de deploy. Por exemplo:

```
https://sua-api-em-deploy.com
```

Se desejar rodar a API localmente, siga os passos abaixo:

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd gifAPI
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto e configure as seguintes variáveis:
   ```env
   BACKBLAZE_ACCOUNT_ID=<seu-account-id>
   BACKBLAZE_APPLICATION_KEY=<seu-application-key>
   BACKBLAZE_BUCKET_ID=<seu-bucket-id>
   BACKBLAZE_BUCKET_NAME=<seu-bucket-name>
   BACKBLAZE_API_URL=https://api.backblazeb2.com
   BACKBLAZE_DOWNLOAD_URL=<sua-download-url>
   ```

4. Inicie o servidor:
   ```bash
   npm run start
   ```

5. A API estará disponível em:
   ```
   http://localhost:3333
   ```

---

## Como Usar

### Endpoint: Gerar GIF

**URL:** `/gif/generate`  
**Método:** `POST`  
**Content-Type:** `multipart/form-data`  
**Descrição:** Faz upload de um arquivo de vídeo para gerar um GIF.

### Exemplo de Requisição

Utilize uma ferramenta como [Postman](https://www.postman.com/) ou `curl` para realizar a requisição.

#### Usando `curl`:
```bash
curl -X POST https://sua-api-em-deploy.com/gif/generate \
  -H "Content-Type: multipart/form-data" \
  -F "file=@caminho/para/seu/video.mp4"
```

#### Usando Postman:
1. Configure o método como `POST`.
2. Defina a URL como `https://sua-api-em-deploy.com/gif/generate`.
3. Na aba "Body", selecione "form-data".
4. Adicione uma chave chamada `file` e faça o upload do arquivo de vídeo.

### Exemplo de Resposta

Em caso de sucesso, a API retornará uma resposta JSON com a URL pública do GIF gerado:
```json
{
  "gifUrl": "https://sua-download-url.com/file/seu-bucket-name/nuvempro_static/customer_files/999/app_dp/seu-gif-file.gif"
}
```

Em caso de erro, a API retornará uma mensagem de erro apropriada:
```json
{
  "error": "Nenhum arquivo enviado"
}
```

---

## Observações
- Certifique-se de que o arquivo de vídeo tenha menos de 50MB.
- O GIF gerado terá uma duração máxima de 6 segundos.
- A API utiliza o Backblaze B2 Cloud Storage para armazenar os GIFs.

Para mais informações ou dúvidas, entre em contato com o responsável pela API.