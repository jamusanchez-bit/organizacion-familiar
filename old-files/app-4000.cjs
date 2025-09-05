const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

const USERS = {
  javier: { id: 'javier', name: 'Javier', password: 'password123' },
  raquel: { id: 'raquel', name: 'Raquel', password: 'password456' },
  mario: { id: 'mario', name: 'Mario', password: 'password789' },
  alba: { id: 'alba', name: 'Alba', password: 'password000' },
  javi_administrador: { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123' }
};

const recipes = [
  { id: '1', name: 'Paella Valenciana', category: 'comidas', instructions: 'Sofreír verduras, añadir arroz y caldo', preparationTime: 45, servings: 4 },
  { id: '2', name: 'Tortilla Española', category: 'cenas', instructions: 'Batir huevos, freír patatas, mezclar', preparationTime: 30, servings: 4 }
];

const inventory = [
  { id: '1', name: 'Arroz', currentQuantity: '2', minimumQuantity: '1', unit: 'kg', category: 'otros' },
  { id: '2', name: 'Huevos', currentQuantity: '12', minimumQuantity: '6', unit: 'unidades', category: 'otros' }
];

// Auth
app.post('/api/simple-auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];
  if (user && user.password === password) {
    req.session.user = { claims: { sub: user.id, email: user.id + '@app.local', firstName: user.name } };
    res.json({ success: true, user: { id: user.id, email: user.id + '@app.local', firstName: user.name } });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

app.post('/api/simple-auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/simple-auth/user', (req, res) => {
  if (req.session && req.session.user && req.session.user.claims && req.session.user.claims.sub) {
    const user = USERS[req.session.user.claims.sub];
    if (user) return res.json({ id: user.id, email: user.id + '@app.local', firstName: user.name });
  }
  res.status(401).json({ message: 'Unauthorized' });
});

// API
app.get('/api/recipes', (req, res) => {
  if (!req.session || !req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json(recipes);
});

app.get('/api/inventory', (req, res) => {
  if (!req.session || !req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json(inventory);
});

// Frontend
app.get('/', (req, res) => {
  res.send('<!DOCTYPE html><html><head><title>Organización Familiar</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://unpkg.com/react@18/umd/react.development.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><script src="https://cdn.tailwindcss.com"></script><style>* { font-family: Verdana, Geneva, sans-serif !important; }</style></head><body><div id="root"></div><script type="text/babel">const { useState, useEffect } = React; function App() { const [user, setUser] = useState(null); const [activeSection, setActiveSection] = useState("recetas"); const [recipes, setRecipes] = useState([]); const [inventory, setInventory] = useState([]); useEffect(() => { fetch("/api/simple-auth/user").then(res => res.ok ? res.json() : null).then(data => setUser(data)).catch(() => setUser(null)); }, []); useEffect(() => { if (user) { fetch("/api/recipes").then(res => res.json()).then(setRecipes); fetch("/api/inventory").then(res => res.json()).then(setInventory); } }, [user]); const login = async (username, password) => { const res = await fetch("/api/simple-auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) }); if (res.ok) { const data = await res.json(); setUser(data.user); } }; const logout = async () => { await fetch("/api/simple-auth/logout", { method: "POST" }); setUser(null); }; if (!user) { return React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4" }, React.createElement("div", { className: "bg-white rounded-2xl p-8 shadow-xl max-w-md w-full" }, React.createElement("h1", { className: "text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" }, "Organización Familiar"), React.createElement("div", { className: "space-y-4" }, ["javier", "raquel", "mario", "alba", "javi_administrador"].map(userId => React.createElement("button", { key: userId, onClick: () => login(userId, userId === "javi_administrador" ? "admin123" : "password" + (userId === "javier" ? "123" : userId === "raquel" ? "456" : userId === "mario" ? "789" : "000")), className: "w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all" }, userId === "javi_administrador" ? "Javi (Admin)" : userId.charAt(0).toUpperCase() + userId.slice(1)))))); } return React.createElement("div", { className: "min-h-screen bg-white flex" }, React.createElement("div", { className: "w-64 bg-gray-50 border-r border-gray-200" }, React.createElement("div", { className: "h-12 px-4 flex items-center" }, React.createElement("div", { className: "w-7 h-7 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center" }, React.createElement("span", { className: "text-white text-sm" }, "🏠"))), React.createElement("nav", { className: "mt-4 px-3" }, React.createElement("div", { className: "space-y-2" }, [{ id: "recetas", label: "Recetas", icon: "👨‍🍳", color: "#059669" }, { id: "inventario", label: "Inventario", icon: "📦", color: "#2563eb" }].map(section => React.createElement("button", { key: section.id, onClick: () => setActiveSection(section.id), className: "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-2", style: { backgroundColor: activeSection === section.id ? section.color : "transparent", color: activeSection === section.id ? "white" : "#374151", boxShadow: activeSection === section.id ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none" } }, React.createElement("span", { className: "mr-3" }, section.icon), section.label)))), React.createElement("div", { className: "absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200" }, React.createElement("div", { className: "flex items-center justify-between" }, React.createElement("div", null, React.createElement("p", { className: "text-xs font-medium text-gray-900" }, user.firstName)), React.createElement("button", { onClick: logout, className: "p-1 hover:bg-gray-200 rounded transition-colors", title: "Cerrar sesión" }, "🚪")))), React.createElement("div", { className: "flex-1" }, React.createElement("div", { className: "h-16 px-8 border-b border-gray-100 flex items-center bg-white" }, React.createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "¡Hola, " + user.firstName + "! 👋")), React.createElement("main", { className: "p-8 bg-gray-50", style: { minHeight: "calc(100vh - 64px)" } }, React.createElement("div", { className: "max-w-6xl mx-auto" }, activeSection === "recetas" && React.createElement("div", null, React.createElement("h2", { className: "text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6" }, "Recetas"), React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" }, recipes.map(recipe => React.createElement("div", { key: recipe.id, className: "bg-white rounded-xl p-6 shadow-lg border" }, React.createElement("h3", { className: "text-xl font-bold text-gray-900 mb-2" }, recipe.name), React.createElement("p", { className: "text-sm text-gray-600 mb-4" }, recipe.instructions), React.createElement("div", { className: "flex items-center gap-4 text-sm text-gray-600" }, React.createElement("span", null, "⏱️ " + recipe.preparationTime + " min"), React.createElement("span", null, "👥 " + recipe.servings + " personas")))))), activeSection === "inventario" && React.createElement("div", null, React.createElement("h2", { className: "text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6" }, "Inventario"), React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" }, inventory.map(item => React.createElement("div", { key: item.id, className: "bg-white rounded-xl p-6 shadow-lg border" }, React.createElement("h3", { className: "text-xl font-bold text-gray-900 mb-2" }, item.name), React.createElement("div", { className: "space-y-2" }, React.createElement("p", { className: "text-lg font-bold text-green-600" }, item.currentQuantity + " " + item.unit), React.createElement("p", { className: "text-sm text-gray-600" }, "Mínimo: " + item.minimumQuantity + " " + item.unit))))))))); } ReactDOM.render(React.createElement(App), document.getElementById("root")); </script></body></html>');
});

const port = 4000;
app.listen(port, () => {
  console.log('App running on http://localhost:' + port);
});