# Calculator Guide

This guide shows you how to add interactive calculators to your markdown notes.

## Basic Syntax

To create a calculator, use a code block with the `calculator` language:

````markdown
```calculator
formula: your_formula_here
description: What this calculator does
inputs:
- variable_name: { label: "Variable Name", default: 10, min: 0, max: 100, step: 1 }
```
````

## Example 1: Simple Linear Formula

Calculate total damage from multiple hits (multiplication):

````markdown
```calculator
formula: damage * hits
description: Calculate total damage from multiple hits
graph: true
inputs:
- damage: { label: "Damage per Hit", default: 10, min: 1, max: 50, step: 1 }
- hits: { label: "Number of Hits", default: 3, min: 1, max: 10, step: 1 }
```
````

**Result:**

```calculator
formula: damage * hits
description: Calculate total damage from multiple hits
graph: true
inputs:
- damage: { label: "Damage per Hit", default: 10, min: 1, max: 50, step: 1 }
- hits: { label: "Number of Hits", default: 3, min: 1, max: 10, step: 1 }
```

## Example 2: Exponential Growth Formula

Calculate XP required using exponential scaling (powers):

````markdown
```calculator
formula: 100 * pow(level, 2) + 50 * level
description: XP required for next level (quadratic growth)
graph: true
inputs:
- level: { label: "Target Level", default: 5, min: 1, max: 20, step: 1 }
```
````

**Result:**

```calculator
formula: 100 * pow(level, 2) + 50 * level
description: XP required for next level (quadratic growth)
graph: true
inputs:
- level: { label: "Target Level", default: 5, min: 1, max: 20, step: 1 }
```

## Example 3: Non-Linear Growth with Caps

Calculate fall damage with terminal velocity (capped power function):

````markdown
```calculator
formula: max(0, min(pow(fallDistance, 1.5) * 2, 100))
description: Fall damage increases with distance but caps at 100
graph: true
inputs:
- fallDistance: { label: "Fall Distance (feet)", default: 10, min: 0, max: 50, step: 5 }
```
````

**Result:**

```calculator
formula: max(0, min(pow(fallDistance, 1.5) * 2, 100))
description: Fall damage increases with distance but caps at 100
graph: true
inputs:
- fallDistance: { label: "Fall Distance (feet)", default: 10, min: 0, max: 50, step: 5 }
```

## Example 4: Diminishing Returns (Reciprocal Function)

Calculate attack speed with steep diminishing returns:

````markdown
```calculator
formula: round(100 / (1 + pow(haste / 50, 1.8)) * 10) / 10
description: Attack speed improves quickly at first, then severely diminishes
graph: true
inputs:
- haste: { label: "Haste Rating %", default: 50, min: 0, max: 300, step: 10 }
```
````

**Result:**

```calculator
formula: round(100 / (1 + pow(haste / 50, 1.8)) * 10) / 10
description: Attack speed improves quickly at first, then severely diminishes
graph: true
inputs:
- haste: { label: "Haste Rating %", default: 50, min: 0, max: 300, step: 10 }
```

## Example 5: Specifying Graph X-Axis (Multiple Inputs)

When you have multiple inputs, you can specify which one to use as the x-axis using `graphXAxis`:

````markdown
```calculator
formula: baseDamage * multiplier + bonusDamage
description: Total damage with bonus - graphed against the multiplier
graph: true
graphXAxis: multiplier
inputs:
- baseDamage: { label: "Base Damage", default: 50, min: 10, max: 100, step: 5 }
- multiplier: { label: "Damage Multiplier", default: 1.5, min: 0.5, max: 3, step: 0.1 }
- bonusDamage: { label: "Bonus Damage", default: 10, min: 0, max: 50, step: 5 }
```
````

**Result:**

```calculator
formula: baseDamage * multiplier + bonusDamage
description: Total damage with bonus - graphed against the multiplier
graph: true
graphXAxis: multiplier
inputs:
- baseDamage: { label: "Base Damage", default: 50, min: 10, max: 100, step: 5 }
- multiplier: { label: "Damage Multiplier", default: 1.5, min: 0.5, max: 3, step: 0.1 }
- bonusDamage: { label: "Bonus Damage", default: 10, min: 0, max: 50, step: 5 }
```

**Note:** Without `graphXAxis`, the graph would use `baseDamage` (the first input) as the x-axis. By specifying `graphXAxis: multiplier`, we explicitly choose which variable to visualize.

