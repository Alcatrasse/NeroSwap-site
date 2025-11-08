// NeroSwap — Professional UI behavior (script.js)

// ===== Utility: year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Background: smoke canvas (soft, dynamic diamonds rise) =====
const canvas = document.getElementById('smokeCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', ()=> {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

// Particles for smoky gems (multi-color diamonds-smoke)
const particles = [];
const MAX_PART = Math.floor(Math.max(60, W / 15));

class Smoke {
  constructor(){
    this.reset();
  }
  reset(){
    this.x = Math.random() * W;
    this.y = H + Math.random() * 120;
    this.size = 40 + Math.random() * 120;
    this.speed = 0.6 + Math.random() * 1.2; // soft but slightly dynamic
    this.h = 280 + Math.random() * 80; // hue around purple/pink range
    this.alpha = 0.08 + Math.random() * 0.12;
    this.angle = Math.random() * Math.PI * 2;
  }
  update(){
    this.y -= this.speed;
    this.x += Math.sin(this.angle) * 0.4;
    this.angle += 0.002;
    if(this.y < -this.size) this.reset();
  }
  draw(){
    const g = ctx.createRadialGradient(this.x, this.y, this.size * 0.1, this.x, this.y, this.size);
    g.addColorStop(0, `hsla(${this.h},80%,60%,${this.alpha * 1.0})`);
    g.addColorStop(0.5, `hsla(${(this.h+30)%360},70%,45%,${this.alpha * 0.6})`);
    g.addColorStop(1, `rgba(0,0,0,0)`);
    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
  }
}

for(let i=0;i<MAX_PART;i++) particles.push(new Smoke());

function loop(){
  ctx.clearRect(0,0,W,H);
  // subtle dark overlay to keep background deep
  ctx.fillStyle = 'rgba(5,5,7,0.2)';
  ctx.fillRect(0,0,W,H);

  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(loop);
}
loop();

// ===== Diamonds — DOM floating (SVG-like via CSS) =====
const diamondsContainer = document.getElementById('diamonds');
function createDiamond(i){
  const el = document.createElement('div');
  el.className = 'diamond';
  // style
  const size = 48 + Math.random() * 72;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.left = `${Math.random() * 100}%`;
  el.style.bottom = `${-Math.random() * 200}px`;
  el.style.opacity = 0.5 + Math.random() * 0.5;
  el.style.transform = `translateX(-50%) rotate(${Math.random()*360}deg)`;
  el.style.transition = 'transform linear';
  // gradient background that resembles a diamond facet
  el.style.background = `linear-gradient(135deg, rgba(255,45,113,0.14), rgba(138,43,226,0.18))`;
  el.style.borderRadius = '6px';
  el.style.position = 'absolute';
  el.style.pointerEvents = 'none';
  el.style.filter = 'blur(0.6px) saturate(1.2)';
  // animation duration and delay
  const dur = 12 + Math.random()*10;
  el.style.animation = `diamondRise ${dur}s linear infinite`;
  el.style.animationDelay = `${Math.random()*-dur}s`;
  diamondsContainer.appendChild(el);
}

for(let i=0;i<18;i++) createDiamond(i);

// CSS keyframes injection for diamonds (so it's embedded within JS behavior)
const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
@keyframes diamondRise {
  0% { transform: translate(-50%, 40vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  50% { transform: translate(-50%, -40vh) rotate(180deg); opacity: 1; }
  100% { transform: translate(-50%, -120vh) rotate(360deg); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);

// ===== Wallet connection (Web3Modal + Ethers) =====
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      infuraId: "" // Optional: put your Infura ID for WalletConnect reliability
    }
  },
  coinbase: {
    package: window.CoinbaseWalletSDK,
    options: {
      appName: "NeroSwap Demo"
    }
  }
};

const web3Modal = new window.Web3Modal.default({
  cacheProvider: false,
  providerOptions
});

let web3Provider = null;
let signer = null;
let accountAddr = null;

const connectBtn = document.getElementById('connectBtn');
const walletPanel = document.getElementById('walletPanel');
const addrEl = document.getElementById('addr');
const balEl = document.getElementById('bal');
const netEl = document.getElementById('net');

async function doConnect(){
  try{
    const instance = await web3Modal.connect();
    web3Provider = new ethers.providers.Web3Provider(instance);
    signer = web3Provider.getSigner();
    accountAddr = await signer.getAddress();
    const balance = await web3Provider.getBalance(accountAddr);
    const network = await web3Provider.getNetwork();

    // Show panel
    addrEl.textContent = `${accountAddr.slice(0,6)}...${accountAddr.slice(-4)}`;
    balEl.textContent = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
    netEl.textContent = network.name || network.chainId;

    walletPanel.classList.remove('hidden');
    walletPanel.setAttribute('aria-hidden','false');

    // listen to events if provider supports
    if(instance.on){
      instance.on('accountsChanged', (accounts) => {
        if(accounts.length === 0) doDisconnect();
        else addrEl.textContent = `${accounts[0].slice(0,6)}...${accounts[0].slice(-4)}`;
      });
      instance.on('chainChanged', ()=> window.location.reload());
      instance.on('disconnect', ()=> doDisconnect());
    }

  }catch(e){
    console.error("connect error", e);
    alert("Failed to connect wallet. Ensure you have a Web3 wallet (e.g. MetaMask) or use WalletConnect.");
  }
}

async function doDisconnect(){
  try{
    if(web3Provider && web3Provider.provider && web3Provider.provider.disconnect){
      await web3Provider.provider.disconnect();
    }
  }catch(e){/*ignore*/}
  web3Provider = null; signer = null; accountAddr = null;
  walletPanel.classList.add('hidden');
  walletPanel.setAttribute('aria-hidden','true');
  addrEl.textContent = '—';
  balEl.textContent = '—';
  netEl.textContent = '—';
}

connectBtn.addEventListener('click', () => {
  // If connected -> disconnect (toggle) or connect otherwise
  if(accountAddr) doDisconnect();
  else doConnect();
});
