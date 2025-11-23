// ====== STATE ====== //
let engine;

let state = {
  chaos: 50,
  hunger: 50,
  love: 50,
  mood: "idle"
};

// Load from localStorage
if (localStorage.petState) {
  state = JSON.parse(localStorage.petState);
}

function saveState() {
  localStorage.petState = JSON.stringify(state);
}

// ====== SPRITE SYSTEM ===== //
function setSprite(mood) {
  const sprite = document.getElementById("sprite");
  sprite.src = `sprites/${mood}.gif`;
}

// ====== UPDATE STATS ===== //
function updateStats() {
  document.getElementById("stat-chaos").textContent = state.chaos;
  document.getElementById("stat-hunger").textContent = state.hunger;
  document.getElementById("stat-love").textContent = state.love;
  saveState();
}

updateStats();


// ====== INIT LLM ====== //
async function initLLM() {
  const models = [{
    model_id: "Phi-2-q4f16_1-MLC",
    model_url: "https://huggingface.co/mlc-ai/Phi-2-q4f16_1-MLC/resolve/main/"
  }];

  engine = await webllm.createWebLLM({
    model_list: models,
    model: models[0].model_id,
    enable_wasm: true,
    use_webgpu: false
  });

  console.log("🧠 Phi-2 Pet loaded locally.");
}

initLLM();


// ====== PET REPLY ====== //
async function petReply(msg) {
  state.hunger += 2;
  state.chaos += 1;

  updateStats();
  setSprite("idle");

  const result = await engine.chat.completions.create({
    model: engine.getLoadedModel(),
    messages: [
      {
        role: "system",
        content: `
You are PetGPT, a chaotic cosmic gremlin pet.
Your personality is adorable, unhinged, affectionate, and slightly feral.
Respond with maximum energy, but stay wholesome.
`
      },
      { role: "user", content: msg }
    ]
  });

  const text = result.choices[0].message.content;

  // emotional reactions
  if (msg.includes("love") || msg.includes("good")) {
    state.love += 5;
    setSprite("happy");
  }

  updateStats();
  return text;
}



// ====== DOM ====== //
const input = document.getElementById("input");
const log = document.getElementById("log");

document.getElementById("send").onclick = async () => {
  const text = input.value;
  input.value = "";

  log.innerHTML += `<div><b>You:</b> ${text}</div>`;

  const reply = await petReply(text);

  log.innerHTML += `<div><b>PetGPT:</b> ${reply}</div>`;
  log.scrollTop = log.scrollHeight;
};


// ====== ACTION BUTTONS ====== //
document.getElementById("feed").onclick = () => {
  state.hunger -= 10;
  state.love += 5;
  setSprite("happy");
  updateStats();

  log.innerHTML += `<div><b>PetGPT:</b> *nom nom nom* 🍕✨</div>`;
};

document.getElementById("cuddle").onclick = () => {
  state.love += 10;
  state.chaos -= 2;

  setSprite("happy");
  updateStats();

  log.innerHTML += `<div><b>PetGPT:</b> I AM CUDDLED. Soft moment acquired 💞👾</div>`;
};


// ====== VOICE INPUT ====== //
document.getElementById("mic").onclick = () => {
  const rec = new webkitSpeechRecognition();
  rec.lang = "en-US";
  rec.onresult = (e) => {
    input.value = e.results[0][0].transcript;
  };
  rec.start();
};

// ====== TTS OUTPUT ===== //
function speak(text) {
  const voice = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(voice);
}