## Calculator Properties Explained

- **formula**: The math expression using your variable names
  - Use `+`, `-`, `*`, `/` for operations
  - Use variable names exactly as defined in inputs

- **description**: A short explanation of what the calculator does

- **graph** (optional): Set to `true` to show a visual graph of how the result changes
  - Example: `graph: true`
  - By default, the graph uses the first input variable as the x-axis

- **graphXAxis** (optional): Specify which input variable to use for the graph's x-axis
  - Example: `graphXAxis: level`
  - Only needed when you have multiple inputs and want a specific one as the x-axis
  - If not specified, defaults to the first input variable

- **inputs**: List of variables the user can adjust
  - **label**: Display name shown to users (required)
  - **default**: Starting value
  - **min**: Minimum allowed value
  - **max**: Maximum allowed value
  - **step**: How much the value changes when adjusted (e.g., 1 for whole numbers, 0.1 for decimals)

## Tips for Writers

1. **Variable Names**: Use simple, descriptive names without spaces (use camelCase or underscores)
   - Good: `damagePerHit`, `base_armor`, `level`
   - Avoid: `Damage Per Hit`, `armor value`

2. **Keep Formulas Simple**: Complex math can confuse users
   - Good: `damage * hits + bonus`
   - Works but complex: `((base + modifier) * level) / resistance`

3. **Set Reasonable Ranges**: Use min/max values that make sense for your game
   - A level shouldn't go from 1 to 1000 if max level is 20

4. **Choose Appropriate Steps**: 
   - Use `step: 1` for whole numbers (levels, counts)
   - Use `step: 0.25` or `step: 0.5` for decimals (multipliers, percentages)

5. **Test Your Calculator**: Preview your markdown file to make sure the calculator works as expected

## Supported Operators and Functions

### Basic Operators
- `+` Addition
- `-` Subtraction
- `*` Multiplication
- `/` Division
- `( )` Parentheses for order of operations

### Math Functions
- `abs(x)` - Absolute value (e.g., `abs(-5)` returns 5)
- `ceil(x)` - Round up to nearest integer (e.g., `ceil(4.2)` returns 5)
- `floor(x)` - Round down to nearest integer (e.g., `floor(4.8)` returns 4)
- `round(x)` - Round to nearest integer (e.g., `round(4.5)` returns 5)
- `max(a, b, ...)` - Return the largest value (e.g., `max(5, 10, 3)` returns 10)
- `min(a, b, ...)` - Return the smallest value (e.g., `min(5, 10, 3)` returns 3)
- `pow(base, exponent)` - Power/exponentiation (e.g., `pow(2, 3)` returns 8)
- `sqrt(x)` - Square root (e.g., `sqrt(16)` returns 4)
- `sin(x)` - Sine (angle in radians)
- `cos(x)` - Cosine (angle in radians)
- `tan(x)` - Tangent (angle in radians)

### Additional Function Examples

These examples demonstrate more advanced calculator features and are useful for game mechanics.

**Distance calculation (Pythagorean theorem):**

````markdown
```calculator
formula: sqrt(pow(x, 2) + pow(y, 2))
description: Calculate distance between two points
inputs:
- x: { label: "Distance X", default: 3, min: 0, max: 20, step: 1 }
- y: { label: "Distance Y", default: 4, min: 0, max: 20, step: 1 }
```
````

```calculator
formula: sqrt(pow(x, 2) + pow(y, 2))
description: Calculate distance between two points
inputs:
- x: { label: "Distance X", default: 3, min: 0, max: 20, step: 1 }
- y: { label: "Distance Y", default: 4, min: 0, max: 20, step: 1 }
```

---

**Healing with diminishing returns:**

````markdown
```calculator
formula: ceil(baseHeal * sqrt(spellPower / 100))
description: Healing scales with diminishing returns at high spell power
graph: true
graphXAxis: spellPower
inputs:
- baseHeal: { label: "Base Healing", default: 50, min: 10, max: 100, step: 5 }
- spellPower: { label: "Spell Power", default: 100, min: 10, max: 500, step: 10 }
```
````

```calculator
formula: ceil(baseHeal * sqrt(spellPower / 100))
description: Healing scales with diminishing returns at high spell power
graph: true
graphXAxis: spellPower
inputs:
- baseHeal: { label: "Base Healing", default: 50, min: 10, max: 100, step: 5 }
- spellPower: { label: "Spell Power", default: 100, min: 10, max: 500, step: 10 }
```

