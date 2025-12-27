# 🏔️ Hill Climb Racing Game

A modern, feature-rich HTML5 hill climbing racing game built with vanilla JavaScript and Canvas API. Race across infinite procedurally generated terrain, collect coins, manage fuel, and unlock new vehicles!

![Game Preview](https://img.shields.io/badge/Status-Playable-success)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)


## 🚀 Demo
🎥 https://sandeepgithu.github.io/HILL-RACER--GAME/ 

## 🎮 Features

### Core Gameplay
- **Infinite Terrain Generation** - Procedurally generated hills that never end
- **Physics-Based Vehicle Movement** - Realistic gravity, acceleration, and rotation
- **Fuel Management System** - Collect fuel cans to keep driving
- **Coin Collection** - Gather coins to unlock new vehicles
- **Dynamic Particle Effects** - Exhaust smoke, coin bursts, and more

### Vehicle System
- **6 Unique Vehicles** to unlock and play:
  - 🚙 **Jeep** - Balanced all-rounder (FREE)
  - 🏍️ **Bike** - High speed, low fuel
  - 🚚 **Truck** - Heavy duty, excellent fuel capacity
  - 🏎️ **Super Car** - Maximum speed beast
  - 🚜 **Monster Truck** - Best grip and fuel
  - 🏁 **Racing Car** - Aerodynamic speedster

### Controls
- **⬆️ Up Arrow / Gas Button** - Accelerate
- **⬇️ Down Arrow / Brake Button** - Brake/Reverse
- **SPACE / Jump Button** - Jump (costs fuel)
- **S / Down Button** - Push down in air
- **ESC** - Pause game

### Advanced Features
- **Vehicle Upgrade System** - Improve engine, fuel tank, and tire grip
- **Shop System** - Purchase vehicles with earned coins (1000 coins each)
- **Responsive HUD** - Real-time stats display
- **Multiple Game Screens** - Start, pause, and game over menus
- **Touch Controls** - Full mobile support
- **Smooth Animations** - 60 FPS gameplay

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser!

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hill-climb-racing.git
cd hill-climb-racing
```

2. **Open the game**
```bash
# Simply open the HTML file in your browser
# On macOS:
open hill_climb_racing_improved.html

# On Linux:
xdg-open hill_climb_racing_improved.html

# On Windows:
start hill_climb_racing_improved.html
```

Or just double-click the `hill_climb_racing_improved.html` file!

### Play Online
You can also host this on any static web server or GitHub Pages:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then visit: http://localhost:8000
```

## 🎯 How to Play

1. **Choose Your Vehicle** - Start with the free Jeep or purchase others
2. **Drive Forward** - Use gas to accelerate up and down hills
3. **Collect Items**:
   - 🪙 **Coins** - Currency to buy vehicles and upgrades
   - ⛽ **Fuel Cans** - Refill your tank (+30 fuel)
4. **Manage Your Balance** - Don't flip over or crash!
5. **Upgrade** - Use coins to improve your vehicle between runs
6. **Unlock Vehicles** - Save 1000 coins to buy new rides

### Tips & Tricks
- ⚡ Use **jump** to clear obstacles and hills
- 🔻 Use **down force** in air to land safely on steep slopes
- ⛽ Collect fuel cans before running out
- 🎯 Plan your speed - going too fast can flip you
- 💰 Focus on coin collection to unlock vehicles faster

## 🛠️ Technologies Used

- **HTML5** - Structure and Canvas element
- **CSS3** - Styling with modern gradients and animations
- **JavaScript (ES6+)** - Game logic and physics
- **Canvas API** - 2D rendering
- **Google Fonts** - Orbitron & Exo 2 fonts

## 📁 Project Structure

```
hill-climb-racing/
├── hill_climb_racing_improved.html   # Main game file (all-in-one)
├── README.md                          # This file
└── assets/                            # (optional) External assets folder
```

**Note**: This is a single-file game - all HTML, CSS, and JavaScript are contained in one file for easy deployment!

## 🎨 Game Architecture

### Core Systems

1. **Physics Engine**
   - Gravity simulation
   - Rotation based on terrain angle
   - Ground collision detection
   - Velocity and acceleration

2. **Terrain Generator**
   - Infinite procedural generation
   - Sine-wave based hills
   - Dynamic segment creation/cleanup

3. **Object Pooling**
   - Efficient coin management
   - Fuel can spawning
   - Particle system

4. **Rendering Pipeline**
   - Sky and cloud layers
   - Terrain with grass overlay
   - Vehicle with detailed parts
   - UI overlay (HUD)

## 🔧 Customization

### Adding New Vehicles

To add a new vehicle, modify the `vehicleTypes` object:

```javascript
vehicleTypes.mycar = {
    name: 'My Car',
    maxSpeed: 15,
    acceleration: 0.3,
    fuelCapacity: 100,
    fuelConsumption: 0.1,
    width: 80,
    height: 50,
    color: '#FF0000',
    accentColor: '#CC0000',
    wheelColor: '#333333',
    price: 1000,
    locked: true
};
```

Then create a drawing function:
```javascript
function drawMycar(x, y, width, height) {
    // Your custom vehicle drawing code
}
```

### Adjusting Difficulty

Modify these values in the code:

```javascript
// Fuel consumption rate
fuelConsumption: 0.08  // Lower = easier

// Coin spawn rate
if (Math.random() > 0.6)  // Lower = more coins

// Fuel can spawn rate  
if (Math.random() > 0.85)  // Lower = more fuel
```

## 📊 Game Stats Tracked

- 📏 **Distance** - How far you've traveled
- 🪙 **Coins** - Total coins collected
- ⚡ **Speed** - Current speed
- ⚖️ **Balance** - Vehicle stability indicator
- ⛽ **Fuel** - Remaining fuel percentage
- 🏆 **Top Speed** - Highest speed achieved

## 🐛 Known Issues

- Very steep hills may cause unexpected physics behavior
- Mobile landscape mode recommended for best experience
- Performance may vary on older devices

## 🚧 Future Enhancements

- [ ] Multiplayer mode
- [ ] Leaderboards
- [ ] More vehicle types
- [ ] Different terrain themes (desert, snow, moon)
- [ ] Achievement system
- [ ] Sound effects and music
- [ ] Local storage for save game
- [ ] Power-ups (speed boost, invincibility)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see below:

```
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👨‍💻 Author

Created with ❤️ by [Your Name]

## 🙏 Acknowledgments

- Inspired by the original Hill Climb Racing mobile game
- Built as a learning project for HTML5 game development
- Thanks to the Canvas API documentation and community

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Contact: your.email@example.com

## ⭐ Show Your Support

Give a ⭐️ if you like this project!

---

**Happy Racing! 🏁**
