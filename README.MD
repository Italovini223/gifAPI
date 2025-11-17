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
**Descrição:** Faz upload de um arquivo de vídeo para gerar um GIF. Agora é obrigatório enviar também os campos `app` e `empresa_id` para definir o diretório dentro do Backblaze.

#### Campos multipart obrigatórios
| Campo        | Tipo      | Descrição                                                                 |
|--------------|-----------|---------------------------------------------------------------------------|
| `video`      | file      | Arquivo de vídeo (mp4, mov, etc.) que será convertido em GIF              |
| `app`        | string    | Identificador da aplicação (ex: `app_vd`)                                 |
| `empresa_id` | inteiro   | ID numérico da empresa (ex: `168`)                                        |

O GIF será salvo no Backblaze em:  
```
{BACKBLAZE_ROOT_PATH}/{empresa_id}/{app}/{nome_do_arquivo}.gif
```
Por padrão `BACKBLAZE_ROOT_PATH` é `nuvempro_static/customer_files` (pode ser alterado via variável de ambiente `BACKBLAZE_ROOT_PATH`).

### Exemplo de Requisição

Utilize uma ferramenta como [Postman](https://www.postman.com/) ou `curl` para realizar a requisição.

#### Usando `curl` (Windows PowerShell):
```powershell
curl -X POST http://localhost:3333/gif/generate `
   -H "Content-Type: multipart/form-data" `
   -F "video=@C:/Users/SeuUsuario/Downloads/video_teste.mov" `
   -F "app=app_sc" `
   -F "empresa_id=333"
```

Opcional (macOS/Linux bash):
```bash
curl -X POST http://localhost:3333/gif/generate \
   -H "Content-Type: multipart/form-data" \
   -F "video=@/caminho/para/video_teste.mov" \
   -F "app=app_sc" \
   -F "empresa_id=333"
```

#### Usando Postman:
1. Configure o método como `POST`.
2. Defina a URL como `http://localhost:3333/gif/generate`.
3. Na aba "Body", selecione "form-data".
4. Adicione a chave `video` (tipo File) e faça o upload do vídeo.
5. Adicione a chave `app` (tipo Text) com o valor da aplicação (ex: `app_vd`).
6. Adicione a chave `empresa_id` (tipo Text) com o valor numérico da empresa (ex: `168`).

### Exemplo de Resposta

Em caso de sucesso, a API retornará uma resposta JSON com a URL pública do GIF gerado:
```json
{
   "gifUrl": "https://sua-download-url.com/file/seu-bucket-name/nuvempro_static/customer_files/168/app_vd/nome-do-arquivo.gif"
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
- O diretório raiz pode ser alterado via variável de ambiente `BACKBLAZE_ROOT_PATH`.

Para mais informações ou dúvidas, entre em contato com o responsável pela API.