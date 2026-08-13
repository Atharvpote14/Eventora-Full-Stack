const emailConfig = require("../config/email");

const sendEmail = async ({ toEmail, templateId, templateParams }) => {
  if (!emailConfig.serviceId || !emailConfig.publicKey || !emailConfig.privateKey) {
    throw new Error("EmailJS configuration is incomplete.");
  }

  const payload = {
    service_id: emailConfig.serviceId,
    template_id: templateId || emailConfig.templateId,
    user_id: emailConfig.publicKey,
    accessToken: emailConfig.privateKey,
    template_params: {
      to_email: toEmail,
      ...templateParams,
    },
  };

  const response = await fetch(emailConfig.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`EmailJS request failed (${response.status}): ${text}`);
  }

  return true;
};

const sendVerificationEmail = async ({ toEmail, name, passcode, expiry }) => {
  return sendEmail({
    toEmail,
    templateParams: { name, passcode, expiry },
  });
};

module.exports = { sendEmail, sendVerificationEmail };
