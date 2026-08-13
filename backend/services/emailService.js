const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

const sendEmail = async ({ templateParams, templateId }) => {
  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: templateId || process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: templateParams,
  };

  const response = await fetch(EMAILJS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`EmailJS error ${response.status}: ${text}`);
  }

  return response;
};

const sendOtpEmail = async ({ email, name, otp, purpose }) => {
  const purposeText =
    purpose === "forgot-password"
      ? "reset your Eventora password"
      : "verify your Eventora account";

  return sendEmail({
    templateParams: {
      to_email: email,
      to_name: name || "there",
      otp_code: otp,
      expiry_minutes: process.env.OTP_EXPIRES_MINUTES || 10,
      purpose: purposeText,
      message: `Your Eventora verification code is ${otp}. It expires in ${
        process.env.OTP_EXPIRES_MINUTES || 10
      } minutes. If you did not request this, you can safely ignore this email.`,
    },
  });
};

module.exports = { sendEmail, sendOtpEmail };