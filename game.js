/* Forest Dash Fighters
   A two-player local canvas racing and combat game.
   Open index.html directly in a modern browser to play. */

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const STATES = {
  START: "start",
  COUNTDOWN: "countdown",
  PLAYING: "playing",
  FINISHED: "finished",
  RESTARTING: "restarting"
};

const VIEW = { width: 1280, height: 720 };
const GRAVITY = 2300;
const FINISH_X = 7600;
const SECRET_CHARACTER_ID = "runner-2";
const SECRET_UNLOCK_STREAK = 5;
const DANU_CHARACTER_ID = "runner-4";
const DANU_UNLOCK_STREAK = 10;
const DEFAULT_PLAYER_CONTROLS = [
  { left: "KeyA", right: "KeyD", jump: "KeyW", attack: "KeyF" },
  { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp", attack: "KeyM" }
];
const CONTROL_ACTIONS = ["left", "right", "jump", "attack"];

/* Sprite crop configuration.
   Each character in CHARACTER_ROSTER can have its own frames object. The current
   values are easy-to-edit placeholders based on the first supplied character
   sheet. If a new image uses a different layout, copy this object and change
   sx, sy, sw, and sh for that character. Left-facing frames use flipX. */
const DEFAULT_SPRITE_FRAMES = {
  idle: {
    right: { sx: 420, sy: 250, sw: 72, sh: 122, dw: 58, dh: 98, flipX: false },
    left: { sx: 420, sy: 250, sw: 72, sh: 122, dw: 58, dh: 98, flipX: true }
  },
  run: {
    right: [
      { sx: 420, sy: 250, sw: 72, sh: 122, dw: 58, dh: 98, flipX: false },
      { sx: 420, sy: 250, sw: 72, sh: 122, dw: 58, dh: 98, flipX: false },
      { sx: 420, sy: 446, sw: 72, sh: 122, dw: 58, dh: 98, flipX: false },
      { sx: 420, sy: 446, sw: 72, sh: 122, dw: 58, dh: 98, flipX: false }
    ],
    left: [
      { sx: 420, sy: 250, sw: 72, sh: 122, dw: 58, dh: 98, flipX: true },
      { sx: 420, sy: 250, sw: 72, sh: 122, dw: 58, dh: 98, flipX: true },
      { sx: 420, sy: 446, sw: 72, sh: 122, dw: 58, dh: 98, flipX: true },
      { sx: 420, sy: 446, sw: 72, sh: 122, dw: 58, dh: 98, flipX: true }
    ]
  },
  jump: {
    right: { sx: 420, sy: 446, sw: 72, sh: 122, dw: 58, dh: 98, flipX: false },
    left: { sx: 420, sy: 446, sw: 72, sh: 122, dw: 58, dh: 98, flipX: true }
  },
  attack: {
    right: { sx: 290, sy: 250, sw: 72, sh: 122, dw: 60, dh: 100, flipX: false },
    left: { sx: 290, sy: 250, sw: 72, sh: 122, dw: 60, dh: 100, flipX: true }
  }
};

function transformSpriteFrames(frames, transform) {
  const tx = transform || {};
  const convert = (frame) => ({
    ...frame,
    sx: Math.round(frame.sx * (tx.scaleX || 1) + (tx.shiftX || 0)),
    sy: Math.round(frame.sy * (tx.scaleY || 1) + (tx.shiftY || 0)),
    sw: Math.round(frame.sw * (tx.scaleX || 1)),
    sh: Math.round(frame.sh * (tx.scaleY || 1))
  });
  const convertState = (state) => ({
    right: Array.isArray(state.right) ? state.right.map(convert) : convert(state.right),
    left: Array.isArray(state.left) ? state.left.map(convert) : convert(state.left)
  });
  return {
    idle: convertState(frames.idle),
    run: convertState(frames.run),
    jump: convertState(frames.jump),
    attack: convertState(frames.attack)
  };
}

const SHORT_SPRITE_FRAMES = transformSpriteFrames(DEFAULT_SPRITE_FRAMES, { shiftY: -30 });
const POON_SPRITE_FRAMES = {
  idle: {
    right: { sx: 44, sy: 214, sw: 76, sh: 126, dw: 58, dh: 98, flipX: false },
    left: { sx: 44, sy: 214, sw: 76, sh: 126, dw: 58, dh: 98, flipX: true }
  },
  run: {
    right: [
      { sx: 412, sy: 214, sw: 76, sh: 126, dw: 58, dh: 98, flipX: false },
      { sx: 412, sy: 214, sw: 76, sh: 126, dw: 58, dh: 98, flipX: false },
      { sx: 412, sy: 382, sw: 76, sh: 126, dw: 58, dh: 98, flipX: false },
      { sx: 412, sy: 382, sw: 76, sh: 126, dw: 58, dh: 98, flipX: false }
    ],
    left: [
      { sx: 412, sy: 214, sw: 76, sh: 126, dw: 58, dh: 98, flipX: true },
      { sx: 412, sy: 214, sw: 76, sh: 126, dw: 58, dh: 98, flipX: true },
      { sx: 412, sy: 382, sw: 76, sh: 126, dw: 58, dh: 98, flipX: true },
      { sx: 412, sy: 382, sw: 76, sh: 126, dw: 58, dh: 98, flipX: true }
    ]
  },
  jump: {
    right: { sx: 44, sy: 382, sw: 76, sh: 126, dw: 58, dh: 98, flipX: false },
    left: { sx: 44, sy: 382, sw: 76, sh: 126, dw: 58, dh: 98, flipX: true }
  },
  attack: {
    right: { sx: 286, sy: 382, sw: 76, sh: 126, dw: 60, dh: 100, flipX: false },
    left: { sx: 286, sy: 382, sw: 76, sh: 126, dw: 60, dh: 100, flipX: true }
  }
};

const PHU_SPRITE_FRAMES = {
  idle: {
    right: { sx: 502, sy: 172, sw: 82, sh: 166, dw: 58, dh: 98, flipX: false },
    left: { sx: 502, sy: 172, sw: 82, sh: 166, dw: 58, dh: 98, flipX: true }
  },
  run: {
    right: [
      { sx: 502, sy: 172, sw: 82, sh: 166, dw: 58, dh: 98, flipX: false },
      { sx: 502, sy: 172, sw: 82, sh: 166, dw: 58, dh: 98, flipX: false },
      { sx: 502, sy: 380, sw: 82, sh: 166, dw: 58, dh: 98, flipX: false },
      { sx: 502, sy: 380, sw: 82, sh: 166, dw: 58, dh: 98, flipX: false }
    ],
    left: [
      { sx: 502, sy: 172, sw: 82, sh: 166, dw: 58, dh: 98, flipX: true },
      { sx: 502, sy: 172, sw: 82, sh: 166, dw: 58, dh: 98, flipX: true },
      { sx: 502, sy: 380, sw: 82, sh: 166, dw: 58, dh: 98, flipX: true },
      { sx: 502, sy: 380, sw: 82, sh: 166, dw: 58, dh: 98, flipX: true }
    ]
  },
  jump: {
    right: { sx: 502, sy: 380, sw: 82, sh: 166, dw: 58, dh: 98, flipX: false },
    left: { sx: 502, sy: 380, sw: 82, sh: 166, dw: 58, dh: 98, flipX: true }
  },
  attack: {
    right: { sx: 342, sy: 380, sw: 82, sh: 166, dw: 60, dh: 100, flipX: false },
    left: { sx: 342, sy: 380, sw: 82, sh: 166, dw: 60, dh: 100, flipX: true }
  }
};

const WIDE_SPRITE_FRAMES = transformSpriteFrames(DEFAULT_SPRITE_FRAMES, {
  scaleX: 1293 / 1024,
  scaleY: 816 / 646
});

const PNG_CHARACTER_FRAMES = {
  idle: {
    right: { sx: 775, sy: 385, sw: 170, sh: 300, dw: 58, dh: 98, flipX: false },
    left: { sx: 575, sy: 385, sw: 170, sh: 300, dw: 58, dh: 98, flipX: false }
  },
  run: {
    right: [
      { sx: 775, sy: 385, sw: 170, sh: 300, dw: 58, dh: 98, flipX: false },
      { sx: 775, sy: 710, sw: 170, sh: 300, dw: 58, dh: 98, flipX: false },
      { sx: 575, sy: 710, sw: 170, sh: 300, dw: 58, dh: 98, flipX: true }
    ],
    left: [
      { sx: 575, sy: 385, sw: 170, sh: 300, dw: 58, dh: 98, flipX: false },
      { sx: 575, sy: 710, sw: 170, sh: 300, dw: 58, dh: 98, flipX: false },
      { sx: 775, sy: 710, sw: 170, sh: 300, dw: 58, dh: 98, flipX: true }
    ]
  },
  jump: {
    right: { sx: 775, sy: 385, sw: 170, sh: 300, dw: 58, dh: 98, flipX: false },
    left: { sx: 575, sy: 385, sw: 170, sh: 300, dw: 58, dh: 98, flipX: false }
  },
  attack: {
    right: { sx: 775, sy: 385, sw: 170, sh: 300, dw: 60, dh: 100, flipX: false },
    left: { sx: 575, sy: 385, sw: 170, sh: 300, dw: 60, dh: 100, flipX: false }
  }
};

const GOOOD_PNG_CHARACTER_FRAMES = {
  idle: {
    right: { sx: 900, sy: 290, sw: 140, sh: 250, dw: 58, dh: 98, flipX: false },
    left: { sx: 595, sy: 800, sw: 140, sh: 250, dw: 58, dh: 98, flipX: false }
  },
  run: {
    right: [
      { sx: 900, sy: 290, sw: 140, sh: 250, dw: 58, dh: 98, flipX: false },
      { sx: 900, sy: 800, sw: 140, sh: 250, dw: 58, dh: 98, flipX: false },
      { sx: 755, sy: 800, sw: 140, sh: 250, dw: 58, dh: 98, flipX: false }
    ],
    left: [
      { sx: 595, sy: 800, sw: 140, sh: 250, dw: 58, dh: 98, flipX: false },
      { sx: 755, sy: 800, sw: 140, sh: 250, dw: 58, dh: 98, flipX: true },
      { sx: 900, sy: 800, sw: 140, sh: 250, dw: 58, dh: 98, flipX: true }
    ]
  },
  jump: {
    right: { sx: 900, sy: 290, sw: 140, sh: 250, dw: 58, dh: 98, flipX: false },
    left: { sx: 595, sy: 800, sw: 140, sh: 250, dw: 58, dh: 98, flipX: false }
  },
  attack: {
    right: { sx: 900, sy: 290, sw: 140, sh: 250, dw: 60, dh: 100, flipX: false },
    left: { sx: 595, sy: 800, sw: 140, sh: 250, dw: 60, dh: 100, flipX: false }
  }
};

const PHU_PNG_CHARACTER_FRAMES = {
  idle: {
    right: { sx: 925, sy: 300, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false },
    left: { sx: 360, sy: 300, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false }
  },
  run: {
    right: [
      { sx: 925, sy: 300, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false },
      { sx: 925, sy: 700, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false },
      { sx: 625, sy: 700, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false }
    ],
    left: [
      { sx: 360, sy: 300, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false },
      { sx: 360, sy: 700, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false },
      { sx: 625, sy: 700, sw: 180, sh: 320, dw: 58, dh: 98, flipX: true }
    ]
  },
  jump: {
    right: { sx: 925, sy: 300, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false },
    left: { sx: 360, sy: 300, sw: 180, sh: 320, dw: 58, dh: 98, flipX: false }
  },
  attack: {
    right: { sx: 925, sy: 300, sw: 180, sh: 320, dw: 60, dh: 100, flipX: false },
    left: { sx: 360, sy: 300, sw: 180, sh: 320, dw: 60, dh: 100, flipX: false }
  }
};

const TALL_SPRITE_FRAMES = {
  idle: {
    right: { sx: 352, sy: 302, sw: 92, sh: 154, dw: 58, dh: 98, flipX: false },
    left: { sx: 352, sy: 302, sw: 92, sh: 154, dw: 58, dh: 98, flipX: true }
  },
  run: {
    right: [
      { sx: 352, sy: 302, sw: 92, sh: 154, dw: 58, dh: 98, flipX: false },
      { sx: 196, sy: 790, sw: 92, sh: 154, dw: 58, dh: 98, flipX: false },
      { sx: 350, sy: 790, sw: 92, sh: 154, dw: 58, dh: 98, flipX: false }
    ],
    left: [
      { sx: 352, sy: 302, sw: 92, sh: 154, dw: 58, dh: 98, flipX: true },
      { sx: 196, sy: 790, sw: 92, sh: 154, dw: 58, dh: 98, flipX: true },
      { sx: 350, sy: 790, sw: 92, sh: 154, dw: 58, dh: 98, flipX: true }
    ]
  },
  jump: {
    right: { sx: 350, sy: 790, sw: 92, sh: 154, dw: 58, dh: 98, flipX: false },
    left: { sx: 350, sy: 790, sw: 92, sh: 154, dw: 58, dh: 98, flipX: true }
  },
  attack: {
    right: { sx: 196, sy: 790, sw: 92, sh: 154, dw: 60, dh: 100, flipX: false },
    left: { sx: 196, sy: 790, sw: 92, sh: 154, dw: 60, dh: 100, flipX: true }
  }
};

const CHARACTER_ROSTER = [
  { id: "fawad", name: "Fawad", imagePath: "assets/characters/FAWAD.png", frames: PNG_CHARACTER_FRAMES },
  { id: "runner-1", name: "GOOOD", imagePath: "assets/characters/GOOOD.png", frames: GOOOD_PNG_CHARACTER_FRAMES },
  { id: SECRET_CHARACTER_ID, name: "SECRET: MUSIC", imagePath: "assets/characters/MUSIC.png", frames: PNG_CHARACTER_FRAMES, unlockStreak: SECRET_UNLOCK_STREAK },
  { id: "runner-3", name: "PHU", imagePath: "assets/characters/PHU.png", frames: PHU_PNG_CHARACTER_FRAMES },
  { id: DANU_CHARACTER_ID, name: "DANU", imagePath: "assets/characters/DANU.png", frames: PNG_CHARACTER_FRAMES, unlockStreak: DANU_UNLOCK_STREAK },
  { id: "runner-5", name: "POON", imagePath: "assets/characters/POON.png", frames: PNG_CHARACTER_FRAMES },
  { id: "runner-6", name: "SCI", imagePath: "assets/characters/SCI.png", frames: PNG_CHARACTER_FRAMES },
  { id: "runner-7", name: "TRAV", imagePath: "assets/characters/TRAV.png", frames: PNG_CHARACTER_FRAMES },
  { id: "runner-8", name: "BAEM", imagePath: "assets/characters/BEAM.png", frames: PNG_CHARACTER_FRAMES },
  { id: "gemini-1", name: "ETIENNE", imagePath: "assets/characters/ETIENNE.png", frames: PNG_CHARACTER_FRAMES },
  { id: "gemini-2", name: "PISUT", imagePath: "assets/characters/PISUT.png", frames: PNG_CHARACTER_FRAMES },
  { id: "gemini-3", name: "ANTOINE", imagePath: "assets/characters/ANTOINE.png", frames: PNG_CHARACTER_FRAMES },
  { id: "gemini-4", name: "CHANON", imagePath: "assets/characters/CHANON.png", frames: PNG_CHARACTER_FRAMES },
  { id: "gemini-5", name: "IRVING", imagePath: "assets/characters/IRVING.png", frames: PNG_CHARACTER_FRAMES },
  { id: "gemini-6", name: "MARK", imagePath: "assets/characters/MARK.png", frames: PNG_CHARACTER_FRAMES },
  { id: "gemini-7", name: "JAMES", imagePath: "assets/characters/JAME.png", frames: PNG_CHARACTER_FRAMES }
];

const PLAYER_TUNING = {
  maxHealth: 100,
  acceleration: 2500,
  friction: 0.82,
  maxSpeed: 430,
  jumpStrength: 850,
  attackDamage: 18,
  attackKnockback: 820,
  attackRange: 78,
  attackCooldown: 0.55,
  attackDuration: 0.18,
  invincibleTime: 0.9,
  respawnBehind: 240
};

const ITEM_INFO = {
  speed: { label: "SPD", color: "#41d6ff", duration: 3 },
  shield: { label: "SHD", color: "#74f28a", duration: 3 },
  health: { label: "HP", color: "#ff5f68", duration: 0 },
  power: { label: "POW", color: "#ffbc35", duration: 3 },
  jump: { label: "JMP", color: "#ba7cff", duration: 3 }
};

const ui = {
  startScreen: document.getElementById("startScreen"),
  finishScreen: document.getElementById("finishScreen"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
  homeButton: document.getElementById("homeButton"),
  hudHomeButton: document.getElementById("hudHomeButton"),
  countdown: document.getElementById("countdown"),
  winnerText: document.getElementById("winnerText"),
  raceStatus: document.getElementById("raceStatus"),
  finishDistance: document.getElementById("finishDistance"),
  p1Name: document.getElementById("p1Name"),
  p2Name: document.getElementById("p2Name"),
  p1Health: document.getElementById("p1Health"),
  p2Health: document.getElementById("p2Health"),
  p1Effects: document.getElementById("p1Effects"),
  p2Effects: document.getElementById("p2Effects"),
  p1Distance: document.getElementById("p1Distance"),
  p2Distance: document.getElementById("p2Distance"),
  p1CharacterGrid: document.getElementById("p1CharacterGrid"),
  p2CharacterGrid: document.getElementById("p2CharacterGrid"),
  p1Selected: document.getElementById("p1Selected"),
  p2Selected: document.getElementById("p2Selected"),
  keybindButtons: document.querySelectorAll(".keybind-button")
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function cloneDefaultControls() {
  return DEFAULT_PLAYER_CONTROLS.map((controls) => ({ ...controls }));
}

function formatKey(code) {
  if (!code) return "?";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Arrow")) return code.slice(5);
  if (code === "Space") return "Space";
  if (code === "Escape") return "Esc";
  return code.replace(/^(Left|Right)/, "");
}

function horizontalOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x;
}

function drawPixelRect(context, x, y, w, h, color, shadow) {
  context.fillStyle = shadow || "rgba(0,0,0,0.18)";
  context.fillRect(Math.round(x + 4), Math.round(y + 4), Math.round(w), Math.round(h));
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

class Input {
  constructor() {
    this.keys = new Set();
    window.addEventListener("keydown", (event) => {
      if (game?.captureKeybind(event.code)) {
        event.preventDefault();
        return;
      }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      this.keys.add(event.code);
      if (event.code === "KeyR") game.restartRace();
      if (event.code === "KeyH") game.goHome();
      const activeElement = document.activeElement;
      const canQuickStart = activeElement === document.body || activeElement === canvas;
      if ((event.code === "Enter" || event.code === "Space") && game.state === STATES.START && canQuickStart) {
        game.beginCountdown();
      }
    });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
  }

  down(code) {
    return this.keys.has(code);
  }
}

class SoundManager {
  constructor() {
    this.enabled = true;
    this.sounds = {
      jump: this.makeAudio("assets/audio/jump.wav"),
      attack: this.makeAudio("assets/audio/attack.wav"),
      hit: this.makeAudio("assets/audio/hit.wav"),
      item: this.makeAudio("assets/audio/item.wav"),
      finish: this.makeAudio("assets/audio/finish.wav"),
      music: this.makeAudio("assets/audio/music.mp3", true)
    };
  }

  makeAudio(path, loop = false) {
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.loop = loop;
    audio.volume = loop ? 0.28 : 0.55;
    audio.addEventListener("error", () => {
      audio.dataset.missing = "true";
    });
    return audio;
  }

  play(name) {
    const base = this.sounds[name];
    if (!this.enabled || !base || base.dataset.missing === "true") return;
    try {
      const instance = base.cloneNode();
      instance.volume = base.volume;
      instance.play().catch(() => {});
    } catch (error) {
      this.enabled = false;
    }
  }

  startMusic() {
    const music = this.sounds.music;
    if (!music || music.dataset.missing === "true") return;
    music.play().catch(() => {});
  }
}

class Camera {
  constructor(levelWidth) {
    this.x = 0;
    this.y = 0;
    this.levelWidth = levelWidth;
    this.splitActive = true;
    this.splitCameras = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  }

  update(players, dt) {
    this.splitActive = true;

    const lead = Math.max(players[0].x, players[1].x);
    const midpoint = (players[0].centerX + players[1].centerX) / 2;
    const targetCenter = lerp(midpoint, lead + 160, 0.58);
    const targetX = clamp(targetCenter - VIEW.width * 0.5, 0, this.levelWidth - VIEW.width);
    this.x = lerp(this.x, targetX, clamp(dt * 4.2, 0, 1));

    const halfWidth = VIEW.width / 2;
    for (let i = 0; i < players.length; i += 1) {
      const targetSplitX = clamp(players[i].centerX - halfWidth * 0.5, 0, this.levelWidth - halfWidth);
      this.splitCameras[i].x = lerp(this.splitCameras[i].x, targetSplitX, clamp(dt * 5.6, 0, 1));
    }
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.splitActive = true;
    this.splitCameras = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  }
}

class Platform {
  constructor({ x, y, w, h, type = "grass", moving = null }) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.baseX = x;
    this.baseY = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.moving = moving;
    this.time = 0;
    this.dx = 0;
    this.dy = 0;
  }

  update(dt) {
    this.dx = 0;
    this.dy = 0;
    this.oldX = this.x;
    this.oldY = this.y;
    if (!this.moving) return;
    this.time += dt;
    const wave = Math.sin(this.time * this.moving.speed + this.moving.offset);
    this.x = this.baseX + wave * (this.moving.rangeX || 0);
    this.y = this.baseY + wave * (this.moving.rangeY || 0);
    this.dx = this.x - this.oldX;
    this.dy = this.y - this.oldY;
  }

  draw(context, camera) {
    const sx = Math.round(this.x - camera.x);
    const sy = Math.round(this.y - camera.y);
    if (sx + this.w < -80 || sx > VIEW.width + 80) return;

    if (this.type === "bridge") {
      context.fillStyle = "#6f4a2b";
      context.fillRect(sx, sy + 8, this.w, this.h - 8);
      for (let x = 0; x < this.w; x += 34) {
        context.fillStyle = x % 68 === 0 ? "#9a6a36" : "#7f552f";
        context.fillRect(sx + x, sy, 28, 14);
      }
      return;
    }

    if (this.type === "log") {
      context.fillStyle = "#7b4b2a";
      context.fillRect(sx, sy + 10, this.w, this.h - 10);
      context.fillStyle = "#a96f38";
      context.fillRect(sx, sy, this.w, 18);
      context.fillStyle = "#50321f";
      context.fillRect(sx + 12, sy + 5, this.w - 24, 4);
      return;
    }

    if (this.type === "moving") {
      context.fillStyle = "#5e7f47";
      context.fillRect(sx, sy, this.w, this.h);
      context.fillStyle = "#cde88d";
      context.fillRect(sx + 4, sy + 4, this.w - 8, 8);
      return;
    }

    context.fillStyle = "#5b8f3b";
    context.fillRect(sx, sy, this.w, this.h);
    context.fillStyle = "#8bd653";
    context.fillRect(sx, sy, this.w, 14);
    context.fillStyle = "#3c6c35";
    for (let x = 0; x < this.w; x += 18) {
      context.fillRect(sx + x, sy + 14, 8, 6);
    }
  }
}

class Hazard {
  constructor({ x, y, w, h, type = "spikes" }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.pulse = Math.random() * 10;
  }

  update(dt) {
    this.pulse += dt;
  }

  draw(context, camera) {
    const sx = Math.round(this.x - camera.x);
    const sy = Math.round(this.y - camera.y);
    if (sx + this.w < -60 || sx > VIEW.width + 60) return;
    const bob = Math.sin(this.pulse * 5) * 2;
    if (this.type === "plant") {
      for (let x = 0; x < this.w; x += 18) {
        context.fillStyle = "#287a3c";
        context.fillRect(sx + x + 7, sy + 10, 5, this.h - 10);
        context.fillStyle = "#d7434d";
        context.fillRect(sx + x + 2, sy + bob, 15, 15);
        context.fillStyle = "#fff0a0";
        context.fillRect(sx + x + 7, sy + bob + 5, 4, 4);
      }
      return;
    }
    context.fillStyle = "#36413d";
    for (let x = 0; x < this.w; x += 18) {
      context.beginPath();
      context.moveTo(sx + x, sy + this.h);
      context.lineTo(sx + x + 9, sy);
      context.lineTo(sx + x + 18, sy + this.h);
      context.closePath();
      context.fill();
    }
  }
}

class Item {
  constructor({ x, y, type }) {
    this.x = x;
    this.y = y;
    this.w = 34;
    this.h = 34;
    this.type = type;
    this.active = true;
    this.respawnTimer = 0;
    this.respawnDelay = 10;
    this.floatTime = Math.random() * 6;
  }

  update(dt) {
    this.floatTime += dt;
    if (!this.active) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.active = true;
    }
  }

  collect(player, gameInstance) {
    if (!this.active) return;
    this.active = false;
    this.respawnTimer = this.respawnDelay;
    player.applyItem(this.type);
    gameInstance.sounds.play("item");
    gameInstance.burst(this.x + this.w / 2, this.y + this.h / 2, ITEM_INFO[this.type].color, 16);
  }

  draw(context, camera) {
    if (!this.active) return;
    const info = ITEM_INFO[this.type];
    const bob = Math.sin(this.floatTime * 3) * 7;
    const sx = Math.round(this.x - camera.x);
    const sy = Math.round(this.y + bob - camera.y);
    if (sx + this.w < -40 || sx > VIEW.width + 40) return;
    context.fillStyle = "rgba(255,255,255,0.3)";
    context.fillRect(sx - 4, sy - 4, this.w + 8, this.h + 8);
    context.fillStyle = info.color;
    context.fillRect(sx, sy, this.w, this.h);
    context.fillStyle = "#18251b";
    context.font = "900 12px Trebuchet MS";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(info.label, sx + this.w / 2, sy + this.h / 2 + 1);
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 360;
    this.vy = -Math.random() * 260 - 80;
    this.life = 0.45 + Math.random() * 0.35;
    this.maxLife = this.life;
    this.size = 4 + Math.random() * 7;
    this.color = color;
  }

  update(dt) {
    this.life -= dt;
    this.vy += 900 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(context, camera) {
    const alpha = clamp(this.life / this.maxLife, 0, 1);
    context.globalAlpha = alpha;
    context.fillStyle = this.color;
    context.fillRect(Math.round(this.x - camera.x), Math.round(this.y - camera.y), this.size, this.size);
    context.globalAlpha = 1;
  }
}

class Player {
  constructor(config) {
    this.name = config.name;
    this.shortLabel = config.shortLabel;
    this.color = config.color;
    this.tint = config.tint;
    this.controls = config.controls;
    this.startX = config.startX;
    this.startY = config.startY;
    this.w = 44;
    this.h = 86;
    this.setCharacter(config.character || CHARACTER_ROSTER[0]);
    this.resetFull();
  }

  get centerX() {
    return this.x + this.w / 2;
  }

  get centerY() {
    return this.y + this.h / 2;
  }

  get rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  resetFull() {
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.health = PLAYER_TUNING.maxHealth;
    this.facing = 1;
    this.grounded = false;
    this.attackCooldown = 0;
    this.attackTimer = 0;
    this.hitThisAttack = new Set();
    this.invincible = 0;
    this.effects = {};
    this.animTime = 0;
    this.respawnCount = 0;
  }

  setCharacter(character) {
    this.character = character;
    this.spriteImage = new Image();
    this.spriteImage.src = character.imagePath;
  }

  respawn(gameInstance) {
    const safeX = clamp(this.x - PLAYER_TUNING.respawnBehind, 80, FINISH_X - 260);
    const spawn = gameInstance.level.findSpawnPoint(safeX);
    this.x = spawn.x;
    this.y = spawn.y - this.h;
    this.vx = 0;
    this.vy = -120;
    this.health = PLAYER_TUNING.maxHealth;
    this.invincible = 1.4;
    this.attackTimer = 0;
    this.effects = {};
    this.respawnCount += 1;
    gameInstance.burst(this.centerX, this.centerY, "#ffffff", 24);
  }

  update(dt, gameInstance, opponent) {
    this.animTime += dt;
    this.invincible = Math.max(0, this.invincible - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.updateEffects(dt);

    const left = gameInstance.input.down(this.controls.left);
    const right = gameInstance.input.down(this.controls.right);
    const jump = gameInstance.input.down(this.controls.jump);
    const attack = gameInstance.input.down(this.controls.attack);
    const speedMul = this.effects.speed ? 1.38 : 1;
    const jumpMul = this.effects.jump ? 1.25 : 1;

    let direction = 0;
    if (left) direction -= 1;
    if (right) direction += 1;

    if (direction !== 0) {
      this.vx += direction * PLAYER_TUNING.acceleration * dt;
      this.facing = direction;
    } else {
      this.vx *= Math.pow(PLAYER_TUNING.friction, dt * 60);
      if (Math.abs(this.vx) < 8) this.vx = 0;
    }

    const maxSpeed = PLAYER_TUNING.maxSpeed * speedMul;
    this.vx = clamp(this.vx, -maxSpeed, maxSpeed);

    if (jump && this.grounded) {
      this.vy = -PLAYER_TUNING.jumpStrength * jumpMul;
      this.grounded = false;
      gameInstance.sounds.play("jump");
      gameInstance.burst(this.centerX, this.y + this.h, "#d7ffb0", 6);
    }

    if (attack) this.tryAttack(gameInstance);

    this.vy += GRAVITY * dt;
    this.moveAndCollide(dt, gameInstance.level);
    this.handleCombat(opponent, gameInstance);

    for (const hazard of gameInstance.level.hazards) {
      if (rectsOverlap(this.rect, hazard)) {
        this.takeDamage(16, Math.sign(this.centerX - (hazard.x + hazard.w / 2)) || -1, 520, gameInstance);
      }
    }

    for (const item of gameInstance.level.items) {
      if (item.active && rectsOverlap(this.rect, item)) {
        item.collect(this, gameInstance);
      }
    }

    if (this.y > gameInstance.level.height + 180 || this.health <= 0) {
      this.respawn(gameInstance);
    }
  }

  updateEffects(dt) {
    for (const key of Object.keys(this.effects)) {
      this.effects[key] -= dt;
      if (this.effects[key] <= 0) delete this.effects[key];
    }
  }

  moveAndCollide(dt, level) {
    const previousRect = { ...this.rect };
    this.x += this.vx * dt;
    for (const platform of level.platforms) {
      if (!rectsOverlap(this.rect, platform)) continue;
      if (platform.moving && this.wasRidingPlatform(platform, previousRect)) continue;
      if (this.vx > 0) this.x = platform.x - this.w;
      if (this.vx < 0) this.x = platform.x + platform.w;
      this.vx = 0;
    }

    this.grounded = false;
    this.y += this.vy * dt;
    for (const platform of level.platforms) {
      if (!rectsOverlap(this.rect, platform)) continue;
      const previousBottom = this.y + this.h - this.vy * dt;
      if (this.vy >= 0 && previousBottom <= platform.y + 10) {
        this.y = platform.y - this.h;
        this.vy = 0;
        this.grounded = true;
        this.x += platform.dx;
      } else if (platform.moving && this.wasRidingPlatform(platform, previousRect)) {
        this.y = platform.y - this.h;
        this.vy = Math.max(0, platform.dy);
        this.grounded = true;
        this.x += platform.dx;
      } else if (this.vy < 0) {
        this.y = platform.y + platform.h;
        this.vy = 0;
      }
    }

    this.x = clamp(this.x, 0, level.width - this.w);
  }

  wasRidingPlatform(platform, previousRect) {
    const oldPlatformRect = { x: platform.oldX, y: platform.oldY, w: platform.w, h: platform.h };
    const previousBottom = previousRect.y + previousRect.h;
    return horizontalOverlap(previousRect, oldPlatformRect)
      && previousBottom >= platform.oldY - 12
      && previousBottom <= platform.oldY + 18;
  }

  tryAttack(gameInstance) {
    if (this.attackCooldown > 0 || this.attackTimer > 0) return;
    this.attackCooldown = PLAYER_TUNING.attackCooldown;
    this.attackTimer = PLAYER_TUNING.attackDuration;
    this.hitThisAttack.clear();
    gameInstance.sounds.play("attack");
    const effectX = this.facing > 0 ? this.x + this.w + 28 : this.x - 28;
    gameInstance.burst(effectX, this.y + 36, this.effects.power ? "#ffd35a" : "#ffffff", 8);
  }

  getAttackBox() {
    const range = PLAYER_TUNING.attackRange;
    return {
      x: this.facing > 0 ? this.x + this.w - 6 : this.x - range + 6,
      y: this.y + 18,
      w: range,
      h: 46
    };
  }

  handleCombat(opponent, gameInstance) {
    if (this.attackTimer <= 0) return;
    if (this.hitThisAttack.has(opponent.name)) return;
    if (!rectsOverlap(this.getAttackBox(), opponent.rect)) return;
    const damage = this.effects.power ? PLAYER_TUNING.attackDamage * 1.65 : PLAYER_TUNING.attackDamage;
    const knockback = this.effects.power ? PLAYER_TUNING.attackKnockback * 3.2 : PLAYER_TUNING.attackKnockback;
    opponent.takeDamage(damage, this.facing, knockback, gameInstance);
    this.hitThisAttack.add(opponent.name);
  }

  takeDamage(rawDamage, direction, knockback, gameInstance) {
    if (this.invincible > 0) return;
    const shielded = Boolean(this.effects.shield);
    const damage = shielded ? rawDamage * 0.25 : rawDamage;
    this.health = clamp(this.health - damage, 0, PLAYER_TUNING.maxHealth);
    this.invincible = PLAYER_TUNING.invincibleTime;
    this.vx += direction * knockback * (shielded ? 0.45 : 1);
    this.vy = Math.min(this.vy, -320);
    gameInstance.sounds.play("hit");
    gameInstance.burst(this.centerX, this.centerY, shielded ? "#74f28a" : "#ff5f68", 16);
  }

  applyItem(type) {
    if (type === "health") {
      this.health = clamp(this.health + 35, 0, PLAYER_TUNING.maxHealth);
      return;
    }
    this.effects[type] = ITEM_INFO[type].duration;
  }

  draw(context, camera) {
    const flash = this.invincible > 0 && Math.floor(this.invincible * 18) % 2 === 0;
    if (flash) context.globalAlpha = 0.5;

    const frame = this.pickFrame();
    const dx = Math.round(this.x - camera.x + this.w / 2 - frame.dw / 2);
    const dy = Math.round(this.y - camera.y + this.h - frame.dh + 4);

    if (this.spriteImage.complete && this.spriteImage.naturalWidth > 0) {
      context.save();
      if (frame.flipX) {
        context.translate(dx + frame.dw, dy);
        context.scale(-1, 1);
        context.drawImage(this.spriteImage, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, frame.dw, frame.dh);
      } else {
        context.drawImage(this.spriteImage, frame.sx, frame.sy, frame.sw, frame.sh, dx, dy, frame.dw, frame.dh);
      }
      context.restore();
    } else {
      this.drawFallback(context, camera);
    }

    if (this.effects.shield) {
      context.strokeStyle = "rgba(116, 242, 138, 0.85)";
      context.lineWidth = 4;
      context.strokeRect(Math.round(this.x - camera.x - 8), Math.round(this.y - camera.y - 8), this.w + 16, this.h + 16);
    }

    if (this.attackTimer > 0) this.drawAttack(context, camera);
    this.drawHealthBar(context, camera);
    context.globalAlpha = 1;
  }

  pickFrame() {
    const side = this.facing >= 0 ? "right" : "left";
    const frames = this.character.frames || DEFAULT_SPRITE_FRAMES;
    if (this.attackTimer > 0) return frames.attack[side];
    if (!this.grounded) return frames.jump[side];
    if (Math.abs(this.vx) > 35) {
      const runFrames = frames.run[side];
      return runFrames[Math.floor(this.animTime * 10) % runFrames.length];
    }
    return frames.idle[side];
  }

  drawFallback(context, camera) {
    const x = Math.round(this.x - camera.x);
    const y = Math.round(this.y - camera.y);
    drawPixelRect(context, x + 8, y + 18, 28, 48, this.color);
    drawPixelRect(context, x + 10, y, 24, 24, "#f2b37d");
    context.fillStyle = "#1f1c24";
    context.fillRect(x + 7, y - 6, 30, 14);
    context.fillStyle = this.facing > 0 ? "#ffffff" : "#101010";
    context.fillRect(x + (this.facing > 0 ? 28 : 12), y + 9, 5, 5);
  }

  drawAttack(context, camera) {
    const box = this.getAttackBox();
    const sx = Math.round(box.x - camera.x);
    const sy = Math.round(box.y - camera.y);
    context.globalAlpha = 0.75;
    context.fillStyle = this.effects.power ? "#ffd35a" : "#f8fbff";
    context.fillRect(sx, sy + 8, box.w, 8);
    context.fillRect(sx + (this.facing > 0 ? box.w - 14 : 6), sy, 10, box.h);
    context.globalAlpha = 1;
  }

  drawHealthBar(context, camera) {
    const x = Math.round(this.x - camera.x - 8);
    const y = Math.round(this.y - camera.y - 24);
    const label = this.shortLabel || this.name;
    const labelWidth = Math.max(30, label.length * 8 + 12);
    const labelX = Math.round(this.x - camera.x + this.w / 2 - labelWidth / 2);
    const labelY = y - 19;
    context.fillStyle = "rgba(23, 32, 25, 0.88)";
    context.fillRect(labelX, labelY, labelWidth, 15);
    context.strokeStyle = this.tint;
    context.lineWidth = 2;
    context.strokeRect(labelX, labelY, labelWidth, 15);
    context.fillStyle = "#fff7b0";
    context.font = "900 10px Trebuchet MS";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, labelX + labelWidth / 2, labelY + 8);

    context.fillStyle = "#172019";
    context.fillRect(x, y, this.w + 16, 9);
    context.fillStyle = this.tint;
    context.fillRect(x + 2, y + 2, (this.w + 12) * (this.health / PLAYER_TUNING.maxHealth), 5);
  }
}

class Level {
  constructor() {
    this.width = 8050;
    this.height = 820;
    this.platforms = [];
    this.hazards = [];
    this.items = [];
    this.decorations = [];
    this.build();
  }

  build(randomize = false) {
    const rand = (min, max) => randomize ? min + Math.random() * (max - min) : 0;
    const choose = (values) => values[Math.floor(Math.random() * values.length)];
    const itemTypes = ["speed", "jump", "shield", "health", "power"];
    this.platforms = [
      { x: 0, y: 590, w: 760, h: 160 },
      { x: 54, y: 430, w: 180, h: 30, type: "bridge" },
      { x: 860 + rand(-22, 28), y: 565 + rand(-18, 14), w: 260 + rand(-18, 26), h: 160 },
      { x: 1200 + rand(-24, 24), y: 520 + rand(-28, 20), w: 220 + rand(-20, 36), h: 34, type: "bridge" },
      { x: 1500 + rand(-32, 28), y: 555 + rand(-18, 18), w: 360 + rand(-22, 28), h: 160 },
      { x: 1960 + rand(-24, 28), y: 500 + rand(-28, 24), w: 200 + rand(-12, 28), h: 34, type: "log" },
      { x: 2260 + rand(-30, 30), y: 555 + rand(-20, 16), w: 310 + rand(-24, 34), h: 160 },
      { x: 2660 + rand(-30, 34), y: 470 + rand(-32, 26), w: 170, h: 30, type: "moving", moving: { rangeX: 90 + rand(0, 70), rangeY: 0, speed: 1.5 + rand(0, 0.7), offset: rand(0, 6) } },
      { x: 3000 + rand(-32, 26), y: 545 + rand(-18, 16), w: 300 + rand(-18, 36), h: 170 },
      { x: 3380 + rand(-34, 34), y: 470 + rand(-30, 30), w: 220 + rand(-18, 34), h: 34, type: "bridge" },
      { x: 3700 + rand(-26, 32), y: 600 + rand(-26, 0), w: 300 + rand(-30, 32), h: 130 },
      { x: 4060 + rand(-32, 32), y: 500 + rand(-26, 26), w: 170, h: 30, type: "moving", moving: { rangeX: 0, rangeY: 70 + rand(0, 45), speed: 1.35 + rand(0, 0.65), offset: rand(0, 6) } },
      { x: 4380 + rand(-30, 36), y: 545 + rand(-18, 18), w: 310 + rand(-22, 34), h: 160 },
      { x: 4760 + rand(-28, 28), y: 505 + rand(-28, 18), w: 250 + rand(-18, 28), h: 34, type: "log" },
      { x: 5080 + rand(-12, 18), y: 575 + rand(-14, 12), w: 520 + rand(-28, 34), h: 150 },
      { x: 5750 + rand(-30, 34), y: 530 + rand(-28, 22), w: 300 + rand(-22, 28), h: 150 },
      { x: 6180 + rand(-30, 30), y: 455 + rand(-34, 24), w: 180, h: 30, type: "moving", moving: { rangeX: 120 + rand(0, 65), rangeY: 0, speed: 1.6 + rand(0, 0.7), offset: rand(0, 6) } },
      { x: 6520 + rand(-34, 30), y: 510 + rand(-28, 24), w: 260 + rand(-18, 28), h: 34, type: "log" },
      { x: 6900 + rand(-34, 34), y: 575 + rand(-18, 14), w: 300 + rand(-26, 34), h: 150 },
      { x: 7280 + rand(-30, 30), y: 500 + rand(-30, 22), w: 230 + rand(-18, 28), h: 34, type: "bridge" },
      { x: 7520, y: 575, w: 530, h: 150 }
    ].map((data) => new Platform(data));

    this.hazards = [
      { x: 780 + rand(-28, 42), y: 664, w: 74, h: 42, type: randomize ? choose(["spikes", "plant"]) : "spikes" },
      { x: 1128 + rand(-35, 35), y: 654, w: 66, h: 42, type: randomize ? choose(["spikes", "plant"]) : "plant" },
      { x: 1870 + rand(-38, 38), y: 666, w: 78, h: 42, type: randomize ? choose(["spikes", "plant"]) : "spikes" },
      { x: 2580 + rand(-40, 36), y: 650, w: 82, h: 42, type: randomize ? choose(["spikes", "plant"]) : "plant" },
      { x: 3305 + rand(-42, 42), y: 650, w: 82, h: 42, type: randomize ? choose(["spikes", "plant"]) : "spikes" },
      { x: 4015 + rand(-42, 42), y: 650, w: 82, h: 42, type: randomize ? choose(["spikes", "plant"]) : "plant" },
      { x: 4698 + rand(-28, 28), y: 650, w: 58, h: 42, type: randomize ? choose(["spikes", "plant"]) : "spikes" },
      { x: 5020 + rand(-22, 18), y: 650, w: 58, h: 42, type: randomize ? choose(["spikes", "plant"]) : "plant" },
      { x: 5620 + rand(-36, 40), y: 650, w: 74, h: 42, type: randomize ? choose(["spikes", "plant"]) : "spikes" },
      { x: 6080 + rand(-38, 38), y: 650, w: 82, h: 42, type: randomize ? choose(["spikes", "plant"]) : "plant" },
      { x: 6420 + rand(-36, 36), y: 650, w: 72, h: 42, type: randomize ? choose(["spikes", "plant"]) : "spikes" },
      { x: 7240 + rand(-32, 38), y: 650, w: 78, h: 42, type: randomize ? choose(["spikes", "plant"]) : "plant" }
    ].map((data) => new Hazard(data));

    this.items = [
      { x: 560 + rand(-45, 40), y: 510 + rand(-18, 18), type: randomize ? choose(itemTypes) : "speed" },
      { x: 1030 + rand(-50, 50), y: 470 + rand(-26, 22), type: randomize ? choose(itemTypes) : "jump" },
      { x: 1320 + rand(-44, 44), y: 450 + rand(-24, 26), type: randomize ? choose(itemTypes) : "shield" },
      { x: 1770 + rand(-50, 50), y: 470 + rand(-28, 24), type: randomize ? choose(itemTypes) : "health" },
      { x: 2140 + rand(-46, 46), y: 415 + rand(-26, 26), type: randomize ? choose(itemTypes) : "power" },
      { x: 2470 + rand(-50, 48), y: 470 + rand(-28, 26), type: randomize ? choose(itemTypes) : "speed" },
      { x: 2820 + rand(-54, 54), y: 380 + rand(-28, 30), type: randomize ? choose(itemTypes) : "jump" },
      { x: 3540 + rand(-52, 52), y: 390 + rand(-26, 26), type: randomize ? choose(itemTypes) : "shield" },
      { x: 3880 + rand(-50, 50), y: 520 + rand(-22, 20), type: randomize ? choose(itemTypes) : "health" },
      { x: 4200 + rand(-50, 52), y: 380 + rand(-30, 30), type: randomize ? choose(itemTypes) : "power" },
      { x: 4890 + rand(-44, 44), y: 420 + rand(-26, 26), type: randomize ? choose(itemTypes) : "speed" },
      { x: 5860 + rand(-48, 48), y: 430 + rand(-30, 24), type: randomize ? choose(itemTypes) : "jump" },
      { x: 6260 + rand(-48, 48), y: 360 + rand(-28, 30), type: randomize ? choose(itemTypes) : "shield" },
      { x: 6660 + rand(-48, 48), y: 430 + rand(-30, 26), type: randomize ? choose(itemTypes) : "power" },
      { x: 7040 + rand(-48, 48), y: 490 + rand(-24, 22), type: randomize ? choose(itemTypes) : "health" },
      { x: 7380 + rand(-38, 38), y: 400 + rand(-26, 26), type: randomize ? choose(itemTypes) : "speed" }
    ].map((data) => new Item(data));

    this.decorations = [
      { type: "tree", x: 90 + rand(-16, 24), y: 418 }, { type: "bush", x: 350 + rand(-40, 40), y: 548 },
      { type: "rock", x: 650 + rand(-42, 42), y: 558 }, { type: "mushroom", x: 930 + rand(-42, 42), y: 532 },
      { type: "tree", x: 1510 + rand(-38, 38), y: 384 }, { type: "bush", x: 1680 + rand(-44, 44), y: 514 },
      { type: "rock", x: 2360 + rand(-46, 46), y: 524 }, { type: "mushroom", x: 3110 + rand(-46, 46), y: 512 },
      { type: "tree", x: 3740 + rand(-42, 42), y: 430 }, { type: "bush", x: 4470 + rand(-46, 46), y: 505 },
      { type: "rock", x: 5120 + rand(-24, 30), y: 540 }, { type: "mushroom", x: 5330 + rand(-24, 24), y: 540 },
      { type: "tree", x: 5800 + rand(-38, 38), y: 390 }, { type: "bush", x: 5960 + rand(-44, 44), y: 500 },
      { type: "rock", x: 6540 + rand(-42, 42), y: 480 }, { type: "mushroom", x: 6820 + rand(-44, 44), y: 542 },
      { type: "tree", x: 7100 + rand(-42, 42), y: 430 }, { type: "bush", x: 7640 + rand(-30, 30), y: 536 }
    ];
  }

  update(dt) {
    for (const platform of this.platforms) platform.update(dt);
    for (const hazard of this.hazards) hazard.update(dt);
    for (const item of this.items) item.update(dt);
  }

  findSpawnPoint(x) {
    const stablePlatforms = this.platforms.filter((platform) => platform.type !== "moving");
    const candidates = stablePlatforms
      .filter((platform) => x >= platform.x - 40 && x <= platform.x + platform.w - 30)
      .sort((a, b) => a.y - b.y);
    const behind = stablePlatforms
      .filter((platform) => platform.x <= x)
      .sort((a, b) => (b.x + b.w) - (a.x + a.w));
    const platform = candidates[candidates.length - 1] || behind[0] || stablePlatforms[0];
    return { x: clamp(x, platform.x + 20, platform.x + platform.w - 60), y: platform.y };
  }

  resetItems() {
    for (const item of this.items) {
      item.active = true;
      item.respawnTimer = 0;
    }
  }

  drawBackground(context, camera) {
    const sky = context.createLinearGradient(0, 0, 0, VIEW.height);
    sky.addColorStop(0, "#8fd6ff");
    sky.addColorStop(0.55, "#b8e999");
    sky.addColorStop(1, "#6fb65b");
    context.fillStyle = sky;
    context.fillRect(0, 0, VIEW.width, VIEW.height);

    this.drawParallaxHills(context, camera, 0.16, "#77b76a", 520, 260);
    this.drawParallaxHills(context, camera, 0.28, "#5f9a57", 555, 180);
    this.drawParallaxTrees(context, camera, 0.42, "#315c3e", 430);
    this.drawParallaxTrees(context, camera, 0.58, "#254c34", 470);
  }

  drawParallaxHills(context, camera, factor, color, baseY, height) {
    const offset = -(camera.x * factor) % 420;
    context.fillStyle = color;
    for (let x = offset - 420; x < VIEW.width + 420; x += 420) {
      context.beginPath();
      context.moveTo(x, VIEW.height);
      context.lineTo(x + 210, baseY - height);
      context.lineTo(x + 440, VIEW.height);
      context.closePath();
      context.fill();
    }
  }

  drawParallaxTrees(context, camera, factor, color, baseY) {
    const offset = -(camera.x * factor) % 210;
    for (let x = offset - 210; x < VIEW.width + 210; x += 210) {
      context.fillStyle = "#5c3b25";
      context.fillRect(Math.round(x + 92), baseY, 24, 200);
      context.fillStyle = color;
      context.fillRect(Math.round(x + 52), baseY - 100, 104, 92);
      context.fillRect(Math.round(x + 28), baseY - 56, 152, 82);
    }
  }

  draw(context, camera) {
    this.drawBackground(context, camera);
    this.drawDecorations(context, camera);
    for (const platform of this.platforms) platform.draw(context, camera);
    for (const hazard of this.hazards) hazard.draw(context, camera);
    for (const item of this.items) item.draw(context, camera);
    this.drawFinish(context, camera);
  }

  drawDecorations(context, camera) {
    for (const decoration of this.decorations) {
      const x = Math.round(decoration.x - camera.x);
      const y = Math.round(decoration.y - camera.y);
      if (x < -120 || x > VIEW.width + 120) continue;
      if (decoration.type === "tree") this.drawTree(context, x, y);
      if (decoration.type === "bush") this.drawBush(context, x, y);
      if (decoration.type === "rock") this.drawRock(context, x, y);
      if (decoration.type === "mushroom") this.drawMushroom(context, x, y);
    }
  }

  drawTree(context, x, y) {
    context.fillStyle = "#674427";
    context.fillRect(x + 42, y + 60, 34, 116);
    context.fillStyle = "#2f7939";
    context.fillRect(x + 4, y + 10, 112, 72);
    context.fillStyle = "#3e9946";
    context.fillRect(x + 20, y - 24, 82, 60);
    context.fillStyle = "#256332";
    context.fillRect(x + 18, y + 54, 72, 34);
  }

  drawBush(context, x, y) {
    context.fillStyle = "#2e7d3c";
    context.fillRect(x, y + 18, 86, 26);
    context.fillStyle = "#3fa64b";
    context.fillRect(x + 12, y, 52, 32);
    context.fillRect(x + 48, y + 9, 46, 30);
  }

  drawRock(context, x, y) {
    context.fillStyle = "#68706e";
    context.fillRect(x + 4, y + 18, 58, 24);
    context.fillStyle = "#8b9691";
    context.fillRect(x + 16, y + 6, 34, 22);
  }

  drawMushroom(context, x, y) {
    context.fillStyle = "#f2d7a0";
    context.fillRect(x + 16, y + 18, 14, 28);
    context.fillStyle = "#d84d4d";
    context.fillRect(x, y, 48, 22);
    context.fillStyle = "#fff6d0";
    context.fillRect(x + 8, y + 6, 8, 6);
    context.fillRect(x + 30, y + 8, 8, 6);
  }

  drawFinish(context, camera) {
    const x = Math.round(FINISH_X - camera.x);
    if (x < -180 || x > VIEW.width + 180) return;

    const topY = 96;
    const groundY = 590;
    const archW = 150;
    const poleW = 18;
    const tile = 18;

    context.fillStyle = "rgba(23, 32, 25, 0.24)";
    context.fillRect(x - 12, groundY - 4, archW + 66, 16);

    context.fillStyle = "#2b241c";
    context.fillRect(x, topY, poleW, groundY - topY);
    context.fillRect(x + archW, topY, poleW, groundY - topY);
    context.fillRect(x - 8, groundY - 20, poleW + 16, 24);
    context.fillRect(x + archW - 8, groundY - 20, poleW + 16, 24);

    context.fillStyle = "#6f4a2b";
    context.fillRect(x + 4, topY, 6, groundY - topY - 12);
    context.fillRect(x + archW + 4, topY, 6, groundY - topY - 12);

    context.fillStyle = "#26332a";
    context.fillRect(x - 10, topY - 12, archW + poleW + 20, 42);
    context.fillStyle = "#fff7b0";
    context.fillRect(x - 2, topY - 4, archW + poleW + 4, 26);
    context.fillStyle = "#26332a";
    context.font = "900 24px Trebuchet MS";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("FINISH", x + archW / 2 + poleW / 2, topY + 10);

    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        context.fillStyle = (row + col) % 2 === 0 ? "#f8fbff" : "#151515";
        context.fillRect(x + poleW + col * tile, topY + 42 + row * tile, tile, tile);
      }
    }

    context.fillStyle = "#d94a46";
    context.fillRect(x + poleW, topY + 42 + tile * 6, tile * 8, 10);
    context.fillStyle = "#ffd35a";
    context.fillRect(x - 26, groundY - 58, archW + 70, 10);
    context.fillRect(x - 26, groundY - 38, archW + 70, 10);
    context.fillStyle = "#26332a";
    for (let i = 0; i < 8; i += 1) {
      context.fillRect(x - 16 + i * 24, groundY - 56, 12, 28);
    }

    context.textBaseline = "alphabetic";
  }
}