---

### Advanced Game Mechanics Formulas

Complex formulas that create interesting gameplay curves.

**AoE damage with inverse square falloff:**

````markdown
```calculator
formula: floor(baseDamage / pow(max(1, distance / 5), 2))
description: Damage drops dramatically with distance (inverse square law)
graph: true
graphXAxis: distance
inputs:
- baseDamage: { label: "Center Damage", default: 200, min: 50, max: 500, step: 25 }
- distance: { label: "Distance from Center", default: 5, min: 0, max: 30, step: 1 }
```
````

```calculator
formula: floor(baseDamage / pow(max(1, distance / 5), 2))
description: Damage drops dramatically with distance (inverse square law)
graph: true
graphXAxis: distance
inputs:
- baseDamage: { label: "Center Damage", default: 200, min: 50, max: 500, step: 25 }
- distance: { label: "Distance from Center", default: 5, min: 0, max: 30, step: 1 }
```

---

**Compound interest (gold investment):**

````markdown
```calculator
formula: floor(principal * pow(1 + rate / 100, years))
description: Calculate compound interest on investments
graph: true
graphXAxis: years
inputs:
- principal: { label: "Initial Gold", default: 1000, min: 100, max: 10000, step: 100 }
- rate: { label: "Interest Rate %", default: 10, min: 1, max: 20, step: 1 }
- years: { label: "Years", default: 10, min: 1, max: 30, step: 1 }
```
````

```calculator
formula: floor(principal * pow(1 + rate / 100, years))
description: Calculate compound interest on investments
graph: true
graphXAxis: years
inputs:
- principal: { label: "Initial Gold", default: 1000, min: 100, max: 10000, step: 100 }
- rate: { label: "Interest Rate %", default: 10, min: 1, max: 20, step: 1 }
- years: { label: "Years", default: 10, min: 1, max: 30, step: 1 }
```

---

**Oscillating elemental damage (wave pattern):**

````markdown
```calculator
formula: baseDamage * (1 + sin(time * 0.5) * 0.5)
description: Damage oscillates in a sine wave pattern over time
graph: true
graphXAxis: time
inputs:
- baseDamage: { label: "Base Damage", default: 50, min: 10, max: 100, step: 5 }
- time: { label: "Time (seconds)", default: 6, min: 0, max: 20, step: 0.5 }
```
````

```calculator
formula: baseDamage * (1 + sin(time * 0.5) * 0.5)
description: Damage oscillates in a sine wave pattern over time
graph: true
graphXAxis: time
inputs:
- baseDamage: { label: "Base Damage", default: 50, min: 10, max: 100, step: 5 }
- time: { label: "Time (seconds)", default: 6, min: 0, max: 20, step: 0.5 }
```

---

**Exponential decay (poison damage over time):**

````markdown
```calculator
formula: ceil(initialDamage * pow(0.85, ticks))
description: Poison damage that decays exponentially each tick (85% of previous)
graph: true
graphXAxis: ticks
inputs:
- initialDamage: { label: "Initial Poison Damage", default: 50, min: 10, max: 200, step: 10 }
- ticks: { label: "Number of Ticks", default: 5, min: 1, max: 20, step: 1 }
```
````

```calculator
formula: ceil(initialDamage * pow(0.85, ticks))
description: Poison damage that decays exponentially each tick (85% of previous)
graph: true
graphXAxis: ticks
inputs:
- initialDamage: { label: "Initial Poison Damage", default: 50, min: 10, max: 200, step: 10 }
- ticks: { label: "Number of Ticks", default: 5, min: 1, max: 20, step: 1 }
```

---

**Parabolic jump trajectory:**

````markdown
```calculator
formula: max(0, initialVelocity * time - 4.9 * pow(time, 2))
description: Height follows parabolic arc (goes up then falls back down)
graph: true
graphXAxis: time
inputs:
- initialVelocity: { label: "Jump Velocity", default: 20, min: 5, max: 40, step: 5 }
- time: { label: "Time in Air (seconds)", default: 2, min: 0, max: 8, step: 0.2 }
```
````

