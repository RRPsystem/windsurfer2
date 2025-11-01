/**
 * Contact Form API Endpoint
 * Secure contact form with Joi validation
 */

const { validate, schemas } = require('../middleware/validation');

// POST /api/contact
// Body: { name, email, message, phone? }
module.exports = [
  // Validation middleware
  validate(schemas.contact),

  // Handler
  async (req, res) => {
    try {
      // Data is already validated and sanitized by middleware
      const { name, email, message, phone } = req.body;

      console.log('[Contact] New submission:', {
        name,
        email: email.substring(0, 3) + '***', // Log safely
        messageLength: message.length,
      });

      // TODO: Send email, save to database, etc.
      // Example: Send to email service
      // await sendEmail({
      //   to: process.env.CONTACT_EMAIL,
      //   subject: `Contact form: ${name}`,
      //   text: message,
      //   replyTo: email,
      // });

      // Example: Save to Supabase
      // const { error } = await supabase
      //   .from('contact_submissions')
      //   .insert({ name, email, message, phone });

      res.status(200).json({
        success: true,
        message: 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op.',
      });
    } catch (err) {
      console.error('[Contact] Error:', err.message);
      res.status(500).json({
        error: 'Er ging iets mis bij het versturen van je bericht. Probeer het later opnieuw.',
      });
    }
  },
];
