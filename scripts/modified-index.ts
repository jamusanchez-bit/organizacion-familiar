import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Exportar datos automáticamente después de 5 segundos
  setTimeout(async () => {
    try {
      const { storage } = await import('./storage');
      const fs = await import('fs');
      
      console.log('🔄 Exportando datos...');
      
      const inventory = await storage.query('SELECT * FROM inventory ORDER BY id');
      const recipes = await storage.query('SELECT * FROM recipes ORDER BY id');
      const ingredients = await storage.query('SELECT * FROM recipe_ingredients ORDER BY recipe_id, id');
      
      const exportData = {
        inventory: inventory.rows,
        recipes: recipes.rows,
        recipeIngredients: ingredients.rows,
        exportDate: new Date().toISOString()
      };
      
      fs.writeFileSync('family-app-data-export.json', JSON.stringify(exportData, null, 2));
      
      console.log('✅ DATOS EXPORTADOS!');
      console.log(`📦 ${inventory.rows.length} inventario, ${recipes.rows.length} recetas, ${ingredients.rows.length} ingredientes`);
      console.log('📥 Descarga: family-app-data-export.json');
      
    } catch (error) {
      console.error('❌ Error exportando:', error);
    }
  }, 5000);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '8000', 10);
  server.listen(port, 'localhost', () => {
    log(`serving on port ${port}`);
  });
})();