const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_FILE = path.join(__dirname, "redirects.json");

function loadRedirects() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { grupo: "https://chat.whatsapp.com/HXjAPTO0uKRE7nqIkDaiT7" };
  }
}

function saveRedirects(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

if (!fs.existsSync(DATA_FILE)) {
  saveRedirects({ grupo: "https://chat.whatsapp.com/HXjAPTO0uKRE7nqIkDaiT7" });
}

// ============================================
// PAINEL DE ADMIN
// ============================================
app.get("/admin", (req, res) => {
  const redirects = loadRedirects();
  const host = req.headers.host || "seuapp.up.railway.app";

  const rows = Object.entries(redirects)
    .map(
      ([slug, url]) => `
      <div class="link-card">
        <div class="link-info">
          <span class="slug">/${slug}</span>
          <span class="arrow">→</span>
          <span class="url">${url}</span>
        </div>
        <div class="link-public">Link público: <code>https://${host}/${slug}</code></div>
        <form method="POST" action="/admin/update" class="edit-form">
          <input type="hidden" name="slug" value="${slug}">
          <input type="url" name="url" value="${url}" placeholder="Novo link https://..." required>
          <button type="submit" class="btn-save">Salvar</button>
          <button type="submit" formaction="/admin/delete" class="btn-delete">Excluir</button>
        </form>
      </div>`
    )
    .join("");

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerenciar Redirects</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 640px; margin: 0 auto; }
    h1 {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #fff;
    }
    .subtitle {
      color: #888;
      font-size: 0.9rem;
      margin-bottom: 32px;
    }
    .link-card {
      background: #151515;
      border: 1px solid #252525;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .link-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .slug {
      background: #25D366;
      color: #000;
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .arrow { color: #555; }
    .url {
      color: #999;
      font-size: 0.82rem;
      word-break: break-all;
    }
    .link-public {
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 14px;
    }
    .link-public code {
      background: #1a1a1a;
      padding: 2px 8px;
      border-radius: 4px;
      color: #25D366;
    }
    .edit-form {
      display: flex;
      gap: 8px;
    }
    input[type="url"], input[type="text"] {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #0a0a0a;
      color: #fff;
      font-family: inherit;
      font-size: 0.85rem;
    }
    input:focus { outline: none; border-color: #25D366; }
    .btn-save {
      padding: 10px 20px;
      background: #25D366;
      color: #000;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-save:hover { background: #1ebe5a; }
    .btn-delete {
      padding: 10px 14px;
      background: transparent;
      color: #ff4444;
      border: 1px solid #331111;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-delete:hover { background: #1a0000; }
    .new-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #222;
    }
    .new-section h2 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 14px;
      color: #ccc;
    }
    .new-form {
      display: flex;
      gap: 8px;
    }
    .new-form input[type="text"] { width: 120px; flex: none; }
    .msg {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 0.9rem;
    }
    .msg-ok { background: #0d2818; color: #25D366; border: 1px solid #153d23; }
    .msg-err { background: #2a0a0a; color: #ff4444; border: 1px solid #3d1515; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Redirects WhatsApp</h1>
    <p class="subtitle">Gerencie seus links de redirecionamento</p>

    ${req.query.ok ? '<div class="msg msg-ok">Link atualizado com sucesso!</div>' : ""}
    ${req.query.err ? '<div class="msg msg-err">Erro: ' + decodeURIComponent(req.query.err) + "</div>" : ""}

    ${rows || '<p style="color:#666">Nenhum redirect cadastrado.</p>'}

    <div class="new-section">
      <h2>Adicionar novo</h2>
      <form method="POST" action="/admin/update" class="new-form">
        <input type="text" name="slug" placeholder="slug" required>
        <input type="url" name="url" placeholder="https://chat.whatsapp.com/..." required>
        <button type="submit" class="btn-save">Criar</button>
      </form>
    </div>
  </div>
</body>
</html>`);
});

// Atualizar / criar redirect
app.post("/admin/update", (req, res) => {
  const { slug, url } = req.body;

  if (!slug || !url || !url.startsWith("https://")) {
    return res.redirect("/admin?err=" + encodeURIComponent("URL inválida"));
  }

  const clean = slug.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!clean) {
    return res.redirect("/admin?err=" + encodeURIComponent("Slug inválido"));
  }

  const redirects = loadRedirects();
  redirects[clean] = url;
  saveRedirects(redirects);

  res.redirect("/admin?ok=1");
});

// Deletar redirect
app.post("/admin/delete", (req, res) => {
  const { slug } = req.body;
  const redirects = loadRedirects();
  delete redirects[slug];
  saveRedirects(redirects);
  res.redirect("/admin?ok=1");
});

// ============================================
// REDIRECT PÚBLICO (compatível com app mobile)
// ============================================
app.get("/:slug", (req, res) => {
  const redirects = loadRedirects();
  const destination = redirects[req.params.slug];

  if (!destination) {
    return res.status(404).send("Link não encontrado.");
  }

  // Serve uma página HTML que força o redirect no app
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=${destination}">
  <meta property="og:url" content="${destination}">
  <title>Redirecionando...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #075E54;
      color: white;
      text-align: center;
      padding: 20px;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: #25D366;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: 1.1rem; margin-bottom: 8px; }
    p { font-size: 0.85rem; opacity: 0.7; margin-bottom: 20px; }
    a {
      display: inline-block;
      background: #25D366;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 25px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div>
    <div class="spinner"></div>
    <h1>Entrando no grupo...</h1>
    <p>Se não redirecionar, toque no botão abaixo.</p>
    <a href="${destination}">Entrar no Grupo</a>
  </div>
  <script>
    window.location.replace("${destination}");
  </script>
</body>
</html>`);
});

app.get("/", (req, res) => {
  res.redirect("/admin");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});