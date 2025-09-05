const http = require('http');
const url = require('url');

const USERS = {
  javier: { id: 'javier', name: 'Javier' },
  raquel: { id: 'raquel', name: 'Raquel' },
  mario: { id: 'mario', name: 'Mario' },
  alba: { id: 'alba', name: 'Alba' }
};

let activities = [];
let inventory = [
  { id: '1', name: 'Infusión tomillo', category: 'bebidas', shop: 'Alcampo', unit: 'paquetes', quantity: 0 },
  { id: '2', name: 'Infusión roiboos', category: 'bebidas', shop: 'Alcampo', unit: 'paquetes', quantity: 0 },
  { id: '3', name: 'Jamón', category: 'carne', shop: 'Carne internet', unit: 'paquetes', quantity: 0 },
  { id: '4', name: 'Salmón fresco (filetes)', category: 'pescado', shop: 'Pescadería', unit: 'unidades', quantity: 0 },
  { id: '5', name: 'Doradas', category: 'pescado', shop: 'Pescadería', unit: 'unidades', quantity: 0 },
  { id: '6', name: 'Lubina', category: 'pescado', shop: 'Pescadería', unit: 'unidades', quantity: 0 },
  { id: '7', name: 'Merluza (lomos)', category: 'pescado', shop: 'Pescadería', unit: 'unidades', quantity: 0 },
  { id: '8', name: 'Pulpo', category: 'pescado', shop: 'Pescadería', unit: 'unidades', quantity: 0 },
  { id: '9', name: 'Ajo', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '10', name: 'Cebollas', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '11', name: 'Coliflor', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '12', name: 'Brócoli', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '13', name: 'Pimientos', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '14', name: 'Pimiento italiano', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '15', name: 'Alcachofas (lata)', category: 'verdura', shop: 'Alcampo', unit: 'latas', quantity: 0 },
  { id: '16', name: 'Alcachofas (frescas)', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '17', name: 'Sal', category: 'otros', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '18', name: 'Sal gorda', category: 'otros', shop: 'Alcampo', unit: 'paquetes', quantity: 0 },
  { id: '19', name: 'Ajo en polvo', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '20', name: 'Champiñones (bandeja)', category: 'verdura', shop: 'Del bancal a casa', unit: 'paquetes', quantity: 0 },
  { id: '21', name: 'Setas (bandeja)', category: 'verdura', shop: 'Del bancal a casa', unit: 'paquetes', quantity: 0 },
  { id: '22', name: 'Espárragos', category: 'verdura', shop: 'Del bancal a casa', unit: 'paquetes', quantity: 0 },
  { id: '23', name: 'Espinacas', category: 'verdura', shop: 'Del bancal a casa', unit: 'paquetes', quantity: 0 },
  { id: '24', name: 'Lechuga', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '25', name: 'Zanahorias', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '26', name: 'Tomate', category: 'fruta', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '27', name: 'Caballa (lata)', category: 'pescado', shop: 'Alcampo', unit: 'latas', quantity: 0 },
  { id: '28', name: 'Rábanos', category: 'verdura', shop: 'Del bancal a casa', unit: 'paquetes', quantity: 0 },
  { id: '29', name: 'Pollo (Muslo y contra muslo)', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 0 },
  { id: '30', name: 'Pollo (filetes de pechuga)', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 0 },
  { id: '31', name: 'Cordero (costillas)', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 0 },
  { id: '32', name: 'Cordero (paletilla)', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 0 },
  { id: '33', name: 'Pollo (salchichas)', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 0 },
  { id: '34', name: 'Ternera (hamburguesas)', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 0 },
  { id: '35', name: 'Almendras', category: 'frutos secos', shop: 'Internet', unit: 'unidades', quantity: 0 },
  { id: '36', name: 'Nueces', category: 'frutos secos', shop: 'Internet', unit: 'unidades', quantity: 0 },
  { id: '37', name: 'Pasas', category: 'frutos secos', shop: 'Internet', unit: 'unidades', quantity: 0 },
  { id: '38', name: 'Ciruelas secas', category: 'frutos secos', shop: 'Internet', unit: 'unidades', quantity: 0 },
  { id: '39', name: 'Aguacate', category: 'fruta', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '40', name: 'Aceite', category: 'otros', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '41', name: 'Tomillo', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '42', name: 'Comino', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '43', name: 'Romero', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '44', name: 'Pimientos de piquillo (conserva)', category: 'verdura', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '45', name: 'Tomate triturado', category: 'fruta', shop: 'Alcampo', unit: 'latas', quantity: 0 },
  { id: '46', name: 'Limón', category: 'fruta', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '47', name: 'Manzanas', category: 'fruta', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '48', name: 'Vinagre de Jerez', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '49', name: 'Leche de arroz', category: 'otros', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '50', name: 'Kéfir', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '51', name: 'Arándanos', category: 'fruta', shop: 'Alcampo', unit: 'paquetes', quantity: 0 },
  { id: '52', name: 'Frambuesas', category: 'fruta', shop: 'Alcampo', unit: 'paquetes', quantity: 0 },
  { id: '53', name: 'Moras', category: 'fruta', shop: 'Alcampo', unit: 'paquetes', quantity: 0 },
  { id: '54', name: 'Fresas', category: 'fruta', shop: 'Del bancal a casa', unit: 'paquetes', quantity: 0 },
  { id: '55', name: 'Pollo (alitas)', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 0 },
  { id: '56', name: 'Vinagre de Módena', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '57', name: 'Salsa tamari', category: 'otros', shop: 'Internet', unit: 'tarros', quantity: 0 },
  { id: '58', name: 'Espirulina', category: 'otros', shop: 'Internet', unit: 'paquetes', quantity: 0 },
  { id: '59', name: 'Semillas (mezcla ensalada)', category: 'otros', shop: 'Internet', unit: 'paquetes', quantity: 0 },
  { id: '60', name: 'Lecitina de soja', category: 'otros', shop: 'Internet', unit: 'paquetes', quantity: 0 },
  { id: '61', name: 'Levadura de cerveza', category: 'otros', shop: 'Internet', unit: 'paquetes', quantity: 0 },
  { id: '62', name: 'Friegasuelos', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '63', name: 'Mistol', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '64', name: 'Froggy', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '65', name: 'Pastillas lavavajillas', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '66', name: 'Sal lavavajillas', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '67', name: 'Abrillantador lavavajillas', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '68', name: 'Detergente lavadora', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '69', name: 'Suavizante lavadora', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '70', name: 'Lejía', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '71', name: 'Rollo cocina', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '72', name: 'Pañuelos', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '73', name: 'Papel higiénico', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '74', name: 'Servilletas', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '75', name: 'Estropajos', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '76', name: 'Bayeta cocina', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '77', name: 'Fregona', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '78', name: 'Mopa', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '79', name: 'Escoba', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '80', name: 'Recogedor', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '81', name: 'Cubo fregona', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '82', name: 'Amoníaco', category: 'productos de limpieza/hogar', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '83', name: 'Ghee', category: 'otros', shop: 'Internet', unit: 'tarros', quantity: 0 },
  { id: '84', name: 'Mantequilla de cacahuete', category: 'frutos secos', shop: 'Internet', unit: 'tarros', quantity: 0 },
  { id: '85', name: 'Levadura', category: 'otros', shop: 'Alcampo', unit: 'paquetes', quantity: 0 },
  { id: '86', name: 'Erititrol', category: 'otros', shop: 'Internet', unit: 'paquetes', quantity: 0 },
  { id: '87', name: 'Salmón ahumado', category: 'pescado', shop: 'Pescadería', unit: 'paquetes', quantity: 0 },
  { id: '88', name: 'Gambas', category: 'pescado', shop: 'Pescadería', unit: 'paquetes', quantity: 0 },
  { id: '89', name: 'Calabacín', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '90', name: 'Rúcula', category: 'verdura', shop: 'Del bancal a casa', unit: 'paquetes', quantity: 0 },
  { id: '91', name: 'Endivia', category: 'verdura', shop: 'Del bancal a casa', unit: 'paquetes', quantity: 0 },
  { id: '92', name: 'Pepino', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '93', name: 'Remolacha', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '94', name: 'Pimiento de piquillo (fresco)', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '95', name: 'Huevos', category: 'otros', shop: 'Alcampo', unit: 'unidades', quantity: 0 },
  { id: '96', name: 'Calabaza', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '97', name: 'Chocolate 90%', category: 'otros', shop: 'Internet', unit: 'unidades', quantity: 0 },
  { id: '98', name: 'Macadamias', category: 'frutos secos', shop: 'Internet', unit: 'paquetes', quantity: 0 },
  { id: '99', name: 'Crema de almendras', category: 'frutos secos', shop: 'Internet', unit: 'tarros', quantity: 0 },
  { id: '100', name: 'Pan keto', category: 'otros', shop: 'Internet', unit: 'unidades', quantity: 0 },
  { id: '101', name: 'Café', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '102', name: 'Olivas', category: 'otros', shop: 'Alcampo', unit: 'tarros', quantity: 0 },
  { id: '103', name: 'Pavo (en lonchas)', category: 'carne', shop: 'Carne internet', unit: 'paquetes', quantity: 0 },
  { id: '104', name: 'Lomo', category: 'carne', shop: 'Carne internet', unit: 'paquetes', quantity: 0 }
];