class Game {
  constructor() {
    this.input = new Input();
    this.sounds = new SoundManager();
    this.level = new Level();
    this.camera = new Camera(this.level.width);
    this.unlockProgress = this.loadUnlockProgress();
    this.playerControls = this.loadPlayerControls();
    this.pendingKeybind = null;
    this.selectedCharacters = [
      CHARACTER_ROSTER[0],
      CHARACTER_ROSTER[1] || CHARACTER_ROSTER[0]
    ];
    this.players = [
      new Player({
        name: "Player 1",
        shortLabel: "P1",
        color: "#45566a",
        tint: "#41d6ff",
        startX: 120,
        startY: 344,
        controls: this.playerControls[0],
        character: this.selectedCharacters[0]
      }),
      new Player({
        name: "Player 2",
        shortLabel: "P2",
        color: "#6c4f7d",
        tint: "#ffbc35",
        startX: 120,
        startY: 504,
        controls: this.playerControls[1],
        character: this.selectedCharacters[1]
      })
    ];
    this.particles = [];
    this.state = STATES.START;
    this.countdownRemaining = 4;
    this.winner = null;
    this.lastTime = performance.now();
    this.bindUi();
    requestAnimationFrame((time) => this.loop(time));
  }

  bindUi() {
    this.renderCharacterSelect();
    this.renderKeybindSettings();
    ui.startButton.addEventListener("click", () => this.beginCountdown());
    ui.restartButton.addEventListener("click", () => this.restartRace());
    ui.homeButton.addEventListener("click", () => this.goHome());
    ui.hudHomeButton.addEventListener("click", () => this.goHome());
    for (const button of ui.keybindButtons) {
      button.addEventListener("click", () => this.beginKeybindCapture(button));
    }
  }

