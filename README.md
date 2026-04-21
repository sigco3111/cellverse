# 🧬 CellVerse — Cellular Automata Laboratory

Interactive cellular automata simulator built with Next.js and HTML5 Canvas. Explore emergent complexity from simple rules.

## ✨ Features

- **8 Preset Rules** — Conway's Game of Life, HighLife, Day & Night, Seeds, Diamoeba, Wireworld, Brian's Brain, Langton's Ant
- **Custom Rule Builder** — Create your own B/S notation rules with interactive editor
- **6 Classic Patterns** — Glider, LWSS, Pulsar, Gosper Glider Gun, R-pentomino, Acorn
- **Interactive Canvas** — Draw, erase, and place patterns with mouse
- **Real-time Controls** — Play/pause, step-by-step, speed control
- **Grid Customization** — Adjustable grid size and cell rendering
- **Dark Theme** — Sleek dark UI with ambient glow effects

## 🎮 How to Play

1. **Select a rule** from the sidebar (start with Conway's Game of Life)
2. **Draw cells** by clicking/dragging on the canvas, or click **🎲 Random** to populate
3. **Press ▶ Play** (or Space) to start the simulation
4. **Try different rules** to see wildly different emergent behaviors
5. **Use the Custom Rule Builder** (⚙️ button) to create your own B/S rules

## 🛠 Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **HTML5 Canvas**

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 📦 Rules Included

| Rule | Notation | Description |
|------|----------|-------------|
| Conway's Game of Life | B3/S23 | The classic — complex patterns from simple rules |
| HighLife | B36/S23 | Like Life but creates self-replicating patterns |
| Day & Night | B3678/S34678 | Symmetric rule — dead and alive behave similarly |
| Seeds | B2/S | Explosive chaos — cells never survive |
| Diamoeba | B35678/S5678 | Diamond-shaped amoeba-like growth |
| Wireworld | Multi-state | Electronic circuit simulation |
| Brian's Brain | Multi-state | Creates beautiful moving patterns |
| Langton's Ant | Special | Emergent "highway" after ~10,000 steps |

## 📜 License

MIT
