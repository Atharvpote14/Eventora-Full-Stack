const inputs = [...document.querySelectorAll(".otp-input")];
const verifyBtn = document.getElementById("verifyBtn");
const resendBtn = document.getElementById("resendBtn");
const resendTimer = document.getElementById("resendTimer");
const timer = document.getElementById("timer");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");
const toast = document.getElementById("toast");
const slots = document.getElementById("slots");

const DEMO_OTP = "1234";
const OTP_LIFETIME = 30;

let secondsLeft = OTP_LIFETIME;
let timerId = null;
let resendSeconds = OTP_LIFETIME;
let resendId = null;

const WIND_UP_BRAKE = "cubic-bezier(.22,.8,.18,1)";

function getCode() {
  return inputs.map(input => input.value).join("");
}

function setStatus(message, type = "") {
  statusText.textContent = message;
  statusDot.className = "status-dot";

  if (type) {
    statusDot.classList.add(type);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function updateVerifyState() {
  verifyBtn.disabled = getCode().length !== inputs.length;
}

function focusInput(index) {
  if (inputs[index]) {
    inputs[index].focus();
    inputs[index].select();
  }
}

function animateSlot(input, index) {
  input.classList.add("filled");

  const slot = input.closest(".slot");

  slot.animate(
    [
      { transform: getComputedStyle(slot).transform, opacity: .65 },
      { transform: `${getComputedStyle(slot).transform} scale(1.09)`, opacity: 1 },
      { transform: getComputedStyle(slot).transform, opacity: 1 }
    ],
    {
      duration: 360,
      easing: WIND_UP_BRAKE
    }
  );
}

function clearSlotState() {
  inputs.forEach(input => {
    input.classList.toggle("filled", Boolean(input.value));
  });
}

function handleInput(event, index) {
  const input = event.target;

  input.value = input.value.replace(/\D/g, "").slice(-1);
  clearSlotState();

  if (input.value) {
    animateSlot(input, index);
    focusInput(index + 1);
  }

  updateVerifyState();

  if (getCode().length === inputs.length) {
    setStatus("Code ready to verify");
  } else {
    setStatus("Waiting for code");
  }
}

inputs.forEach((input, index) => {
  input.addEventListener("input", event => handleInput(event, index));

  input.addEventListener("keydown", event => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].value = "";
      focusInput(index - 1);
      clearSlotState();
      updateVerifyState();
    }

    if (event.key === "ArrowLeft") {
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight") {
      focusInput(index + 1);
    }

    if (event.key === "Enter") {
      if (!verifyBtn.disabled) {
        verifyCode();
      }
    }
  });

  input.addEventListener("paste", event => {
    event.preventDefault();

    const pasted = (event.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, inputs.length);

    if (!pasted) return;

    pasted.split("").forEach((digit, i) => {
      if (inputs[i]) {
        inputs[i].value = digit;
      }
    });

    clearSlotState();
    updateVerifyState();

    const next = Math.min(pasted.length, inputs.length - 1);
    focusInput(next);

    if (pasted.length === inputs.length) {
      setStatus("Code ready to verify");
    }
  });
});

function verifyCode() {
  const code = getCode();

  if (code.length !== inputs.length) {
    setStatus("Enter all digits", "bad");
    return;
  }

  if (code === DEMO_OTP) {
    setStatus("Verification successful", "ok");
    slots.classList.remove("success-pulse");
    void slots.offsetWidth;
    slots.classList.add("success-pulse");
    showToast("OTP verified successfully");
    clearInterval(timerId);
    verifyBtn.disabled = true;
    resendBtn.disabled = false;
    resendBtn.innerHTML = "Send another code";
  } else {
    setStatus("Incorrect verification code", "bad");
    showToast("Incorrect OTP. Try 1234 for this demo.");

    slots.classList.remove("shake");
    void slots.offsetWidth;
    slots.classList.add("shake");

    inputs.forEach(input => {
      input.value = "";
      input.classList.remove("filled");
    });

    updateVerifyState();
    focusInput(0);
  }
}

verifyBtn.addEventListener("click", verifyCode);

function updateClock() {
  const value = String(secondsLeft).padStart(2, "0");
  timer.textContent = `00:${value}`;

  if (secondsLeft <= 0) {
    clearInterval(timerId);
    timer.textContent = "00:00";
    setStatus("Code expired", "bad");
    verifyBtn.disabled = true;
    startResendCountdown();
    return;
  }

  secondsLeft -= 1;
}

function startOtpTimer() {
  clearInterval(timerId);
  secondsLeft = OTP_LIFETIME;
  updateClock();
  timerId = setInterval(updateClock, 1000);
}

function startResendCountdown() {
  clearInterval(resendId);

  resendSeconds = OTP_LIFETIME;
  resendBtn.disabled = true;

  const updateResend = () => {
    resendTimer.textContent = `${resendSeconds}s`;

    if (resendSeconds <= 0) {
      clearInterval(resendId);
      resendBtn.disabled = false;
      resendBtn.innerHTML = "Resend code";
      return;
    }

    resendSeconds -= 1;
  };

  updateResend();
  resendId = setInterval(updateResend, 1000);
}

resendBtn.addEventListener("click", () => {
  inputs.forEach(input => {
    input.value = "";
    input.classList.remove("filled");
  });

  updateVerifyState();
  setStatus("New code sent");
  showToast("Demo OTP is 1234");
  startOtpTimer();
  startResendCountdown();
  focusInput(0);
});

function positionSlots() {
  // The four slots orbit around the hub.
  // Keeping the origin at the hub makes the motion
  // exact instead of approximating a sampled circle.
  const positions = [
    [-92, -32],
    [-31, -75],
    [31, -75],
    [92, -32]
  ];

  document.querySelectorAll(".slot").forEach((slot, index) => {
    const [x, y] = positions[index];
    slot.style.transformOrigin = "50% 50%";
    slot.style.setProperty("--x", `${x}px`);
    slot.style.setProperty("--y", `${y}px`);
  });
}

positionSlots();
updateVerifyState();
startOtpTimer();
startResendCountdown();
focusInput(0);