  beginKeybindCapture(button) {
    const playerIndex = Number(button.dataset.player);
    const action = button.dataset.action;
    if (!Number.isInteger(playerIndex) || !CONTROL_ACTIONS.includes(action)) return;
    this.pendingKeybind = { playerIndex, action, button };
    this.renderKeybindSettings();
    button.classList.add("listening");
    button.textContent = "Press key";
  }

  captureKeybind(code) {
    if (!this.pendingKeybind) return false;
    const { playerIndex, action } = this.pendingKeybind;
    if (code === "Escape") {
      this.pendingKeybind = null;
      this.renderKeybindSettings();
      return true;
    }
    this.playerControls[playerIndex][action] = code;
    this.players[playerIndex].controls = this.playerControls[playerIndex];
    this.pendingKeybind = null;
    this.savePlayerControls();
    this.renderKeybindSettings();
    return true;
  }

  renderKeybindSettings() {
    for (const button of ui.keybindButtons) {
      const playerIndex = Number(button.dataset.player);
      const action = button.dataset.action;
      const isListening = this.pendingKeybind?.button === button;
      button.classList.toggle("listening", isListening);
      if (isListening) {
        button.textContent = "Press key";
      } else {
        button.textContent = formatKey(this.playerControls[playerIndex]?.[action]);
      }
    }
  }