let recipes = [
  { id: '1', name: 'Lubina sobre cama de verduras', category: 'comidas', ingredients: ['Lubina', 'Verduras'], time: 0.5, servings: 4 },
  { id: '2', name: 'Muslo y contra muslo de pollo con pimientos', category: 'comidas', ingredients: ['Pollo (Muslo y contra muslo)', 'Pimientos'], time: 0.5, servings: 4 },
  { id: '3', name: 'Marmitako de salmón', category: 'comidas', ingredients: ['Salmón fresco (filetes)', 'Ajo'], time: 0.5, servings: 4 },
  { id: '4', name: 'Crema de almendras con frutos rojos', category: 'desayunos', ingredients: ['Crema de almendras', 'Arándanos'], time: 0.25, servings: 2 },
  { id: '5', name: 'Aguacate con salmón ahumado', category: 'cenas', ingredients: ['Aguacate', 'Salmón ahumado'], time: 0.25, servings: 2 },
  { id: '6', name: 'Tostadas pan keto con aceite, lechuga, pepino, salmón marinado', category: 'desayunos', ingredients: ['Pan keto', 'Lechuga', 'Pepino'], time: 0.25, servings: 2 },
  { id: '7', name: 'Zanahorias, olivas y nueces', category: 'desayunos', ingredients: ['Zanahorias', 'Olivas', 'Nueces'], time: 0.25, servings: 2 },
  { id: '8', name: 'Dorada sobre cama de verduras', category: 'comidas', ingredients: ['Doradas', 'Verduras'], time: 0.5, servings: 4 },
  { id: '9', name: 'Alitas de pollo', category: 'comidas', ingredients: ['Pollo (alitas)', 'Ajo'], time: 0.5, servings: 4 },
  { id: '10', name: 'Pechugas de pollo rellenas de jamón', category: 'comidas', ingredients: ['Pollo (filetes de pechuga)', 'Jamón'], time: 0.75, servings: 4 },
  { id: '11', name: 'Bizcocho almendra', category: 'desayunos', ingredients: ['Almendras'], time: 1, servings: 6 },
  { id: '12', name: 'Huevos a la plancha con jamón y aguacate', category: 'desayunos', ingredients: ['Huevos', 'Jamón', 'Aguacate'], time: 0.25, servings: 2 },
  { id: '13', name: 'Crema de calabacín con salchichas', category: 'cenas', ingredients: ['Calabacín', 'Pollo (salchichas)'], time: 0.5, servings: 4 },
  { id: '14', name: 'Tortilla con crema de calabaza', category: 'cenas', ingredients: ['Huevos', 'Calabaza'], time: 0.5, servings: 4 },
  { id: '15', name: 'Tostadas keto de ghee y erititrol', category: 'desayunos', ingredients: ['Pan keto', 'Ghee', 'Erititrol'], time: 0.25, servings: 2 },
  { id: '16', name: 'Bizcocho cacahuete', category: 'desayunos', ingredients: ['Mantequilla de cacahuete'], time: 1, servings: 6 },
  { id: '17', name: 'Salmón en papillote', category: 'comidas', ingredients: ['Salmón fresco (filetes)', 'Ajo'], time: 0.75, servings: 4 },
  { id: '18', name: 'Merluza con pimientos', category: 'comidas', ingredients: ['Merluza (lomos)', 'Pimientos'], time: 0.5, servings: 4 },
  { id: '19', name: 'Kéfir con frutos rojos', category: 'desayunos', ingredients: ['Kéfir', 'Arándanos', 'Chocolate 90%'], time: 0.25, servings: 2 },
  { id: '20', name: 'Muslo y contra muslo de pollo con setas', category: 'comidas', ingredients: ['Pollo (Muslo y contra muslo)', 'Setas (bandeja)'], time: 0.5, servings: 4 },
  { id: '21', name: 'Caballa con mayonesa y brócoli al horno', category: 'cenas', ingredients: ['Caballa (lata)', 'Brócoli'], time: 0.5, servings: 4 },
  { id: '22', name: 'Costillas de cordero', category: 'comidas', ingredients: ['Cordero (costillas)', 'Ajo'], time: 1, servings: 4 },
  { id: '23', name: 'Bocadillo de pan keto con caballa', category: 'almuerzos', ingredients: ['Pan keto', 'Caballa (lata)'], time: 0.25, servings: 2 },
  { id: '24', name: 'Espinacas salteadas con gambas', category: 'cenas', ingredients: ['Espinacas', 'Gambas'], time: 0.5, servings: 4 },
  { id: '25', name: 'Paletillas de cordero', category: 'comidas', ingredients: ['Cordero (paletilla)', 'Ajo', 'Romero'], time: 1.5, servings: 4 }
];

let forumMessages = [];
let adminSuggestions = [];
let privateMessages = {};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/javier/abc123xyz789def456') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('javier'));
    return;
  }
  if (parsedUrl.pathname === '/raquel/uvw012rst345ghi678') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('raquel'));
    return;
  }
  if (parsedUrl.pathname === '/mario/jkl901mno234pqr567') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('mario'));
    return;
  }
  if (parsedUrl.pathname === '/alba/stu890vwx123yzb456') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('alba'));
    return;
  }
  if (parsedUrl.pathname === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getAdminPage());
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/inventory') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      if (data.action === 'update') {
        const item = inventory.find(i => i.id === data.id);
        if (item) {
          item.quantity = Math.max(0, item.quantity + data.change);
        }
      } else if (data.action === 'add') {
        inventory.push({
          id: Date.now().toString(),
          name: data.name,
          category: data.category,
          shop: data.shop,
          unit: data.unit,
          quantity: data.quantity
        });
      } else if (data.action === 'delete') {
        const index = inventory.findIndex(i => i.id === data.id);
        if (index !== -1) inventory.splice(index, 1);
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/recipe') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      recipes.push({
        id: Date.now().toString(),
        name: data.name,
        category: data.category,
        ingredients: data.ingredients,
        time: data.time,
        servings: data.servings || 4
      });
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  // API para chat con Elizabeth (OpenAI)
  if (req.method === 'POST' && parsedUrl.pathname === '/api/chat-elizabeth') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { message, user, level } = data;
        
        // Usar OpenAI GPT-4o para respuestas naturales
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (apiKey && apiKey !== 'your-openai-key-here') {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [{
                role: 'system',
                content: `You are Elizabeth, a friendly and natural English conversation partner. You're chatting with ${user} who has ${level} level English. Have a normal, flowing conversation like a real person would. Be encouraging, ask follow-up questions, and gently correct mistakes by naturally rephrasing. Keep responses conversational and not too teacher-like.`
              }, {
                role: 'user',
                content: message
              }],
              max_tokens: 150,
              temperature: 0.8
            })
          });
          
          const result = await response.json();
          
          if (result.choices && result.choices[0]) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
              success: true,
              response: result.choices[0].message.content
            }));
            return;
          }
        }
        
        // Fallback si no hay API key
        const responses = {
          'hello': 'Hello! Nice to meet you. How are you feeling today?',
          'hi': 'Hi there! What would you like to practice today?',
          'i am ok': 'I\'m doing well too, thank you for asking! What did you do today?',
          'good': 'That\'s wonderful! Can you tell me more about your day?',
          'fine': 'Great! What are your hobbies?',
          'default': 'That\'s interesting! Can you tell me more about that?'
        };
        
        const key = message.toLowerCase().trim();
        const response = responses[key] || responses['default'];
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          success: true,
          response: response
        }));
        
      } catch (error) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          success: false,
          response: "I'm having trouble right now. Can you try again?"
        }));
      }
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/message') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const message = {
        id: Date.now(),
        user: data.user,
        text: data.text,
        time: new Date().toLocaleString('es-ES')
      };
      
      if (data.type === 'forum') {
        forumMessages.push(message);
      } else if (data.type === 'admin') {
        adminSuggestions.push(message);
      } else if (data.type === 'private') {
        const key = [data.user, data.to].sort().join('-');
        if (!privateMessages[key]) privateMessages[key] = [];
        privateMessages[key].push(message);
      }
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (parsedUrl.pathname === '/api/data') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      activities: activities,
      inventory: inventory,
      recipes: recipes,
      forumMessages: forumMessages,
      adminSuggestions: adminSuggestions,
      privateMessages: privateMessages
    }));
    return;
  }
  
  // Test endpoint para verificar API key
  if (parsedUrl.pathname === '/test-api-key') {
    const apiKey = process.env.OPENAI_API_KEY;
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      hasApiKey: !!(apiKey && apiKey !== 'your-openai-key-here'),
      keyStart: apiKey ? apiKey.substring(0, 10) : 'none',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Ruta Ca'mon - Sistema completo de aprendizaje de inglés
  if (parsedUrl.pathname === '/english' || parsedUrl.pathname === '/english/') {
    const user = parsedUrl.query.user || 'Usuario';
    const camonHTML = getCamonPage(user);
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(camonHTML);
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>Organización Familiar</h1>');
});

