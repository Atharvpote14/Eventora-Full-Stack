const emailConfig = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
  apiUrl: "https://api.emailjs.com/api/v1.0/email/send",
};

module.exports = emailConfig;