  renderCharacterSelect() {
    this.populateCharacterGrid(ui.p1CharacterGrid, 0);
    this.populateCharacterGrid(ui.p2CharacterGrid, 1);
    this.refreshSelectedCharacters();
  }

  populateCharacterGrid(container, playerIndex) {
    container.innerHTML = "";
    for (const character of CHARACTER_ROSTER) {
      const locked = !this.canSelectCharacter(playerIndex, character);
      const card = document.createElement("button");
      card.type = "button";
      card.className = locked ? "character-card locked" : "character-card";
      card.disabled = locked;
      card.dataset.characterId = character.id;
      card.setAttribute("aria-label", locked ? `${character.name} locked` : `Choose ${character.name}`);

      const image = document.createElement("span");
      image.className = "character-thumb";
      image.style.backgroundImage = `url("${character.imagePath}")`;
      image.setAttribute("aria-hidden", "true");

      const label = document.createElement("span");
      label.className = "character-label";
      label.textContent = character.name;

      card.append(image, label);
      if (locked) {
        const lockLabel = document.createElement("span");
        lockLabel.className = "lock-label";
        lockLabel.textContent = `Win ${character.unlockStreak} in a row`;
        card.appendChild(lockLabel);
      } else if (character.id === SECRET_CHARACTER_ID) {
        const useLabel = document.createElement("span");
        useLabel.className = "use-label";
        useLabel.textContent = `${this.secretUsesLeftFor(playerIndex)} use left`;
        card.appendChild(useLabel);
      } else if (character.unlockStreak) {
        const unlockedLabel = document.createElement("span");
        unlockedLabel.className = "use-label";
        unlockedLabel.textContent = "Unlocked";
        card.appendChild(unlockedLabel);
      }
      card.addEventListener("click", () => this.selectCharacter(playerIndex, character.id));
      container.appendChild(card);
    }
  }

