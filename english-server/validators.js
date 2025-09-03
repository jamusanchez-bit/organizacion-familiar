const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Errores de validación:', errors.array());
    return res.status(400).json({
      error: 'Datos inválidos',
      details: errors.array()
    });
  }
  next();
};

// Validadores para registro/login
const validateAuth = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El usuario solo puede contener letras, números y guiones bajos'),
  
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('La contraseña debe tener entre 6 y 100 caracteres'),
  
  handleValidationErrors
];

// Validadores para ejercicios
const validateExerciseCompletion = [
  body('type')
    .isIn(['grammar', 'reading'])
    .withMessage('Tipo de ejercicio inválido'),
  
  body('score')
    .isInt({ min: 0, max: 10 })
    .withMessage('La puntuación debe ser entre 0 y 10'),
  
  body('answers')
    .isArray()
    .withMessage('Las respuestas deben ser un array'),
  
  handleValidationErrors
];

// Validadores para prueba de nivel
const validateLevelTest = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Debe proporcionar al menos una respuesta'),
  
  body('answers.*')
    .isInt({ min: 0 })
    .withMessage('Cada respuesta debe ser un número válido'),
  
  handleValidationErrors
];

// Validadores para conversación
const validateConversation = [
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres')
    .trim(),
  
  body('sender')
    .isIn(['user', 'assistant'])
    .withMessage('El remitente debe ser user o assistant'),
  
  handleValidationErrors
];

// Sanitizar entrada de texto
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().substring(0, 1000);
};

// Validar nivel de usuario
const isValidLevel = (level) => {
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  return validLevels.includes(level);
};

module.exports = {
  validateAuth,
  validateExerciseCompletion,
  validateLevelTest,
  validateConversation,
  sanitizeText,
  isValidLevel,
  handleValidationErrors
};