function getUserPage(username) {
  const user = USERS[username];
  return `<!DOCTYPE html>
<html>
<head>
  <title>Organización Familiar - ${user.name}</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: #f5f5f5; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 250px; background: white; padding: 20px; box-shadow: 2px 0 5px rgba(0,0,0,0.1); }
    .main { flex: 1; padding: 20px; }
    .btn { width: 100%; padding: 15px; margin: 5px 0; border: none; border-radius: 8px; cursor: pointer; background: #f0f0f0; }
    .btn.active { background: #007bff; color: white; }
    .section { display: none; }
    .section.active { display: block; }
    .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    input, button { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #007bff; color: white; border: none; cursor: pointer; }
    .quote { background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .chat-btn { background: #e9ecef; color: #495057; padding: 8px 15px; border-radius: 20px; margin: 2px; }
    .chat-btn.active { background: #007bff; color: white; }
    .message { margin: 5px 0; padding: 10px; border-radius: 15px; max-width: 70%; }
    .message.own { background: #dcf8c6; margin-left: auto; text-align: right; }
    .message.other { background: #f1f1f1; margin-right: auto; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <h2>🏠 Organización</h2>
      
      <div style="text-align: center; margin: 20px 0; padding: 15px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border-radius: 8px;">
        <div id="current-date" style="font-size: 16px; font-weight: bold; margin-bottom: 10px;"></div>
        <div id="daily-quote-text" style="font-size: 14px; line-height: 1.4;"></div>
      </div>
      
      <button class="btn active" onclick="showSection('inicio')">🏠 Inicio</button>
      <button class="btn" onclick="showSection('actividades')">📅 Actividades</button>
      <button class="btn" onclick="showSection('comidas')">🍽️ Comidas</button>
      <button class="btn" onclick="showSection('recetas')">👨🍳 Recetas</button>
      <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
      <button class="btn" onclick="showSection('compras')">🛒 Compras</button>
      <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
      <button class="btn" onclick="window.location.href='/english'">🇬🇧 Ca'mon</button>
      <div style="margin-top: 50px; text-align: center;">
        <strong>${user.name}</strong>
      </div>
    </div>
    
    <div class="main">
      <div id="inicio" class="section active">
        <h1>Inicio</h1>
        

        
        <div class="card">
          <h3>Resumen del Día</h3>
          <div id="daily-summary">
            <p>Bienvenido a tu organización familiar</p>
          </div>
        </div>
      </div>
      
      <div id="actividades" class="section">
        <div class="quote">
          <h3>"Cuando cambias la forma en que miras las cosas, las cosas que miras cambian" - Wayne Dyer</h3>
        </div>
        <h1>Mis Actividades</h1>
        
        <div style="margin: 20px 0;">
          <button onclick="setView('daily')">Vista Diaria</button>
          <button onclick="setView('weekly')">Vista Semanal</button>
        </div>
        
        <div class="card">
          <h3>Actividades de Hoy</h3>
          <div id="my-activities">No tienes actividades para hoy</div>
        </div>
      </div>
      
      <div id="comidas" class="section">
        <h1>Planificación de Comidas</h1>
        
        <div style="display: flex; justify-content: space-between; margin: 20px 0;">
          <button onclick="changeWeek(-1)">← Semana Anterior</button>
          <h3 id="current-week">Semana del 1 al 7 de Septiembre 2025</h3>
          <button onclick="changeWeek(1)">Semana Siguiente →</button>
        </div>
        
        <div class="card">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;"></th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Lunes</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Martes</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Miércoles</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Jueves</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Viernes</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Sábado</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Domingo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #e3f2fd; font-weight: bold; text-align: left;">Desayuno Alba y Mario</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f3e5f5; font-weight: bold; text-align: left;">Desayuno Raquel y Javier</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #fff3e0; font-weight: bold; text-align: left;">Almuerzo Alba y Mario</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #e8f5e8; font-weight: bold; text-align: left;">Almuerzo Raquel y Javier</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #fce4ec; font-weight: bold; text-align: left;">Comida</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f1f8e9; font-weight: bold; text-align: left;">Merienda Alba y Mario</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #fff8e1; font-weight: bold; text-align: left;">Merienda Raquel y Javier</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #e1f5fe; font-weight: bold; text-align: left;">Cena</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div id="recetas" class="section">
        <h1>Recetas</h1>
        
        <div style="margin: 20px 0;">
          <button class="btn" onclick="showRecipeCategory('comidas')" id="recipe-comidas">Comidas</button>
          <button class="btn" onclick="showRecipeCategory('cenas')" id="recipe-cenas">Cenas</button>
        </div>
        
        <div id="recipes-grid" class="grid"></div>
      </div>
      
      <div id="inventario" class="section">
        <h1>Inventario</h1>
        <div id="inventory-grid" class="grid"></div>
      </div>
      
      <div id="compras" class="section">
        <h1>Lista de la Compra</h1>
        <div id="shopping-lists"></div>
      </div>
      
      <div id="mensajes" class="section">
        <h1>Mensajes</h1>
        
        <div class="card">
          <h3>Chat de grupo</h3>
          <div id="forum-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;"></div>
          <div>
            <input type="text" id="forum-input" placeholder="Escribe tu mensaje..." style="width: 70%;">
            <button onclick="sendMessage('forum')">Enviar</button>
          </div>
        </div>
        
        <div class="card">
          <h3>Chats privados</h3>
          <div style="margin: 10px 0;">
            <button onclick="selectPrivateChat('javier')" id="chat-javier" class="chat-btn">Javier</button>
            <button onclick="selectPrivateChat('raquel')" id="chat-raquel" class="chat-btn">Raquel</button>
            <button onclick="selectPrivateChat('mario')" id="chat-mario" class="chat-btn">Mario</button>
            <button onclick="selectPrivateChat('alba')" id="chat-alba" class="chat-btn">Alba</button>
          </div>
          <div id="private-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;"></div>
          <div>
            <input type="text" id="private-input" placeholder="Selecciona un chat..." style="width: 70%;" disabled>
            <button onclick="sendMessage('private')" disabled id="private-send-btn">Enviar</button>
          </div>
        </div>
        
        <div class="card">
          <h3>Sugerencias para el administrador</h3>
          <div id="admin-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;"></div>
          <div>
            <input type="text" id="admin-input" placeholder="Escribe tu sugerencia..." style="width: 70%;">
            <button onclick="sendMessage('admin')">Enviar</button>
          </div>
        </div>
      </div>
      
      <div id="english" class="section">
        <h1>Ca'mon - Aprende Inglés</h1>
        <div class="card">
          <iframe 
            id="englishApp"
            src="/english" 
            width="100%" 
            height="800px"
            frameborder="0"
            style="border-radius: 8px;">
          </iframe>
        </div>
      </div>
    </div>
  </div>

  <script>
    const username = '${username}';
    let selectedPrivateChat = null;
    let currentWeek = 1;
    let currentRecipeCategory = 'comidas';
    
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          loadRecipes(data.recipes);
          loadInventory(data.inventory);
          loadShoppingList(data.inventory);
          loadMessages(data);
        });
    }
    
    function loadRecipes(recipes) {
      const filteredRecipes = recipes.filter(r => r.category === currentRecipeCategory);
      document.getElementById('recipes-grid').innerHTML = filteredRecipes.map(recipe => 
        '<div class="card">' +
        '<h3>' + recipe.name + '</h3>' +
        '<p><strong>Ingredientes:</strong> ' + recipe.ingredients.join(', ') + '</p>' +
        '<p><strong>Tiempo:</strong> ' + recipe.time + ' horas</p>' +
        '<p><strong>Porciones:</strong> ' + recipe.servings + '</p>' +
        '</div>'
      ).join('');
    }
    
    function loadInventory(inventory) {
      const categories = ['carne', 'pescado', 'verdura', 'fruta', 'frutos secos', 'productos de limpieza/hogar', 'bebidas', 'otros'];
      let html = '';
      
      categories.forEach(category => {
        const categoryItems = inventory.filter(item => item.category === category);
        if (categoryItems.length > 0) {
          html += '<div class="card"><h3>' + category.charAt(0).toUpperCase() + category.slice(1) + '</h3>';
          categoryItems.forEach(item => {
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">';
            html += '<div><strong>' + item.name + '</strong><br>' + item.quantity + ' ' + item.unit + '</div>';
            html += '<div>';
            html += '<button onclick="changeInventory(\\'' + item.id + '\\', -1)" style="background: #dc2626; margin: 2px;">-</button>';
            html += '<button onclick="changeInventory(\\'' + item.id + '\\', 1)" style="background: #059669; margin: 2px;">+</button>';
            html += '</div></div>';
          });
          html += '</div>';
        }
      });
      
      document.getElementById('inventory-grid').innerHTML = html;
    }
    
    function loadShoppingList(inventory) {
      const shops = ['Carne internet', 'Pescadería', 'Del bancal a casa', 'Alcampo', 'Internet', 'Otros'];
      const outOfStock = inventory.filter(item => item.quantity === 0);
      const lowStock = inventory.filter(item => item.quantity === 1);
      
      let html = '';
      shops.forEach(shop => {
        const shopItems = outOfStock.filter(item => item.shop === shop);
        const shopSuggestions = lowStock.filter(item => item.shop === shop);
        
        if (shopItems.length > 0 || shopSuggestions.length > 0) {
          html += '<div class="card"><h3>' + shop + '</h3>';
          
          if (shopItems.length > 0) {
            html += '<h4 style="color: #dc2626;">Necesarios:</h4>';
            shopItems.forEach(item => {
              html += '<div style="padding: 8px; background: #fef2f2; margin: 4px 0; border-radius: 4px; border-left: 4px solid #dc2626;">' + item.name + '</div>';
            });
          }
          
          if (shopSuggestions.length > 0) {
            html += '<h4 style="color: #f59e0b;">Sugerencias:</h4>';
            shopSuggestions.forEach(item => {
              html += '<div style="padding: 8px; background: #fef3c7; margin: 4px 0; border-radius: 4px; border-left: 4px solid #f59e0b;">' + item.name + '</div>';
            });
          }
          
          html += '</div>';
        }
      });
      
      document.getElementById('shopping-lists').innerHTML = html || '<div class="card"><p>No hay productos en la lista de compra</p></div>';
    }
    
    function loadMessages(data) {
      document.getElementById('forum-messages').innerHTML = data.forumMessages.map(msg => 
        '<div class="message ' + (msg.user === username ? 'own' : 'other') + '">' +
        '<strong>' + msg.user + '</strong><br>' + msg.text + '<br><small>' + msg.time + '</small></div>'
      ).join('') || '<p>No hay mensajes</p>';
      
      document.getElementById('admin-messages').innerHTML = data.adminSuggestions.map(msg => 
        '<div class="message ' + (msg.user === username ? 'own' : 'other') + '">' +
        '<strong>' + msg.user + '</strong><br>' + msg.text + '<br><small>' + msg.time + '</small></div>'
      ).join('') || '<p>No hay sugerencias</p>';
      
      if (selectedPrivateChat) {
        const key = [username, selectedPrivateChat].sort().join('-');
        const privateMessages = data.privateMessages[key] || [];
        document.getElementById('private-messages').innerHTML = privateMessages.map(msg => 
          '<div class="message ' + (msg.user === username ? 'own' : 'other') + '">' +
          '<strong>' + msg.user + '</strong><br>' + msg.text + '<br><small>' + msg.time + '</small></div>'
        ).join('') || '<p>No hay mensajes</p>';
      }
    }
    
    function selectPrivateChat(user) {
      selectedPrivateChat = user;
      document.querySelectorAll('.chat-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('chat-' + user).classList.add('active');
      document.getElementById('private-input').disabled = false;
      document.getElementById('private-input').placeholder = 'Escribe a ' + user + '...';
      document.getElementById('private-send-btn').disabled = false;
      loadData();
    }
    
    function sendMessage(type) {
      let text, to;
      
      if (type === 'forum') {
        text = document.getElementById('forum-input').value.trim();
        document.getElementById('forum-input').value = '';
      } else if (type === 'admin') {
        text = document.getElementById('admin-input').value.trim();
        document.getElementById('admin-input').value = '';
      } else if (type === 'private') {
        text = document.getElementById('private-input').value.trim();
        to = selectedPrivateChat;
        if (!to) return;
        document.getElementById('private-input').value = '';
      }
      
      if (!text) return;
      
      fetch('/api/message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({type: type, user: username, text: text, to: to})
      }).then(() => loadData());
    }
    
    function changeInventory(id, change) {
      fetch('/api/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'update', id: id, change: change})
      }).then(() => loadData());
    }
    
    function showRecipeCategory(category) {
      currentRecipeCategory = category;
      document.querySelectorAll('#recipe-comidas, #recipe-cenas').forEach(b => b.classList.remove('active'));
      document.getElementById('recipe-' + category).classList.add('active');
      loadData();
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
    
    function setView(view) {
      console.log('Vista cambiada a: ' + view);
    }
    
    function changeWeek(direction) {
      currentWeek += direction;
      document.getElementById('current-week').textContent = 'Semana ' + currentWeek + ' de Septiembre 2025';
    }
    
    function markMealDone() {
      if (confirm('¿Marcar como hecho?')) {
        event.target.style.background = '#d4edda';
        event.target.innerHTML = '✓ Hecho';
      }
    }
    
    const dailyQuotes = ["Cuando eliges pensamientos de amor, todo tu mundo se ordena. (Wayne Dyer)","Tu mente es la semilla, tu vida es la cosecha. (Joe Dispenza)","Nada real puede ser amenazado; nada irreal existe. (Un curso de milagros)","El dinero es energía, y se mueve hacia quien le da dirección. (Raimón Samsó)","El futuro no está escrito, se crea en tu mente. (Wayne Dyer)","Eres aquello en lo que piensas la mayor parte del tiempo. (Joe Dispenza)","La abundancia se manifiesta cuando dejas de temer perder. (Un curso de milagros)","El milagro no cambia el mundo, cambia tu percepción. (Raimón Samsó)","La verdadera riqueza comienza en la mente abierta. (Wayne Dyer)","Donde colocas tu atención, colocas tu energía. (Joe Dispenza)","Cada pensamiento es una orden al universo. (Un curso de milagros)","El éxito es la consecuencia de vivir con propósito. (Raimón Samsó)","El perdón es la medicina del alma. (Wayne Dyer)","La prosperidad se construye con hábitos diarios. (Joe Dispenza)","Si puedes imaginarlo, puedes crearlo. (Un curso de milagros)","El amor nunca exige, solo ofrece. (Raimón Samsó)","Tu energía crea tu biología. (Wayne Dyer)","Ser útil es la mejor forma de ser próspero. (Joe Dispenza)","El miedo limita, la fe expande. (Un curso de milagros)","El milagro es ver inocencia en lugar de culpa. (Raimón Samsó)","Cuanto más agradeces, más recibes. (Wayne Dyer)","La mente entrenada crea abundancia. (Joe Dispenza)","Tu propósito es mayor que tus excusas. (Un curso de milagros)","Cada instante es una nueva oportunidad. (Raimón Samsó)","El dinero fluye hacia quienes generan valor. (Wayne Dyer)","El tiempo es una ilusión, lo único real es el presente. (Joe Dispenza)","Tu cuerpo refleja lo que tu mente sostiene. (Un curso de milagros)","Invertir en ti es la inversión más rentable. (Raimón Samsó)","La gratitud es la llave de la abundancia. (Wayne Dyer)","Lo que piensas con emoción intensa se materializa. (Joe Dispenza)","El perdón abre las puertas del cielo. (Un curso de milagros)","La riqueza interior siempre precede a la exterior. (Raimón Samsó)","El universo responde a tu vibración, no a tus palabras. (Wayne Dyer)","Tus pensamientos son imanes de experiencias. (Joe Dispenza)","Todo encuentro es una oportunidad de sanar. (Un curso de milagros)","El milagro comienza cuando eliges de nuevo. (Raimón Samsó)","Tu atención es la moneda más valiosa de tu vida. (Wayne Dyer)","La abundancia llega cuando te alineas con tu propósito. (Joe Dispenza)","La mente crea la química del cuerpo. (Un curso de milagros)","El amor es tu estado natural, todo lo demás es ilusión. (Raimón Samsó)","La libertad financiera comienza en la mente. (Wayne Dyer)","Cada emoción que eliges abre o cierra puertas. (Joe Dispenza)","El ego fabrica miedo, el espíritu ofrece paz. (Un curso de milagros)","Tus hábitos construyen tu destino. (Raimón Samsó)","El dinero es un sirviente, no un amo. (Wayne Dyer)","Cada día es un nuevo comienzo. (Joe Dispenza)","La fe es la certeza de lo invisible. (Un curso de milagros)","El milagro es soltar lo falso y aceptar lo verdadero. (Raimón Samsó)","La abundancia no es un lugar, es un camino. (Wayne Dyer)","El éxito interior atrae éxito exterior. (Joe Dispenza)","El universo es mental: piensa alto. (Un curso de milagros)","El amor cura lo que el miedo destruye. (Raimón Samsó)","Eres creador, no víctima de tu realidad. (Wayne Dyer)","La riqueza es una forma de conciencia. (Joe Dispenza)","Nada externo tiene poder sobre ti. (Un curso de milagros)","La energía sigue a la atención. (Raimón Samsó)","El milagro está en tu decisión de ver distinto. (Wayne Dyer)","La abundancia se comparte o se pierde. (Joe Dispenza)","Tu mente es más poderosa de lo que crees. (Un curso de milagros)","Cada pensamiento crea tu mañana. (Raimón Samsó)","El perdón es libertad. (Wayne Dyer)","La prosperidad no llega con esfuerzo, sino con conciencia. (Joe Dispenza)","El amor nunca falla. (Un curso de milagros)","Tu cerebro aprende lo que repites. (Raimón Samsó)","La riqueza empieza con una idea convertida en acción. (Wayne Dyer)","El milagro es un cambio de percepción. (Joe Dispenza)","La gratitud transforma la carencia en abundancia. (Un curso de milagros)","Donde está tu enfoque, allí está tu poder. (Raimón Samsó)","La confianza abre caminos invisibles. (Wayne Dyer)","Cada día puedes crear una versión más elevada de ti. (Joe Dispenza)","La paz interior es el mayor de los logros. (Un curso de milagros)","El dinero sigue a tu claridad mental. (Raimón Samsó)","Lo que das, regresa multiplicado. (Wayne Dyer)","Tu mente puede sanar tu cuerpo. (Joe Dispenza)","El milagro es recordar quién eres. (Un curso de milagros)","La abundancia es tu estado natural. (Raimón Samsó)","Eres lo que eliges pensar hoy. (Wayne Dyer)","La vida responde a tu fe, no a tu miedo. (Joe Dispenza)","El universo premia la coherencia. (Un curso de milagros)","La prosperidad fluye donde hay propósito. (Raimón Samsó)","Cada emoción que eliges es una creación. (Wayne Dyer)","El amor es la respuesta en todo. (Joe Dispenza)","Tus pensamientos son decretos. (Un curso de milagros)","El éxito es la consecuencia de tu vibración. (Raimón Samsó)","Tu espíritu nunca carece, solo tu mente cree que sí. (Wayne Dyer)","El milagro ocurre al soltar el control. (Joe Dispenza)","La riqueza es libertad de ser. (Un curso de milagros)","Cada instante es una nueva oportunidad de elegir. (Raimón Samsó)","Lo que sostienes en tu mente, se sostiene en tu vida. (Wayne Dyer)","La gratitud te conecta con la fuente. (Joe Dispenza)","El dinero es neutro, tú le das el significado. (Un curso de milagros)","Nada te limita salvo tus pensamientos. (Raimón Samsó)","La fe mueve energía y crea resultados. (Wayne Dyer)","La abundancia llega a los corazones abiertos. (Joe Dispenza)","Cada creencia crea una realidad. (Un curso de milagros)","El amor disuelve toda ilusión. (Raimón Samsó)","El milagro está en tu decisión. (Wayne Dyer)","Eres ilimitado en esencia, limitado solo en creencias. (Joe Dispenza)","El éxito se mide en paz interior. (Un curso de milagros)","Tu vida es un espejo de tu mente. (Raimón Samsó)"];
    
    function getDailyQuote() {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      return dailyQuotes[Math.min(dayOfYear - 1, 364)] || dailyQuotes[0];
    }
    
    function updateDailyContent() {
      const now = new Date();
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const dateString = dayName + ' ' + day + ' de ' + month + ' de ' + year;
      const quote = getDailyQuote();
      if (document.getElementById('current-date')) {
        document.getElementById('current-date').textContent = dateString;
      }
      if (document.getElementById('daily-quote-text')) {
        document.getElementById('daily-quote-text').textContent = quote;
      }
    }
    
    async function loginToEnglishApp(username) {
      try {
        const response = await fetch('/api/auto-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const data = await response.json();
        
        document.getElementById('englishApp').contentWindow.postMessage({
          type: 'AUTO_LOGIN',
          token: data.token,
          user: data.user
        }, '*');
      } catch (error) {
        console.log('Auto-login no disponible, usando modo demo');
      }
    }
    
    updateDailyContent();
    loadData();
    setInterval(loadData, 10000);
  </script>
</body>
</html>`;
}

function getAdminPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Admin - Organización Familiar</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: #f5f5f5; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 250px; background: white; padding: 20px; box-shadow: 2px 0 5px rgba(0,0,0,0.1); }
    .main { flex: 1; padding: 20px; }
    .btn { width: 100%; padding: 15px; margin: 5px 0; border: none; border-radius: 8px; cursor: pointer; background: #f0f0f0; }
    .btn.active { background: #007bff; color: white; }
    .section { display: none; }
    .section.active { display: block; }
    .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    input, button, select { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #007bff; color: white; border: none; cursor: pointer; }
    .form-group { margin: 15px 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <h2>🔧 Admin Panel</h2>
      <button class="btn active" onclick="showSection('inventario')">📦 Inventario</button>
      <button class="btn" onclick="showSection('recetas')">👨🍳 Recetas</button>
      <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
      <div style="margin-top: 50px; text-align: center;">
        <strong>Javi (Admin)</strong>
      </div>
    </div>
    
    <div class="main">
      <div id="inventario" class="section active">
        <h1>Gestionar Inventario</h1>
        
        <div class="card">
          <h3>Añadir Nuevo Producto</h3>
          <div class="form-group">
            <input type="text" id="product-name" placeholder="Nombre del producto">
            <select id="product-category">
              <option value="carne">Carne</option>
              <option value="pescado">Pescado</option>
              <option value="verdura">Verdura</option>
              <option value="fruta">Fruta</option>
              <option value="frutos secos">Frutos secos</option>
              <option value="productos de limpieza/hogar">Productos de limpieza/hogar</option>
              <option value="otros">Otros</option>
            </select>
            <select id="product-shop">
              <option value="Carne internet">Carne internet</option>
              <option value="Pescadería">Pescadería</option>
              <option value="Del bancal a casa">Del bancal a casa</option>
              <option value="Alcampo">Alcampo</option>
              <option value="Internet">Internet</option>
              <option value="Otros">Otros</option>
            </select>
            <select id="product-unit">
              <option value="unidades">Unidades</option>
              <option value="litros">Litros</option>
              <option value="botes">Botes</option>
              <option value="tarros">Tarros</option>
              <option value="cartones">Cartones</option>
              <option value="latas">Latas</option>
            </select>
            <input type="number" id="product-quantity" placeholder="Cantidad" value="0">
            <button onclick="saveProduct()">💾 Añadir Producto</button>
          </div>
        </div>
        
        <div id="inventory-admin-grid" class="grid"></div>
      </div>
      
      <div id="recetas" class="section">
        <h1>Gestionar Recetas</h1>
        
        <div class="card">
          <h3>Añadir Nueva Receta</h3>
          <div class="form-group">
            <input type="text" id="recipe-name" placeholder="Nombre de la receta">
            <select id="recipe-category">
              <option value="comidas">Comidas</option>
              <option value="cenas">Cenas</option>
            </select>
            <input type="number" id="recipe-time" placeholder="Tiempo (horas)" step="0.25" value="0.5">
            <input type="number" id="recipe-servings" placeholder="Porciones" value="4">
            <div id="recipe-ingredients">
              <h4>Ingredientes:</h4>
              <div id="ingredients-list"></div>
              <select id="ingredient-select">
                <option value="">Seleccionar ingrediente</option>
              </select>
              <button type="button" onclick="addIngredient()">➕ Añadir Ingrediente</button>
            </div>
            <button onclick="saveRecipe()">💾 Crear Receta</button>
          </div>
        </div>
        
        <div id="recipes-admin-grid" class="grid"></div>
      </div>
      
      <div id="mensajes" class="section">
        <h1>Mensajes Recibidos</h1>
        <div class="card">
          <h3>Sugerencias de usuarios</h3>
          <div id="admin-messages" style="height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let selectedIngredients = [];
    
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          loadAdminInventory(data.inventory);
          loadAdminRecipes(data.recipes);
          loadAdminMessages(data.adminSuggestions);
          loadIngredientOptions(data.inventory);
        });
    }
    
    function loadAdminInventory(inventory) {
      document.getElementById('inventory-admin-grid').innerHTML = inventory.map(item => 
        '<div class="card">' +
        '<h3>' + item.name + '</h3>' +
        '<p><strong>Categoría:</strong> ' + item.category + '</p>' +
        '<p><strong>Tienda:</strong> ' + item.shop + '</p>' +
        '<p><strong>Cantidad:</strong> ' + item.quantity + ' ' + item.unit + '</p>' +
        '<button onclick="deleteProduct(\\'' + item.id + '\\')" style="background: #dc2626;">🗑️ Eliminar</button>' +
        '</div>'
      ).join('');
    }
    
    function loadAdminRecipes(recipes) {
      document.getElementById('recipes-admin-grid').innerHTML = recipes.map(recipe => 
        '<div class="card">' +
        '<h3>' + recipe.name + '</h3>' +
        '<p><strong>Categoría:</strong> ' + recipe.category + '</p>' +
        '<p><strong>Ingredientes:</strong> ' + recipe.ingredients.join(', ') + '</p>' +
        '<p><strong>Tiempo:</strong> ' + recipe.time + ' horas</p>' +
        '<p><strong>Porciones:</strong> ' + recipe.servings + '</p>' +
        '</div>'
      ).join('');
    }
    
    function loadAdminMessages(messages) {
      document.getElementById('admin-messages').innerHTML = messages.map(msg => 
        '<div style="background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px;"><strong>' + msg.user + '</strong> (' + msg.time + '):<br>' + msg.text + '</div>'
      ).join('') || '<p>No hay sugerencias</p>';
    }
    
    function loadIngredientOptions(inventory) {
      const select = document.getElementById('ingredient-select');
      select.innerHTML = '<option value="">Seleccionar ingrediente</option>' +
        inventory.map(item => '<option value="' + item.name + '">' + item.name + '</option>').join('');
    }
    
    function saveProduct() {
      const name = document.getElementById('product-name').value.trim();
      const category = document.getElementById('product-category').value;
      const shop = document.getElementById('product-shop').value;
      const unit = document.getElementById('product-unit').value;
      const quantity = parseInt(document.getElementById('product-quantity').value);
      
      if (!name) {
        alert('❌ Completa el nombre del producto');
        return;
      }
      
      fetch('/api/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'add', name, category, shop, unit, quantity})
      }).then(() => {
        alert('✅ Producto añadido');
        document.getElementById('product-name').value = '';
        document.getElementById('product-quantity').value = '0';
        loadData();
      });
    }
    
    function deleteProduct(id) {
      if (confirm('¿Eliminar producto?')) {
        fetch('/api/inventory', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({action: 'delete', id: id})
        }).then(() => {
          alert('✅ Producto eliminado');
          loadData();
        });
      }
    }
    
    function addIngredient() {
      const select = document.getElementById('ingredient-select');
      const ingredient = select.value;
      if (ingredient && !selectedIngredients.includes(ingredient)) {
        selectedIngredients.push(ingredient);
        updateIngredientsList();
      }
    }
    
    function updateIngredientsList() {
      document.getElementById('ingredients-list').innerHTML = selectedIngredients.map(ing => 
        '<span style="background: #e3f2fd; padding: 5px 10px; margin: 2px; border-radius: 15px; display: inline-block;">' +
        ing + ' <span onclick="removeIngredient(\\'' + ing + '\\')" style="cursor: pointer; color: #dc2626;">×</span></span>'
      ).join('');
    }
    
    function removeIngredient(ingredient) {
      selectedIngredients = selectedIngredients.filter(ing => ing !== ingredient);
      updateIngredientsList();
    }
    
    function saveRecipe() {
      const name = document.getElementById('recipe-name').value.trim();
      const category = document.getElementById('recipe-category').value;
      const time = parseFloat(document.getElementById('recipe-time').value);
      const servings = parseInt(document.getElementById('recipe-servings').value);
      
      if (!name || selectedIngredients.length === 0) {
        alert('❌ Completa todos los campos');
        return;
      }
      
      fetch('/api/recipe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, category, ingredients: selectedIngredients, time, servings})
      }).then(() => {
        alert('✅ Receta creada');
        document.getElementById('recipe-name').value = '';
        document.getElementById('recipe-time').value = '0.5';
        document.getElementById('recipe-servings').value = '4';
        selectedIngredients = [];
        updateIngredientsList();
        loadData();
      });
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
    
    loadData();
    setInterval(loadData, 10000);
  </script>