```calculator
formula: max(0, initialVelocity * time - 4.9 * pow(time, 2))
description: Height follows parabolic arc (goes up then falls back down)
graph: true
graphXAxis: time
inputs:
- initialVelocity: { label: "Jump Velocity", default: 20, min: 5, max: 40, step: 5 }
- time: { label: "Time in Air (seconds)", default: 2, min: 0, max: 8, step: 0.2 }
```

---

**Bouncing effect (absolute sine):**

````markdown
```calculator
formula: floor(height * abs(sin(time * 3.14)))
description: Object bounces up and down repeatedly
graph: true
graphXAxis: time
inputs:
- height: { label: "Bounce Height", default: 100, min: 10, max: 200, step: 10 }
- time: { label: "Time", default: 1, min: 0, max: 6, step: 0.1 }
```
````

```calculator
formula: floor(height * abs(sin(time * 3.14)))
description: Object bounces up and down repeatedly
graph: true
graphXAxis: time
inputs:
- height: { label: "Bounce Height", default: 100, min: 10, max: 200, step: 10 }
- time: { label: "Time", default: 1, min: 0, max: 6, step: 0.1 }
```

---

**Inverse power spike (near-zero explosion):**

````markdown
```calculator
formula: min(500, basePower / pow(max(0.1, distance), 2))
description: Power explodes dramatically as distance approaches zero
graph: true
graphXAxis: distance
inputs:
- basePower: { label: "Base Power", default: 100, min: 10, max: 200, step: 10 }
- distance: { label: "Distance", default: 5, min: 0.1, max: 20, step: 0.5 }
```
````

```calculator
formula: min(500, basePower / pow(max(0.1, distance), 2))
description: Power explodes dramatically as distance approaches zero
graph: true
graphXAxis: distance
inputs:
- basePower: { label: "Base Power", default: 100, min: 10, max: 200, step: 10 }
- distance: { label: "Distance", default: 5, min: 0.1, max: 20, step: 0.5 }
```

---

**Combined exponential and trig chaos:**

````markdown
```calculator
formula: floor(base * pow(1.2, x) * (1 + sin(x * 2) * 0.3))
description: Exponential growth with oscillating fluctuations
graph: true
graphXAxis: x
inputs:
- base: { label: "Base Value", default: 10, min: 5, max: 30, step: 5 }
- x: { label: "Time/Level", default: 5, min: 0, max: 15, step: 0.5 }
```
````

```calculator
formula: floor(base * pow(1.2, x) * (1 + sin(x * 2) * 0.3))
description: Exponential growth with oscillating fluctuations
graph: true
graphXAxis: x
inputs:
- base: { label: "Base Value", default: 10, min: 5, max: 30, step: 5 }
- x: { label: "Time/Level", default: 5, min: 0, max: 15, step: 0.5 }
```

---

**Boss enrage exponential explosion:**

````markdown
```calculator
formula: floor(baseDamage * pow(2, pow(elapsed / duration, 3) * 5))
description: Boss damage explodes exponentially near enrage (cubic acceleration)
graph: true
graphXAxis: elapsed
inputs:
- baseDamage: { label: "Base Damage", default: 30, min: 10, max: 100, step: 10 }
- elapsed: { label: "Elapsed Time %", default: 50, min: 0, max: 100, step: 5 }
- duration: { label: "Enrage at 100%", default: 100, min: 100, max: 100, step: 1 }
```
````

```calculator
formula: floor(baseDamage * pow(2, pow(elapsed / duration, 3) * 5))
description: Boss damage explodes exponentially near enrage (cubic acceleration)
graph: true
graphXAxis: elapsed
inputs:
- baseDamage: { label: "Base Damage", default: 30, min: 10, max: 100, step: 10 }
- elapsed: { label: "Elapsed Time %", default: 50, min: 0, max: 100, step: 5 }
- duration: { label: "Enrage at 100%", default: 100, min: 100, max: 100, step: 1 }
```

---

**Cubic spell scaling (explosive growth):**

````markdown
```calculator
formula: floor(baseDamage * pow(spellPower / 100, 3))
description: Damage scales cubically with spell power (exponential payoff)
graph: true
graphXAxis: spellPower
inputs:
- baseDamage: { label: "Base Spell Damage", default: 50, min: 10, max: 100, step: 10 }
- spellPower: { label: "Spell Power", default: 100, min: 10, max: 300, step: 10 }
```
````

