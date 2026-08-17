/**
 * Şans çarkı — 8 dilim
 * %5, %10, %15, 50 TL, 100 TL, 150 TL (küçükler tekrarlanır)
 */

const WHEEL_SLICES = [
  { label: "%5", type: "percent", value: 5, text: "Çark: %5 indirim" },
  { label: "50 TL", type: "amount", value: 50, text: "Çark: 50 TL indirim" },
  { label: "%10", type: "percent", value: 10, text: "Çark: %10 indirim" },
  { label: "100 TL", type: "amount", value: 100, text: "Çark: 100 TL indirim" },
  { label: "%15", type: "percent", value: 15, text: "Çark: %15 indirim" },
  { label: "150 TL", type: "amount", value: 150, text: "Çark: 150 TL indirim" },
  { label: "%10", type: "percent", value: 10, text: "Çark: %10 indirim" },
  { label: "50 TL", type: "amount", value: 50, text: "Çark: 50 TL indirim" }
];

(function () {
  const overlay = document.getElementById("wheelOverlay");
  const wheelEl = document.getElementById("wheel");
  const spinBtn = document.getElementById("wheelSpin");
  const resultEl = document.getElementById("wheelResult");
  const continueBtn = document.getElementById("wheelContinue");
  if (!overlay || !wheelEl || !spinBtn) return;

  const SLICE = 360 / WHEEL_SLICES.length;
  let spinning = false;
  let currentRotation = 0;

  function buildWheel() {
    wheelEl.innerHTML = WHEEL_SLICES.map((slice, i) => {
      const rot = i * SLICE + SLICE / 2;
      return `<span class="wheel-label" style="transform: rotate(${rot}deg)"><b>${slice.label}</b></span>`;
    }).join("");
  }

  function closeWheel() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("wheel-lock");
  }

  function landIndex(rotation) {
    const normalized = ((360 - (rotation % 360)) % 360 + 360) % 360;
    return Math.min(WHEEL_SLICES.length - 1, Math.floor(normalized / SLICE));
  }

  function applyPrize(slice) {
    const prize = {
      type: slice.type,
      value: slice.value,
      label: slice.text
    };
    Cart.setWheelPrize(prize);
    window.dispatchEvent(new CustomEvent("cart:refresh"));
  }

  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    resultEl.textContent = "";

    const target = Math.floor(Math.random() * WHEEL_SLICES.length);
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const targetAngle = 360 - (target * SLICE + SLICE / 2);
    const next = extraTurns * 360 + targetAngle;
    currentRotation = next;

    wheelEl.style.transition = "transform 4.4s cubic-bezier(0.12, 0.7, 0.12, 1)";
    wheelEl.style.transform = `rotate(${next}deg)`;

    window.setTimeout(() => {
      const won = WHEEL_SLICES[landIndex(next)];
      applyPrize(won);
      resultEl.textContent = `Tebrikler! ${won.label} kazandın.`;
      continueBtn.classList.add("is-ready");
      spinning = false;
    }, 4500);
  });

  continueBtn.addEventListener("click", closeWheel);

  buildWheel();
  document.body.classList.add("wheel-lock");
  overlay.classList.add("is-open");
})();
