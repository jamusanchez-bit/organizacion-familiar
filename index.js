const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Administrador</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; position: fixed; height: 100vh; }
    .nav { margin-top: 16px; padding: 0 12px; }
    .btn { width: 100%; display: flex; align-items: center; padding: 12px 16px; margin-bottom: 8px; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .btn.active { background: #10b981; color: white; }
    .btn:not(.active) { background: transparent; color: #374151; }
    .main { flex: 1; margin-left: 256px; }
    .top { height: 64px; padding: 0 32px; background: white; display: flex; align-items: center; }
    .content { padding: 32px; }
    .section { display: none; }
    .section.active { display: block; }
    .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="nav">
        <button class="btn active" onclick="showSection('actividades')">Actividades</button>
        <button class="btn" onclick="showSection('recetas')">Recetas</button>
        <button class="btn" onclick="showSection('inventario')">Inventario</button>
        <button class="btn" onclick="showSection('mensajes')">Mensajes</button>
      </div>
    </div>
    
    <div class="main">
      <div class="top">
        <h1>ADMINISTRADOR FUNCIONANDO</h1>
      </div>
      
      <div class="content">
        <div id="actividades" class="section active">
          <h2>Actividades</h2>
          <div class="card">
            <button onclick="alert('Crear actividad')">Crear Actividad</button>
            <button onclick="alert('Ver calendario')">Ver Calendario</button>
          </div>
        </div>
        
        <div id="recetas" class="section">
          <h2>Recetas</h2>
          <div class="grid" id="recipes-list"></div>
        </div>
        
        <div id="inventario" class="section">
          <h2>Inventario</h2>
          <div class="grid" id="inventory-list"></div>
        </div>
        
        <div id="mensajes" class="section">
          <h2>Mensajes</h2>
          <div class="card">
            <p>Chat familiar funcionando</p>
            <input type="text" placeholder="Escribe mensaje">
            <button onclick="alert('Mensaje enviado')">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const recipes = [
      {name: 'Lubina sobre cama de verduras', desc: 'Vino blanco, tomillo, aceite, sal'},
      {name: 'Pollo con pimientos', desc: 'Ajo, tomillo, comino, pimienta, vinagre'},
      {name: 'Salmon en papillote', desc: 'Ajo en polvo, aceite y sal'},
      {name: 'Merluza con pimientos', desc: 'Aceite, sal, eneldo y vino blanco'},
      {name: 'Dorada sobre verduras', desc: 'Vino blanco, tomillo, aceite, sal'}
    ];
    
    const inventory = [
      {name: 'Jamon', qty: 0, unit: 'paquetes'},
      {name: 'Salmon fresco', qty: 0, unit: 'filetes'},
      {name: 'Doradas', qty: 0, unit: 'unidades'},
      {name: 'Lubina', qty: 0, unit: 'unidades'},
      {name: 'Ajo', qty: 0, unit: 'unidades'},
      {name: 'Pimientos', qty: 0, unit: 'unidades'},
      {name: 'Sal', qty: 0, unit: 'paquetes'}
    ];
    
    function loadData() {
      document.getElementById('recipes-list').innerHTML = recipes.map(r => 
        '<div class="card"><h3>' + r.name + '</h3><p>' + r.desc + '</p></div>'
      ).join('');
      
      document.getElementById('inventory-list').innerHTML = inventory.map(item => 
        '<div class="card"><h3>' + item.name + '</h3><p>' + item.qty + ' ' + item.unit + '</p>' +
        '<button onclick="changeQty(\'' + item.name + '\', 1)">+</button> ' +
        '<button onclick="changeQty(\'' + item.name + '\', -1)">-</button></div>'
      ).join('');
    }
    
    function changeQty(name, change) {
      const item = inventory.find(i => i.name === name);
      if (item) {
        item.qty = Math.max(0, item.qty + change);
        loadData();
      }
    }
    
    loadData();
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Organizacion Familiar</h1>');
  }
});

server.listen(process.env.PORT || 3000);