```calculator
formula: floor(baseDamage * pow(spellPower / 100, 3))
description: Damage scales cubically with spell power (exponential payoff)
graph: true
graphXAxis: spellPower
inputs:
- baseDamage: { label: "Base Spell Damage", default: 50, min: 10, max: 100, step: 10 }
- spellPower: { label: "Spell Power", default: 100, min: 10, max: 300, step: 10 }
```

---

**Dual sine wave interference:**

````markdown
```calculator
formula: round(amplitude * (sin(freq1 * x) + sin(freq2 * x)))
description: Two sine waves creating interference pattern
graph: true
graphXAxis: x
inputs:
- amplitude: { label: "Wave Amplitude", default: 50, min: 10, max: 100, step: 10 }
- x: { label: "Position", default: 3, min: 0, max: 10, step: 0.2 }
- freq1: { label: "Frequency 1", default: 1, min: 0.5, max: 3, step: 0.5 }
- freq2: { label: "Frequency 2", default: 1.5, min: 0.5, max: 3, step: 0.5 }
```
````

```calculator
formula: round(amplitude * (sin(freq1 * x) + sin(freq2 * x)))
description: Two sine waves creating interference pattern
graph: true
graphXAxis: x
inputs:
- amplitude: { label: "Wave Amplitude", default: 50, min: 10, max: 100, step: 10 }
- x: { label: "Position", default: 3, min: 0, max: 10, step: 0.2 }
- freq1: { label: "Frequency 1", default: 1, min: 0.5, max: 3, step: 0.5 }
- freq2: { label: "Frequency 2", default: 1.5, min: 0.5, max: 3, step: 0.5 }
```

---

**S-curve (sigmoid) leveling:**

````markdown
```calculator
formula: floor(maxPower / (1 + pow(2.718, -0.15 * (level - midpoint))))
description: Power growth follows S-curve (slow start, rapid middle, slow end)
graph: true
graphXAxis: level
inputs:
- maxPower: { label: "Maximum Power", default: 1000, min: 100, max: 2000, step: 100 }
- level: { label: "Character Level", default: 25, min: 1, max: 50, step: 1 }
- midpoint: { label: "Growth Midpoint", default: 25, min: 10, max: 40, step: 5 }
```
````

```calculator
formula: floor(maxPower / (1 + pow(2.718, -0.15 * (level - midpoint))))
description: Power growth follows S-curve (slow start, rapid middle, slow end)
graph: true
graphXAxis: level
inputs:
- maxPower: { label: "Maximum Power", default: 1000, min: 100, max: 2000, step: 100 }
- level: { label: "Character Level", default: 25, min: 1, max: 50, step: 1 }
- midpoint: { label: "Growth Midpoint", default: 25, min: 10, max: 40, step: 5 }
```

---

**Hyperbolic tangent rage buildup:**

````markdown
```calculator
formula: floor(maxRage * ((pow(2.718, combo / 5) - pow(2.718, -combo / 5)) / (pow(2.718, combo / 5) + pow(2.718, -combo / 5))))
description: Rage builds rapidly at first, then asymptotically approaches maximum
graph: true
graphXAxis: combo
inputs:
- maxRage: { label: "Max Rage", default: 100, min: 50, max: 200, step: 10 }
- combo: { label: "Combo Counter", default: 10, min: 0, max: 30, step: 1 }
```
````

```calculator
formula: floor(maxRage * ((pow(2.718, combo / 5) - pow(2.718, -combo / 5)) / (pow(2.718, combo / 5) + pow(2.718, -combo / 5))))
description: Rage builds rapidly at first, then asymptotically approaches maximum
graph: true
graphXAxis: combo
inputs:
- maxRage: { label: "Max Rage", default: 100, min: 50, max: 200, step: 10 }
- combo: { label: "Combo Counter", default: 10, min: 0, max: 30, step: 1 }
```

---

**Multi-peaked mountain terrain:**

````markdown
```calculator
formula: floor(50 * sin(x * 0.5) + 30 * sin(x * 1.3) + 20 * sin(x * 2.1) + 100)
description: Combining multiple sine waves creates complex terrain
graph: true
inputs:
- x: { label: "Position", default: 5, min: 0, max: 20, step: 0.2 }
```
````

```calculator
formula: floor(50 * sin(x * 0.5) + 30 * sin(x * 1.3) + 20 * sin(x * 2.1) + 100)
description: Combining multiple sine waves creates complex terrain
graph: true
inputs:
- x: { label: "Position", default: 5, min: 0, max: 20, step: 0.2 }
```

