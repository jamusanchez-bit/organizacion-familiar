import bcrypt from 'bcryptjs';

// Usuarios predefinidos con contraseñas hasheadas
export const USERS = {
  javier: {
    id: 'javier',
    name: 'Javier',
    email: 'javier@app.local',
    password: '$2b$12$54MXYu6N.RHq8cWEgqdCDeMDJBo1s5yX/T3tVZRXI85a1aQjbMlvm' // password123
  },
  raquel: {
    id: 'raquel',
    name: 'Raquel',
    email: 'raquel@app.local',
    password: '$2b$12$udKGF.1fe7uIBmlOi.DJ0uCwhJEdVgRC1Kbpude7xetLHvf0LZA2y' // password456
  },
  mario: {
    id: 'mario',
    name: 'Mario',
    email: 'mario@app.local',
    password: '$2b$12$2tO5f65Spa//mewSuexd8uBcQj/7kIHjPpmUWIGS35x7kh5OeH8FO' // password789
  },
  alba: {
    id: 'alba',
    name: 'Alba',
    email: 'alba@app.local',
    password: '$2b$12$fG7fkDcB4Obh6ZhFPeIhE.fIOGtd5pBou4aHElygKWKzwpHzRgIaK' // password000
  },
  javi_administrador: {
    id: 'javi_administrador',
    name: 'Javi (Administrador)',
    email: 'admin@app.local',
    password: '$2a$12$wtE54tZ47c7KywvqBFVVWOT5iRVOnSxflyJ4E4y0M5XBvJOnj8pAG' // admin123
  }
};

export interface SimpleUser {
  id: string;
  name: string;
  email: string;
}

export const validateUser = async (userId: string, password: string): Promise<SimpleUser | null> => {
  const user = USERS[userId as keyof typeof USERS];
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
};

export const getUserById = (userId: string): SimpleUser | null => {
  const user = USERS[userId as keyof typeof USERS];
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
};

// Función para generar hashes de contraseñas (solo para desarrollo)
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};