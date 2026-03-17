# Zoe Zones - SEL Check-In Tool

A local-only browser app for student social-emotional check-ins using Zones of Regulation with adaptive learning.

## Features

- **4 Zones of Regulation**: Blue, Green, Yellow, Red
- **10 Evidence-based strategies** across all zones
- **Adaptive Learning Brain**: Tracks which strategies work best for your class
- **Clean, Kid-Friendly Design**: Minimal but engaging interface
- **100% Local**: No internet required, all data stays on the device
- **Class Mode**: Learns from all 25 students collectively

## How It Works

### For Students
1. Choose your current zone (Blue, Green, Yellow, or Red)
2. See a strategy that might help
3. Click "I'll try this!" or "Show me something else"
4. Click "All done" when finished

### The Learning Brain
The app tracks:
- Which strategies students choose to try
- Which strategies students skip
- Success patterns across your whole class

Over time, it learns which strategies work best for your students and shows them more often.

### For Teachers

**View Statistics** (open browser console and type):
```javascript
showStats()
```

**Reset All Data** (open browser console and type):
```javascript
resetBrain()
```

## Setup

1. Save all files in the same folder:
   - index.html
   - styles.css
   - strategies.js
   - brain.js
   - app.js

2. Open `index.html` in any modern browser

3. That's it! No installation needed.

## The Learning Algorithm

The brain uses **weighted random selection**:

1. **Initial Phase**: All strategies have equal chance (weight = 1)
2. **Learning Phase**: Strategies gain weight based on success rate
   - Success Rate = Times Selected / (Times Selected + Times Skipped)
   - Weight Range: 0.2 (rarely helpful) to 3.0 (very helpful)
3. **Exploration Bonus**: Strategies shown fewer than 3 times get a 1.5x boost
4. **Confidence Factor**: The more data, the more the brain trusts the pattern

This means:
- New strategies get fair chances to prove themselves
- Successful strategies appear more often over time
- The system never gets stuck showing only one strategy

## Data Storage

All data is stored locally using `localStorage`:
- No server required
- Data persists between sessions
- Each device/browser has its own data
- Perfect for a single classroom Chromebook station

## Strategies Included

**Blue Zone** (2 strategies): Movement Break, Think of Something Good

**Green Zone** (2 strategies): Stay Ready, Help a Friend  

**Yellow Zone** (3 strategies): Belly Breathing, Squeeze and Release, Count to 10

**Red Zone** (3 strategies): Take Space, Stomp It Out, Talk to Someone

## Customization

### Adding More Strategies
Edit `strategies.js` and add to the appropriate zone array.

### Changing Colors
Edit the `:root` variables in `styles.css`.

### Modifying Steps
Each strategy can have any number of steps - just add them to the steps array.

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge
- Firefox  
- Safari
- Opera

Requires: JavaScript and localStorage support (available in all browsers since 2011)

## Privacy & Safety

- **No data leaves the device**
- **No tracking or analytics**
- **No personal information collected**
- **Teacher has full control** to view stats or reset data

## Future Enhancement Ideas

- Visual dashboard for teachers
- Export data as CSV
- Multi-language support
- Customizable strategy database
- Student-specific tracking (optional mode)

## Questions?

Check the console for helpful commands:
- `showStats()` - View learning data
- `resetBrain()` - Clear all data and start fresh

---

Built for 4th grade teachers who want adaptive SEL support without complexity! 🎯