  selectCharacter(playerIndex, characterId) {
    const character = CHARACTER_ROSTER.find((entry) => entry.id === characterId) || CHARACTER_ROSTER[0];
    if (!this.canSelectCharacter(playerIndex, character)) return;
    this.selectedCharacters[playerIndex] = character;
    this.players[playerIndex].setCharacter(character);
    this.refreshSelectedCharacters();
  }

  isCharacterUnlocked(character) {
    if (!character.unlockStreak) return true;
    if (character.id === SECRET_CHARACTER_ID) return this.unlockProgress.secretUses > 0;
    return this.unlockProgress.unlockedCharacters.includes(character.id);
  }

  canSelectCharacter(playerIndex, character) {
    if (!character.unlockStreak) return true;
    if (character.id === SECRET_CHARACTER_ID) return this.secretUsesLeftFor(playerIndex) > 0;
    return this.isCharacterUnlocked(character);
  }

  secretUsesLeftFor(playerIndex) {
    const otherIndex = playerIndex === 0 ? 1 : 0;
    const reservedByOtherPlayer = this.selectedCharacters[otherIndex]?.id === SECRET_CHARACTER_ID ? 1 : 0;
    return Math.max(0, this.unlockProgress.secretUses - reservedByOtherPlayer);
  }

  refreshSelectedCharacters() {
    this.replaceLockedSelections();
    const selected = this.selectedCharacters;
    ui.p1Selected.textContent = selected[0].name;
    ui.p2Selected.textContent = selected[1].name;
    ui.p1Name.textContent = `Player 1: ${selected[0].name}`;
    ui.p2Name.textContent = `Player 2: ${selected[1].name}`;
    this.markSelectedCards(ui.p1CharacterGrid, selected[0].id);
    this.markSelectedCards(ui.p2CharacterGrid, selected[1].id);
  }

