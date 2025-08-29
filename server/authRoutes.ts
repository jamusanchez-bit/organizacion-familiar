import { Router } from 'express';
import { validateUser, getUserById, SimpleUser } from './simpleAuth';

declare module 'express-session' {
  interface SessionData {
    user?: {
      claims: {
        sub: string;
        email: string;
        firstName: string;
      }
    }
  }
}

const router = Router();

// Simple login endpoint (alternative to Replit Auth)
router.post('/api/simple-auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const user = await validateUser(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Store user in session (same format as Replit Auth)
    req.session.user = {
      claims: {
        sub: user.id,
        email: user.email,
        firstName: user.name,
      }
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.name,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Simple logout endpoint
router.post('/api/simple-auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Get current user (compatible with existing /api/auth/user)
router.get('/api/simple-auth/user', (req, res) => {
  if (req.session?.user?.claims?.sub) {
    const user = getUserById(req.session.user.claims.sub);
    if (user) {
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.name,
      });
    }
  }
  
  res.status(401).json({ message: 'Unauthorized' });
});

export default router;