const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Organización Familiar</title>
  <style>
    * { font-family: Verdana, Geneva, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; }
    .header { height: 48px; padding: 0 16px; display: flex; align-items: center; }
    .icon { width: 28px; height: 28px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
    .nav { margin-top: 16px; padding: 0 12px; }
    .btn { width: 100%; display: flex; align-items: center; padding: 12px 16px; margin-bottom: 8px; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .btn.active { background: #10b981; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .btn:not(.active) { background: transparent; color: #374151; }
    .btn:hover:not(.active) { background: #f3f4f6; }
    .main { flex: 1; }
    .top { height: 64px; padding: 0 32px; border-bottom: 1px solid #f3f4f6; background: white; display: flex; align-items: center; }
    .content { padding: 32px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .logout { padding: 4px; border: none; background: none; cursor: pointer; border-radius: 4px; }
    .logout:hover { background: #f3f4f6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="header">
        <div class="icon">🏠</div>
      </div>
      <div class="nav">
        <button class="btn active" onclick="showSection('recetas')">👨‍🍳 Recetas</button>
        <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
      </div>
      <div class="user">
        <span style="font-size: 12px; font-weight: 500;">Javier</span>
        <button class="logout" onclick="alert('Logout!')">🚪</button>
      </div>
    </div>
    <div class="main">
      <div class="top">
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, Javier! 👋</h1>
      </div>
      <div class="content">
        <div id="recetas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas</h2>
          <div class="grid">
            <div class="card">
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Paella Valenciana</h3>
              <p style="color: #6b7280; margin-bottom: 16px;">Sofreír verduras, añadir arroz y caldo</p>
              <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
                <span>⏱️ 45 min</span>
                <span>👥 4 personas</span>
              </div>
            </div>
            <div class="card">
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Tortilla Española</h3>
              <p style="color: #6b7280; margin-bottom: 16px;">Batir huevos, freír patatas, mezclar</p>
              <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
                <span>⏱️ 30 min</span>
                <span>👥 4 personas</span>
              </div>
            </div>
          </div>
        </div>
        <div id="inventario" class="section" style="display: none;">
          <h2 class="title" style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario</h2>
          <div class="grid">
            <div class="card">
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Arroz</h3>
              <p style="font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 8px;">2 kg</p>
              <p style="font-size: 14px; color: #6b7280;">Mínimo: 1 kg</p>
            </div>
            <div class="card">
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Huevos</h3>
              <p style="font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 8px;">12 unidades</p>
              <p style="font-size: 14px; color: #6b7280;">Mínimo: 6 unidades</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script>
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).style.display = 'block';
      event.target.classList.add('active');
    }
  </script>
</body>
</html>
  `);
});

server.listen(9090, () => {
  console.log('Servidor funcionando en http://localhost:9090');
});