  replaceLockedSelections() {
    for (let i = 0; i < this.selectedCharacters.length; i += 1) {
      if (this.canSelectCharacter(i, this.selectedCharacters[i])) continue;
      const fallback = CHARACTER_ROSTER.find((character) => !character.unlockStreak) || CHARACTER_ROSTER[0];
      this.selectedCharacters[i] = fallback;
      this.players[i].setCharacter(fallback);
    }
  }

  markSelectedCards(container, characterId) {
    for (const card of container.querySelectorAll(".character-card")) {
      const isSelected = card.dataset.characterId === characterId;
      card.classList.toggle("selected", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
    }
  }

  beginCountdown() {
    if (![STATES.START, STATES.FINISHED, STATES.RESTARTING].includes(this.state)) return;
    this.pendingKeybind = null;
    this.renderKeybindSettings();
    this.consumeSecretUsesForRace();
    ui.startScreen.classList.add("hidden");
    ui.finishScreen.classList.add("hidden");
    ui.countdown.classList.remove("hidden");
    this.resetRace();
    this.state = STATES.COUNTDOWN;
    this.countdownRemaining = 4;
    this.sounds.startMusic();
  }

  resetRace() {
    this.level.build(true);
    for (const player of this.players) player.resetFull();
    this.level.resetItems();
    this.particles.length = 0;
    this.camera.reset();
    this.winner = null;
  }

  restartRace() {
    if (![STATES.FINISHED, STATES.PLAYING, STATES.COUNTDOWN].includes(this.state)) return;
    this.state = STATES.RESTARTING;
    this.beginCountdown();
  }

  goHome() {
    if (this.state === STATES.START) return;
    this.state = STATES.START;
    this.resetRace();
    ui.countdown.classList.add("hidden");
    ui.finishScreen.classList.add("hidden");
    ui.startScreen.classList.remove("hidden");
    this.refreshSelectedCharacters();
  }

  consumeSecretUsesForRace() {
    const secretSelections = this.selectedCharacters.filter((character) => character.id === SECRET_CHARACTER_ID).length;
    if (secretSelections <= 0) return;
    this.unlockProgress.secretUses = Math.max(0, this.unlockProgress.secretUses - secretSelections);
    this.saveUnlockProgress();
  }

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.033);
    this.lastTime = time;
    this.update(dt);
    this.render();
    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  update(dt) {
    this.level.update(dt);

    if (this.state === STATES.COUNTDOWN) {
      this.countdownRemaining -= dt;
      if (this.countdownRemaining <= 0) {
        this.state = STATES.PLAYING;
        ui.countdown.classList.add("hidden");
      }
    }

    if (this.state === STATES.PLAYING) {
      this.players[0].update(dt, this, this.players[1]);
      this.players[1].update(dt, this, this.players[0]);
      this.checkFinish();
    }

    for (const particle of this.particles) particle.update(dt);
    this.particles = this.particles.filter((particle) => particle.life > 0);
    this.camera.update(this.players, dt);
    this.updateUi();
  }