</body>
</html>`;
}

// Sistema Ca'mon - Base de datos en memoria
let camonUsers = {
  javier: { level: 'A1.1', dailyScores: [], levelTests: [], lastActivity: null },
  raquel: { level: 'A1.1', dailyScores: [], levelTests: [], lastActivity: null },
  mario: { level: 'A1.1', dailyScores: [], levelTests: [], lastActivity: null },
  alba: { level: 'A1.1', dailyScores: [], levelTests: [], lastActivity: null }
};

function getCamonPage(user) {
  if (user === 'javi_administrador') {
    return '<h1>Acceso denegado</h1><p>El administrador no tiene acceso a Ca\'mon</p>';
  }
  
  const userData = camonUsers[user.toLowerCase()] || camonUsers['javier'];
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>Ca'mon - ${user}</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; color: white; margin-bottom: 40px; }
    .user-info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; color: white; }
    .level-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 25px; font-size: 18px; font-weight: bold; }
    .card { background: white; border-radius: 12px; padding: 30px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .btn { background: #667eea; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 10px; transition: all 0.3s; }
    .btn:hover { background: #5a67d8; transform: translateY(-2px); }
    .btn-primary { background: #10b981; }
    .btn-primary:hover { background: #059669; }
    .btn-secondary { background: #f59e0b; }
    .btn-secondary:hover { background: #d97706; }
    .section { display: none; }
    .section.active { display: block; }
    .back-btn { background: #6b7280; margin-bottom: 20px; }
    .back-btn:hover { background: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Ca'mon</h1>
      <p>Tu plataforma personal de aprendizaje de inglés</p>
    </div>
    
    <div class="user-info">
      <h2>Bienvenido, ${user}!</h2>
      <p>Nivel actual: <span class="level-badge">${userData.level}</span></p>
      <p>Ejercicios completados: ${userData.dailyScores.length} días</p>
    </div>
    
    <div id="main-menu" class="section active">
      <div class="card">
        <h2>🎯 Prueba Inicial</h2>
        <p>Evalúa tu nivel de inglés con 25 preguntas diseñadas por Cambridge University Press & Assessment.</p>
        <button class="btn btn-primary" onclick="showSection('level-test')">Hacer Prueba de Nivel</button>
      </div>
      
      <div class="card">
        <h2>📚 Ejercicios Diarios</h2>
        <p>Practica gramática y comprensión lectora adaptados a tu nivel actual (${userData.level}).</p>
        <button class="btn btn-secondary" onclick="showSection('daily-exercises')">Comenzar Ejercicios</button>
      </div>
      
      <div class="card">
        <h2>📈 Mi Evolución</h2>
        <p>Revisa tu progreso, calificaciones y historial de aprendizaje.</p>
        <button class="btn" onclick="showSection('evolution')">Ver Mi Progreso</button>
      </div>
    </div>
    
    <div id="level-test" class="section">
      <button class="btn back-btn" onclick="showSection('main-menu')">← Volver al Menú</button>
      <div class="card">
        <h2>🎯 Prueba de Nivel Cambridge</h2>
        <p>Esta prueba determinará tu nivel exacto de inglés. Consta de 25 preguntas que evalúan desde A1.1 hasta C2.5.</p>
        <button class="btn btn-primary" onclick="startLevelTest()">Comenzar Prueba</button>
        <div id="test-content" style="display: none;"></div>
      </div>
    </div>
    
    <div id="daily-exercises" class="section">
      <button class="btn back-btn" onclick="showSection('main-menu')">← Volver al Menú</button>
      <div class="card">
        <h2>📚 Ejercicios Diarios - Nivel ${userData.level}</h2>
        <p>Completa los ejercicios de gramática y comprensión lectora de hoy.</p>
        <button class="btn btn-secondary" onclick="startDailyExercises()">Comenzar Ejercicios</button>
        <div id="exercises-content" style="display: none;"></div>
      </div>
    </div>
    
    <div id="evolution" class="section">
      <button class="btn back-btn" onclick="showSection('main-menu')">← Volver al Menú</button>
      <div class="card">
        <h2>📈 Mi Evolución</h2>
        <div id="evolution-content">
          <p>Cargando tu historial de progreso...</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const currentUser = '${user}';
    const userLevel = '${userData.level}';
    
    function showSection(sectionId) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(sectionId).classList.add('active');
      
      if (sectionId === 'evolution') {
        loadEvolution();
      }
    }
    
    // Base de preguntas Cambridge por nivel
    const levelQuestions = {
      'A1.1': {grammar: [{q: 'I _____ a student.', a: 'am'}, {q: 'She _____ happy.', a: 'is'}], reading: [{text: 'Hello. My name is John.', q: 'What is his name?', options: ['John', 'Peter', 'Mike'], a: 0}]},
      'A1.2': {grammar: [{q: 'They _____ teachers.', a: 'are'}, {q: 'We _____ from Spain.', a: 'are'}], reading: [{text: 'I live in London. It is a big city.', q: 'Where does he live?', options: ['Paris', 'London', 'Madrid'], a: 1}]},
      'A1.3': {grammar: [{q: 'He _____ not here.', a: 'is'}, {q: 'You _____ very kind.', a: 'are'}], reading: [{text: 'Sarah works in a hospital. She is a nurse.', q: 'What is Sarahs job?', options: ['Doctor', 'Nurse', 'Teacher'], a: 1}]}
    };
    
    let currentTest = [];
    let currentQuestion = 0;
    let testScore = 0;
    
    function startLevelTest() {
      // Generar 25 preguntas aleatorias (10 gramática + 15 reading)
      currentTest = [];
      currentQuestion = 0;
      testScore = 0;
      
      // 10 preguntas de gramática
      const levels = ['A1.1', 'A1.2', 'A1.3', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1'];
      for (let i = 0; i < 10; i++) {
        const level = levels[i % levels.length];
        const questions = levelQuestions[level] ? levelQuestions[level].grammar : levelQuestions['A1.1'].grammar;
        const q = questions[Math.floor(Math.random() * questions.length)];
        currentTest.push({...q, type: 'grammar', level: level});
      }
      
      // 15 preguntas de reading
      for (let i = 0; i < 15; i++) {
        const level = levels[i % levels.length];
        const questions = levelQuestions[level] ? levelQuestions[level].reading : levelQuestions['A1.1'].reading;
        const q = questions[Math.floor(Math.random() * questions.length)];
        currentTest.push({...q, type: 'reading', level: level});
      }
      
      // Mezclar preguntas
      currentTest.sort(() => Math.random() - 0.5);
      
      document.getElementById('test-content').style.display = 'block';
      showTestQuestion();
    }
    
    function showTestQuestion() {
      if (currentQuestion >= currentTest.length) {
        finishLevelTest();
        return;
      }
      
      const q = currentTest[currentQuestion];
      let html = '<div class="card">';
      html += '<h3>Pregunta ' + (currentQuestion + 1) + ' de 25</h3>';
      
      if (q.type === 'grammar') {
        html += '<p>' + q.q + '</p>';
        html += '<input type="text" id="answer" placeholder="Escribe tu respuesta">';
      } else {
        html += '<p><strong>Texto:</strong> ' + q.text + '</p>';
        html += '<p><strong>Pregunta:</strong> ' + q.q + '</p>';
        for (let i = 0; i < q.options.length; i++) {
          html += '<label><input type="radio" name="answer" value="' + i + '"> ' + q.options[i] + '</label><br>';
        }
      }
      
      html += '<button class="btn" onclick="submitTestAnswer()">Siguiente</button>';
      html += '</div>';
      
      document.getElementById('test-content').innerHTML = html;
    }
    
    function submitTestAnswer() {
      const q = currentTest[currentQuestion];
      let correct = false;
      
      if (q.type === 'grammar') {
        const answer = document.getElementById('answer').value.toLowerCase().trim();
        correct = answer === q.a.toLowerCase();
      } else {
        const selected = document.querySelector('input[name="answer"]:checked');
        correct = selected && parseInt(selected.value) === q.a;
      }
      
      if (correct) testScore++;
      currentQuestion++;
      showTestQuestion();
    }
    
    function finishLevelTest() {
      const percentage = Math.round((testScore / 25) * 100);
      let newLevel = 'A1.1';
      
      if (percentage >= 95) newLevel = 'C2.5';
      else if (percentage >= 90) newLevel = 'C2.1';
      else if (percentage >= 85) newLevel = 'C1.5';
      else if (percentage >= 80) newLevel = 'C1.1';
      else if (percentage >= 75) newLevel = 'B2.5';
      else if (percentage >= 70) newLevel = 'B2.1';
      else if (percentage >= 65) newLevel = 'B1.5';
      else if (percentage >= 60) newLevel = 'B1.1';
      else if (percentage >= 55) newLevel = 'A2.5';
      else if (percentage >= 50) newLevel = 'A2.1';
      else if (percentage >= 40) newLevel = 'A1.5';
      else if (percentage >= 30) newLevel = 'A1.3';
      else if (percentage >= 20) newLevel = 'A1.2';
      
      document.getElementById('test-content').innerHTML = 
        '<div class="card">' +
        '<h2>✅ Prueba Completada</h2>' +
        '<p>Puntuación: <strong>' + testScore + '/25 (' + percentage + '%)</strong></p>' +
        '<p>Tu nivel es: <strong>' + newLevel + '</strong></p>' +
        '<button class="btn" onclick="showSection(\"main-menu\")">← Volver al Menú</button>' +
        '</div>';
    }
    
    // Estado de ejercicios diarios
    let dailyProgress = {
      grammar: false,
      reading: false,
      chat: false,
      grammarScore: 0,
      readingScore: 0
    };
    
    function startDailyExercises() {
      document.getElementById('exercises-content').style.display = 'block';
      showDailyMenu();
    }
    
    function showDailyMenu() {
      const today = new Date().toDateString();
      let html = '<div class="card">';
      html += '<h3>📚 Ejercicios Diarios - ' + today + '</h3>';
      html += '<p>Completa los tres ejercicios para terminar tu sesión diaria:</p>';
      
      // Botón Gramática
      html += '<div style="margin: 15px 0;">';
      if (dailyProgress.grammar) {
        html += '<button class="btn" style="background: #10b981;" disabled>✅ Gramática Completada (' + dailyProgress.grammarScore + '/10)</button>';
      } else {
        html += '<button class="btn btn-primary" onclick="startGrammar()">1. 📝 Gramática</button>';
      }
      html += '</div>';
      
      // Botón Reading
      html += '<div style="margin: 15px 0;">';
      if (dailyProgress.reading) {
        html += '<button class="btn" style="background: #10b981;" disabled>✅ Reading Completado (' + dailyProgress.readingScore + '/10)</button>';
      } else {
        html += '<button class="btn btn-secondary" onclick="startReading()">2. 📚 Reading</button>';
      }
      html += '</div>';
      
      // Botón Chat
      html += '<div style="margin: 15px 0;">';
      if (dailyProgress.chat) {
        html += '<button class="btn" style="background: #10b981;" disabled>✅ Chat con Elizabeth Completado</button>';
      } else {
        html += '<button class="btn" onclick="startChat()">3. 💬 Chat con Elizabeth</button>';
      }
      html += '</div>';
      
      // Progreso total
      const completed = (dailyProgress.grammar ? 1 : 0) + (dailyProgress.reading ? 1 : 0) + (dailyProgress.chat ? 1 : 0);
      html += '<hr><p><strong>Progreso:</strong> ' + completed + '/3 ejercicios completados</p>';
      
      if (completed === 3) {
        const avgScore = Math.round((dailyProgress.grammarScore + dailyProgress.readingScore) / 2);
        html += '<p style="color: #10b981; font-weight: bold;">✅ ¡Sesión diaria completada! Puntuación promedio: ' + avgScore + '/10</p>';
      }
      
      html += '</div>';
      document.getElementById('exercises-content').innerHTML = html;
    }
    
    function startGrammar() {
      const grammarLessons = {
        'A1.1': {topic: 'Verbo TO BE - Presente', explanation: 'El verbo "to be" (ser/estar) es fundamental en inglés. Se conjuga: I am, You are, He/She/It is, We are, They are.', questions: [{q: 'I _____ happy.', a: 'am'}, {q: 'She _____ a doctor.', a: 'is'}, {q: 'They _____ students.', a: 'are'}, {q: 'We _____ friends.', a: 'are'}, {q: 'He _____ tall.', a: 'is'}, {q: 'You _____ smart.', a: 'are'}, {q: 'It _____ cold.', a: 'is'}, {q: 'I _____ tired.', a: 'am'}, {q: 'She _____ beautiful.', a: 'is'}, {q: 'We _____ ready.', a: 'are'}]},
        'A1.2': {topic: 'Presente Simple - Verbos regulares', explanation: 'En presente simple, con I/You/We/They usamos el verbo base. Con He/She/It añadimos -s al final.', questions: [{q: 'I _____ coffee every day. (drink)', a: 'drink'}, {q: 'She _____ English. (speak)', a: 'speaks'}, {q: 'They _____ in London. (live)', a: 'live'}, {q: 'He _____ football. (play)', a: 'plays'}, {q: 'We _____ books. (read)', a: 'read'}, {q: 'She _____ to music. (listen)', a: 'listens'}, {q: 'I _____ early. (wake)', a: 'wake'}, {q: 'He _____ fast. (run)', a: 'runs'}, {q: 'They _____ hard. (work)', a: 'work'}, {q: 'She _____ well. (cook)', a: 'cooks'}]}
      };
      
      const lesson = grammarLessons[userLevel] || grammarLessons['A1.1'];
      
      let html = '<div class="card">';
      html += '<h3>📝 Gramática: ' + lesson.topic + '</h3>';
      html += '<div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">';
      html += '<p><strong>Lección de hoy:</strong></p>';
      html += '<p>' + lesson.explanation + '</p>';
      html += '</div>';
      html += '<div id="grammar-exercise"></div>';
      html += '</div>';
      
      document.getElementById('exercises-content').innerHTML = html;
      startGrammarQuestions(lesson.questions);
    }
    
    let grammarQuestions = [];
    let currentGrammarQ = 0;
    let grammarScore = 0;
    
    function startGrammarQuestions(questions) {
      grammarQuestions = questions;
      currentGrammarQ = 0;
      grammarScore = 0;
      showGrammarQuestion();
    }
    
    function showGrammarQuestion() {
      if (currentGrammarQ >= grammarQuestions.length) {
        finishGrammar();
        return;
      }
      
      const q = grammarQuestions[currentGrammarQ];
      let html = '<h4>Pregunta ' + (currentGrammarQ + 1) + ' de 10</h4>';
      html += '<p>' + q.q + '</p>';
      html += '<input type="text" id="grammar-answer" placeholder="Escribe tu respuesta" style="width: 300px;">';
      html += '<br><button class="btn" onclick="checkGrammarAnswer()">Verificar</button>';
      html += '<div id="grammar-feedback"></div>';
      
      document.getElementById('grammar-exercise').innerHTML = html;
      document.getElementById('grammar-answer').focus();
    }
    
    function checkGrammarAnswer() {
      const answer = document.getElementById('grammar-answer').value.toLowerCase().trim();
      const correct = grammarQuestions[currentGrammarQ].a.toLowerCase();
      const feedback = document.getElementById('grammar-feedback');
      
      if (answer === correct) {
        grammarScore++;
        feedback.innerHTML = '<p style="color: #10b981; margin: 10px 0;">✅ ¡Correcto!</p>';
      } else {
        feedback.innerHTML = '<p style="color: #dc2626; margin: 10px 0;">❌ Incorrecto. La respuesta correcta es: <strong>' + grammarQuestions[currentGrammarQ].a + '</strong></p>';
      }
      
      setTimeout(() => {
        currentGrammarQ++;
        showGrammarQuestion();
      }, 2000);
    }
    
    function finishGrammar() {
      dailyProgress.grammar = true;
      dailyProgress.grammarScore = grammarScore;
      
      let html = '<h4>✅ Gramática Completada</h4>';
      html += '<p>Puntuación: <strong>' + grammarScore + '/10</strong></p>';
      html += '<button class="btn" onclick="showDailyMenu()">Volver a Ejercicios Diarios</button>';
      
      document.getElementById('grammar-exercise').innerHTML = html;
    }
    
    function startReading() {
      const readingTexts = {
        'A1.1': {text: 'Hello! My name is Anna. I am 25 years old. I live in Madrid with my family. I work in a small office near my house. I like my job because it is interesting. Every morning I wake up at 7 AM and have breakfast with my parents. Then I go to work by bus. In the evening, I come home and watch TV with my family.', questions: [{q: 'How old is Anna?', options: ['23', '25', '27'], a: 1}, {q: 'Where does Anna live?', options: ['Barcelona', 'Madrid', 'Valencia'], a: 1}, {q: 'How does Anna go to work?', options: ['By car', 'By bus', 'Walking'], a: 1}, {q: 'What time does Anna wake up?', options: ['6 AM', '7 AM', '8 AM'], a: 1}, {q: 'Who does Anna live with?', options: ['Friends', 'Alone', 'Family'], a: 2}, {q: 'Where is Annas office?', options: ['Far from home', 'Near her house', 'In the city center'], a: 1}, {q: 'What does Anna do in the evening?', options: ['Read books', 'Watch TV', 'Go shopping'], a: 1}, {q: 'Does Anna like her job?', options: ['No', 'Yes', 'Sometimes'], a: 1}, {q: 'What does Anna have for breakfast?', options: ['With parents', 'Alone', 'With friends'], a: 0}, {q: 'How does Anna describe her job?', options: ['Boring', 'Interesting', 'Difficult'], a: 1}]}
      };
      
      const reading = readingTexts[userLevel] || readingTexts['A1.1'];
      
      let html = '<div class="card">';
      html += '<h3>📚 Reading Comprehension</h3>';
      html += '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; line-height: 1.6;">';
      html += '<p>' + reading.text + '</p>';
      html += '</div>';
      html += '<div id="reading-exercise"></div>';
      html += '</div>';
      
      document.getElementById('exercises-content').innerHTML = html;
      startReadingQuestions(reading.questions);
    }
    
    let readingQuestions = [];
    let currentReadingQ = 0;
    let readingScore = 0;
    
    function startReadingQuestions(questions) {
      readingQuestions = questions;
      currentReadingQ = 0;
      readingScore = 0;
      showReadingQuestion();
    }
    
    function showReadingQuestion() {
      if (currentReadingQ >= readingQuestions.length) {
        finishReading();
        return;
      }
      
      const q = readingQuestions[currentReadingQ];
      let html = '<h4>Pregunta ' + (currentReadingQ + 1) + ' de 10</h4>';
      html += '<p><strong>' + q.q + '</strong></p>';
      
      for (let i = 0; i < q.options.length; i++) {
        html += '<label style="display: block; margin: 8px 0;"><input type="radio" name="reading-answer" value="' + i + '"> ' + q.options[i] + '</label>';
      }
      
      html += '<br><button class="btn" onclick="checkReadingAnswer()">Verificar</button>';
      html += '<div id="reading-feedback"></div>';
      
      document.getElementById('reading-exercise').innerHTML = html;
    }
    
    function checkReadingAnswer() {
      const selected = document.querySelector('input[name="reading-answer"]:checked');
      const feedback = document.getElementById('reading-feedback');
      
      if (selected && parseInt(selected.value) === readingQuestions[currentReadingQ].a) {
        readingScore++;
        feedback.innerHTML = '<p style="color: #10b981; margin: 10px 0;">✅ ¡Correcto!</p>';
      } else {
        const correctAnswer = readingQuestions[currentReadingQ].options[readingQuestions[currentReadingQ].a];
        feedback.innerHTML = '<p style="color: #dc2626; margin: 10px 0;">❌ Incorrecto. La respuesta correcta es: <strong>' + correctAnswer + '</strong></p>';
      }
      
      setTimeout(() => {
        currentReadingQ++;
        showReadingQuestion();
      }, 2000);
    }
    
    function finishReading() {
      dailyProgress.reading = true;
      dailyProgress.readingScore = readingScore;
      
      let html = '<h4>✅ Reading Completado</h4>';
      html += '<p>Puntuación: <strong>' + readingScore + '/10</strong></p>';
      html += '<button class="btn" onclick="showDailyMenu()">Volver a Ejercicios Diarios</button>';
      
      document.getElementById('reading-exercise').innerHTML = html;
    }
    
    let chatTimer = 0;
    let chatInterval = null;
    let chatHistory = [];
    
    function startChat() {
      document.getElementById('exercises-content').innerHTML = 
        '<div class="card">' +
        '<h3>💬 Chat con Elizabeth</h3>' +
        '<div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">' +
        '<p><strong>Instrucciones:</strong></p>' +
        '<p>Habla con Elizabeth durante al menos 10 minutos. Ella te ayudará a practicar inglés y corregirá tus errores.</p>' +
        '</div>' +
        '<div style="text-align: center; margin: 20px 0;">' +
        '<div id="chat-timer" style="font-size: 24px; font-weight: bold; color: #667eea;">00:00</div>' +
        '<p>Tiempo mínimo: 10:00</p>' +
        '</div>' +
        '<div id="chat-interface" style="display: none;">' +
        '<div id="chat-messages" style="height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 15px; margin: 15px 0; background: white; border-radius: 8px;"></div>' +
        '<div style="display: flex; gap: 10px;">' +
        '<button id="record-btn" class="btn btn-primary" onclick="toggleRecording()">🎤 Hablar</button>' +
        '<button id="type-btn" class="btn" onclick="toggleTyping()">⌨️ Escribir</button>' +
        '</div>' +
        '<div id="input-area" style="margin: 15px 0; display: none;">' +
        '<input type="text" id="text-input" placeholder="Escribe tu mensaje en inglés..." style="width: 70%;">' +
        '<button class="btn" onclick="sendTextMessage()">Enviar</button>' +
        '</div>' +
        '</div>' +
        '<div style="text-align: center;">' +
        '<button class="btn btn-primary" onclick="initializeChat()">Comenzar Chat con Elizabeth</button>' +
        '</div>' +
        '</div>';
    }
    
    function initializeChat() {
      document.getElementById('chat-interface').style.display = 'block';
      chatTimer = 0;
      chatHistory = [];
      
      chatInterval = setInterval(() => {
        chatTimer++;
        updateTimer();
      }, 1000);
      
      addChatMessage('Elizabeth', 'Hello! I am Elizabeth, your English teacher. What would you like to talk about today?', true);
    }
    
    function updateTimer() {
      const minutes = Math.floor(chatTimer / 60);
      const seconds = chatTimer % 60;
      const display = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
      document.getElementById('chat-timer').textContent = display;
      
      if (chatTimer >= 600) {
        document.getElementById('chat-timer').style.color = '#10b981';
        if (!dailyProgress.chat) {
          dailyProgress.chat = true;
          setTimeout(() => {
            addChatMessage('System', '✅ Chat completado! Has practicado durante 10 minutos.', false);
          }, 1000);
        }
      }
    }
    
    function addChatMessage(sender, message, isElizabeth) {
      const messagesDiv = document.getElementById('chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.style.margin = '10px 0';
      messageDiv.style.padding = '10px';
      messageDiv.style.borderRadius = '8px';
      
      if (isElizabeth) {
        messageDiv.style.background = '#e0f2fe';
        messageDiv.style.textAlign = 'left';
        messageDiv.innerHTML = '<strong>Elizabeth:</strong> ' + message;
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = 'en-US';
          utterance.rate = 0.9;
          speechSynthesis.speak(utterance);
        }
      } else {
        messageDiv.style.background = '#f0f9ff';
        messageDiv.style.textAlign = 'right';
        messageDiv.innerHTML = '<strong>' + (sender === 'System' ? 'Sistema' : 'Tú') + ':</strong> ' + message;
      }
      
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    function toggleTyping() {
      const inputArea = document.getElementById('input-area');
      if (inputArea.style.display === 'none') {
        inputArea.style.display = 'block';
        document.getElementById('text-input').focus();
      } else {
        inputArea.style.display = 'none';
      }
    }
    
    function sendTextMessage() {
      const input = document.getElementById('text-input');
      const message = input.value.trim();
      if (message) {
        addChatMessage('Tú', message, false);
        sendToElizabeth(message);
        input.value = '';
      }
    }
    
    async function sendToElizabeth(userMessage) {
      try {
        const response = await fetch('/api/chat-elizabeth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            user: currentUser,
            level: userLevel
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          addChatMessage('Elizabeth', data.response, true);
        } else {
          addChatMessage('Elizabeth', data.response, true);
        }
        
      } catch (error) {
        addChatMessage('Elizabeth', "Sorry, I'm having connection issues. Can you try again?", true);
      }
    }
    
    function toggleRecording() {
      alert('Reconocimiento de voz disponible próximamente. Usa el chat de texto por ahora.');
    }
    
    function checkGrammar1() {
      const answer = document.getElementById('grammar1').value.toLowerCase().trim();
      const result = document.getElementById('grammar1-result');
      
      if (answer === 'drink') {
        result.innerHTML = '<p style="color: green;">✅ ¡Correcto!</p>';
      } else {
        result.innerHTML = '<p style="color: red;">❌ Incorrecto. La respuesta es "drink".</p>';
      }
    }
    
    function checkReading1() {
      const selected = document.querySelector('input[name="reading1"]:checked');
      const result = document.getElementById('reading1-result');
      
      if (selected && selected.value === '1') {
        result.innerHTML = '<p style="color: green;">✅ ¡Correcto!</p>';
      } else {
        result.innerHTML = '<p style="color: red;">❌ Incorrecto. Emma es profesora.</p>';
      }
    }
    
    function loadEvolution() {
      document.getElementById('evolution-content').innerHTML = 
        '<p>Nivel actual: <strong>' + userLevel + '</strong></p>' +
        '<p>Ejercicios completados: <strong>0 días</strong></p>' +
        '<p>Pruebas de nivel realizadas: <strong>0</strong></p>' +
        '<p><em>Tu historial aparecerá aquí cuando completes ejercicios.</em></p>';
    }
  </script>
</body>
</html>`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
});