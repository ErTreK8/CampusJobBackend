const { sendEmail } = require('../services/emailService');

const sendEmailController = async (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ success: false, message: 'Faltan campos para enviar el correo' });
    }

    try {
        await sendEmail(to, subject, text);
        res.json({ success: true, message: 'Correo enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
    }
};

module.exports = { sendEmailController };