  checkFinish() {
    for (const player of this.players) {
      if (player.x + player.w >= FINISH_X) {
        const unlockMessage = this.recordWin(player);
        this.winner = player;
        this.state = STATES.FINISHED;
        ui.winnerText.textContent = unlockMessage || `${player.name} wins! Streak: ${this.unlockProgress.streakCount}`;
        ui.finishScreen.classList.remove("hidden");
        this.sounds.play("finish");
        break;
      }
    }
  }

  recordWin(player) {
    if (this.unlockProgress.streakWinner === player.name) {
      this.unlockProgress.streakCount += 1;
    } else {
      this.unlockProgress.streakWinner = player.name;
      this.unlockProgress.streakCount = 1;
    }

    const messages = [];
    const secretCharacter = CHARACTER_ROSTER.find((character) => character.id === SECRET_CHARACTER_ID);
    if (secretCharacter && this.unlockProgress.streakCount === SECRET_UNLOCK_STREAK) {
      this.unlockProgress.secretUses = 1;
      messages.push(`${secretCharacter.name} earned for 1 race!`);
    }

    const unlockedCharacters = this.unlockProgress.unlockedCharacters;
    for (const character of CHARACTER_ROSTER) {
      const isPermanentUnlock = character.unlockStreak && character.id !== SECRET_CHARACTER_ID;
      if (!isPermanentUnlock || unlockedCharacters.includes(character.id)) continue;
      if (this.unlockProgress.streakCount < character.unlockStreak) continue;
      unlockedCharacters.push(character.id);
      messages.push(`${character.name} unlocked!`);
    }

    this.saveUnlockProgress();
    this.renderCharacterSelect();
    return messages.length > 0 ? `${player.name} wins! ${messages.join(" ")}` : "";
  }

