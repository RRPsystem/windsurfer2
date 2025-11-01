/**
 * Joi Validation Middleware
 * Provides secure input validation for API endpoints
 */

const Joi = require('joi');

/**
 * Middleware factory for validating request data
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just first
      stripUnknown: true, // Remove unknown fields (security!)
      convert: true, // Type coercion (e.g., "123" -> 123)
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace request data with validated & sanitized data
    req[property] = value;
    next();
  };
}

/**
 * Common validation schemas
 */
const schemas = {
  // Contact form
  contact: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.min': 'Naam moet minimaal 2 karakters zijn',
        'string.max': 'Naam mag maximaal 100 karakters zijn',
        'any.required': 'Naam is verplicht',
      }),
    
    email: Joi.string()
      .email()
      .trim()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Ongeldig e-mailadres',
        'any.required': 'E-mail is verplicht',
      }),
    
    message: Joi.string()
      .min(10)
      .max(5000)
      .trim()
      .required()
      .messages({
        'string.min': 'Bericht moet minimaal 10 karakters zijn',
        'string.max': 'Bericht mag maximaal 5000 karakters zijn',
        'any.required': 'Bericht is verplicht',
      }),
    
    phone: Joi.string()
      .pattern(/^[0-9\s\-\+\(\)]{8,20}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Ongeldig telefoonnummer',
      }),
  }),

  // Travel idea update
  ideaUpdate: Joi.object({
    active: Joi.boolean().optional(),
    visible: Joi.boolean().optional(),
    autocancelable: Joi.boolean().optional(),
    order: Joi.number().integer().min(0).optional(),
    title: Joi.string().min(1).max(200).trim().optional(),
    largeTitle: Joi.string().min(1).max(300).trim().optional(),
    description: Joi.string().min(1).max(10000).trim().optional(),
    remarks: Joi.string().max(5000).trim().allow('').optional(),
    themes: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().required(),
        name: Joi.string().optional(),
        imageUrl: Joi.string().uri().optional(),
      })
    ).optional(),
  }),

  // Pagination
  pagination: Joi.object({
    first: Joi.number().integer().min(0).max(100000).default(0),
    limit: Joi.number().integer().min(1).max(100).default(20),
    lang: Joi.string().length(2).uppercase().default('NL'),
    currency: Joi.string().length(3).uppercase().default('EUR'),
  }),

  // ID parameter
  id: Joi.object({
    id: Joi.alternatives()
      .try(
        Joi.number().integer().positive(),
        Joi.string().pattern(/^[a-zA-Z0-9_-]+$/)
      )
      .required()
      .messages({
        'any.required': 'ID is verplicht',
        'alternatives.match': 'Ongeldig ID formaat',
      }),
  }),

  // Video generation
  videoGeneration: Joi.object({
    title: Joi.string().min(1).max(200).trim().required(),
    destinations: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.string().min(1).max(100),
          Joi.object({
            name: Joi.string().min(1).max(100).required(),
            description: Joi.string().max(500).optional(),
          })
        )
      )
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'Minimaal 1 bestemming vereist',
        'array.max': 'Maximaal 10 bestemmingen toegestaan',
      }),
    duration: Joi.number().integer().min(5).max(120).default(30),
    voiceoverUrl: Joi.string().uri().optional(),
  }),

  // File upload metadata
  fileUpload: Joi.object({
    filename: Joi.string()
      .pattern(/^[a-zA-Z0-9_\-\.]+$/)
      .max(255)
      .required()
      .messages({
        'string.pattern.base': 'Bestandsnaam mag alleen letters, cijfers, - en _ bevatten',
      }),
    contentType: Joi.string()
      .valid(
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'application/pdf'
      )
      .required(),
    size: Joi.number().integer().max(50 * 1024 * 1024).required() // Max 50MB
      .messages({
        'number.max': 'Bestand mag maximaal 50MB zijn',
      }),
  }),

  // Email validation (standalone)
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Allow all TLDs
    .trim()
    .lowercase()
    .max(254), // RFC 5321

  // URL validation (standalone)
  url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .max(2048),

  // Safe string (no HTML/scripts)
  safeString: Joi.string()
    .pattern(/^[^<>]*$/) // No < or >
    .trim(),
};

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHtml(text) {
  if (!text) return text;
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Custom validators
 */
const customValidators = {
  // Dutch postal code
  dutchPostalCode: Joi.string()
    .pattern(/^[1-9][0-9]{3}\s?[A-Z]{2}$/i)
    .messages({
      'string.pattern.base': 'Ongeldige postcode (gebruik formaat: 1234AB)',
    }),

  // IBAN
  iban: Joi.string()
    .pattern(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/)
    .min(15)
    .max(34)
    .messages({
      'string.pattern.base': 'Ongeldig IBAN nummer',
    }),

  // UUID
  uuid: Joi.string()
    .guid({ version: ['uuidv4'] })
    .messages({
      'string.guid': 'Ongeldig UUID formaat',
    }),

  // Date range
  dateRange: Joi.object({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().min(Joi.ref('from')).required()
      .messages({
        'date.min': 'Einddatum moet na startdatum zijn',
      }),
  }),
};

module.exports = {
  validate,
  schemas,
  sanitizeHtml,
  customValidators,
  Joi, // Export Joi for custom schemas
};
