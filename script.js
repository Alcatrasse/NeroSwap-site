// ====== Dynamic Smoke Canvas ======
const canvas = document.getElementById("smoke");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 10;
    this.size = Math.random() * 80 + 20;
    this.speedY = Math.random() * 0.8 + 0.2;
    this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
  }
  update() {
    this.y -= this.speedY;
    if (this.y < -this.size) {
      this.y = canvas.height + this.size;
      this.x = Math.random() * canvas.width;
      this.size = Math.random() * 80 + 20;
      this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
    }
  }
  draw() {
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animateSmoke() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (particles.length < 80) {
    particles.push(new Particle());
  }
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateSmoke);
}
animateSmoke();

// ====== Floating Diamonds ======
const diamondContainer = document.querySelector(".diamonds");
for (let i = 0; i < 20; i++) {
  const d = document.createElement("div");
  d.classList.add("diamond");
  d.style.left = `${Math.random() * 100}%`;
  d.style.animationDuration = `${6 + Math.random() * 4}s`;
  d.style.opacity = Math.random();
  diamondContainer.appendChild(d);
}

// ====== Wallet Connect (Mock for now) ======
const connectWallet = document.getElementById("connectWallet");
const walletStatus = document.getElementById("walletStatus");
const walletAddress = document.getElementById("walletAddress");
const walletBalance = document.getElementById("walletBalance");

connectWallet.addEventListener("click", () => {
  // Simulate wallet connection
  const fakeAddress = "0x" + Math.random().toString(16).substr(2, 8) + "...";
  const fakeBalance = (Math.random() * 2).toFixed(4);
  walletAddress.textContent = fakeAddress;
  walletBalance.textContent = fakeBalance;
  walletStatus.classList.remove("hidden");
});