  loadUnlockProgress() {
    const fallback = { streakWinner: "", streakCount: 0, secretUses: 0, unlockedCharacters: [] };
    try {
      const saved = JSON.parse(localStorage.getItem("forestDashUnlockProgress"));
      if (!saved) return fallback;
      const migratedSecretUse = Array.isArray(saved.unlockedCharacters) && saved.unlockedCharacters.includes(SECRET_CHARACTER_ID) ? 1 : 0;
      const streakCount = Number(saved.streakCount) || 0;
      const unlockedCharacters = Array.isArray(saved.unlockedCharacters)
        ? saved.unlockedCharacters.filter((characterId) => characterId !== SECRET_CHARACTER_ID)
        : [];
      for (const character of CHARACTER_ROSTER) {
        const isPermanentUnlock = character.unlockStreak && character.id !== SECRET_CHARACTER_ID;
        if (isPermanentUnlock && streakCount >= character.unlockStreak && !unlockedCharacters.includes(character.id)) {
          unlockedCharacters.push(character.id);
        }
      }
      return {
        streakWinner: saved.streakWinner || "",
        streakCount,
        secretUses: clamp(Math.max(0, Number(saved.secretUses) || migratedSecretUse), 0, 1),
        unlockedCharacters
      };
    } catch (error) {
      return fallback;
    }
  }

  loadPlayerControls() {
    const fallback = cloneDefaultControls();
    try {
      const saved = JSON.parse(localStorage.getItem("forestDashControls"));
      if (!Array.isArray(saved)) return fallback;
      return fallback.map((defaults, index) => {
        const savedControls = saved[index] || {};
        const controls = { ...defaults };
        for (const action of CONTROL_ACTIONS) {
          if (typeof savedControls[action] === "string" && savedControls[action]) {
            controls[action] = savedControls[action];
          }
        }
        return controls;
      });
    } catch (error) {
      return fallback;
    }
  }

  savePlayerControls() {
    try {
      localStorage.setItem("forestDashControls", JSON.stringify(this.playerControls));
    } catch (error) {
      // Controls still work for the current session if localStorage is unavailable.
    }
  }

  saveUnlockProgress() {
    try {
      localStorage.setItem("forestDashUnlockProgress", JSON.stringify(this.unlockProgress));
    } catch (error) {
      // The game should still work if localStorage is unavailable.
    }
  }

  burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  updateUi() {
    const p1 = this.players[0];
    const p2 = this.players[1];
    ui.p1Health.style.width = `${p1.health}%`;
    ui.p2Health.style.width = `${p2.health}%`;
    ui.p1Distance.textContent = `${Math.max(0, Math.floor(p1.x / 10))}m`;
    ui.p2Distance.textContent = `${Math.max(0, Math.floor(p2.x / 10))}m`;
    const lead = Math.max(p1.x, p2.x);
    ui.finishDistance.textContent = `Finish: ${Math.max(0, Math.ceil((FINISH_X - lead) / 10))}m`;

    if (this.state === STATES.START) ui.raceStatus.textContent = "Ready";
    if (this.state === STATES.COUNTDOWN) ui.raceStatus.textContent = "Countdown";
    if (this.state === STATES.PLAYING) ui.raceStatus.textContent = "Race!";
    if (this.state === STATES.FINISHED) ui.raceStatus.textContent = "Finished";

    ui.p1Effects.innerHTML = this.effectHtml(p1);
    ui.p2Effects.innerHTML = this.effectHtml(p2);

    if (this.state === STATES.COUNTDOWN) {
      let text = "GO!";
      if (this.countdownRemaining > 3) text = "3";
      else if (this.countdownRemaining > 2) text = "2";
      else if (this.countdownRemaining > 1) text = "1";
      ui.countdown.textContent = text;
    }
  }

  effectHtml(player) {
    const entries = Object.entries(player.effects);
    if (!entries.length) return "";
    return entries
      .map(([type, time]) => `<span class="effect-pill">${ITEM_INFO[type].label} ${Math.ceil(time)}</span>`)
      .join("");
  }

  render() {
    ctx.clearRect(0, 0, VIEW.width, VIEW.height);
    ctx.imageSmoothingEnabled = false;

    if (this.camera.splitActive && this.state !== STATES.START) {
      this.renderSplitScreen();
    } else {
      this.renderWorldView(this.camera, { x: 0, y: 0, w: VIEW.width, h: VIEW.height });
      this.drawOffscreenIndicators(this.camera);
    }

    if (this.state === STATES.START) this.drawStartWorldHint();
  }

  renderWorldView(camera, viewport) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(viewport.x, viewport.y, viewport.w, viewport.h);
    ctx.clip();
    ctx.translate(viewport.x, viewport.y);
    this.level.draw(ctx, camera);

    const sortedPlayers = [...this.players].sort((a, b) => a.y - b.y);
    for (const player of sortedPlayers) player.draw(ctx, camera);
    for (const particle of this.particles) particle.draw(ctx, camera);
    ctx.restore();
  }

  renderSplitScreen() {
    const halfWidth = VIEW.width / 2;
    const leftViewport = { x: 0, y: 0, w: halfWidth, h: VIEW.height };
    const rightViewport = { x: halfWidth, y: 0, w: halfWidth, h: VIEW.height };
    this.renderWorldView(this.camera.splitCameras[0], leftViewport);
    this.renderWorldView(this.camera.splitCameras[1], rightViewport);
    this.drawSplitScreenOverlay();
  }

  drawSplitScreenOverlay() {
    const halfWidth = VIEW.width / 2;
    ctx.fillStyle = "#172019";
    ctx.fillRect(halfWidth - 4, 0, 8, VIEW.height);
    for (let i = 0; i < this.players.length; i += 1) {
      const player = this.players[i];
      const labelX = i === 0 ? 18 : halfWidth + 18;
      ctx.fillStyle = "rgba(247, 255, 224, 0.92)";
      ctx.fillRect(labelX, 104, 150, 28);
      ctx.strokeStyle = player.tint;
      ctx.lineWidth = 3;
      ctx.strokeRect(labelX, 104, 150, 28);
      ctx.fillStyle = "#172019";
      ctx.font = "900 13px Trebuchet MS";
      ctx.textAlign = "left";
      ctx.fillText(`${player.name} view`, labelX + 9, 123);
    }
  }

  drawStartWorldHint() {
    ctx.fillStyle = "rgba(23, 32, 25, 0.25)";
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }

  drawOffscreenIndicators(camera) {
    for (const player of this.players) {
      const screenX = player.centerX - camera.x;
      if (screenX >= 16 && screenX <= VIEW.width - 16) continue;
      const edgeX = screenX < 0 ? 22 : VIEW.width - 22;
      const arrowDir = screenX < 0 ? -1 : 1;
      const y = 118 + (player.name === "Player 1" ? 0 : 36);
      ctx.fillStyle = player.tint;
      ctx.beginPath();
      ctx.moveTo(edgeX, y);
      ctx.lineTo(edgeX - arrowDir * 18, y - 14);
      ctx.lineTo(edgeX - arrowDir * 18, y + 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#172019";
      ctx.font = "900 14px Trebuchet MS";
      ctx.textAlign = screenX < 0 ? "left" : "right";
      ctx.fillText(player.name, edgeX - arrowDir * 26, y + 5);
    }
  }
}

let game = null;
window.addEventListener("load", () => {
  game = new Game();
});
