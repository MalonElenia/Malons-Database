
Quick guide for adding icons to your markdown files.

Icon Link: **[Iconify Icon Sets](https://icon-sets.iconify.design/)** - Search all 150+ libraries

### Page Title Icons (in Frontmatter)

Format:
```yaml
---
icon: name
---
```

Where we replace `name` with the icon name.

Example:
```yaml
---
icon: game-icons:broadsword
---
```


### Inline Icons (in .md files)

```markdown
:icon:`name`:
```
Where we replace `name` (replace quotes too) with the icon name.

For example, using `GiBroadsword` and `GiShield`:
```markdown
Attack with a :icon:GiBroadsword: or defend with a :icon:GiShield:
```


## Two main formats work:

There are **TWO valid formats**:

### Format 1: Full Iconify Format (Easiest, Copy and paste.)

```yaml
game-icons:broadsword      --> :icon:game-icons:broadsword:
lucide:heart               --> :icon:lucide:heart:
fa6-solid:dragon           --> :icon:fa6-solid:dragon: 
```

**Rules:**
- Use full collection name, colon, then kebab-case icon name
- Example: `game-icons:broadsword:`, `lucide:heart`, `fa6-solid:dragon`

### Format 2: Prefix + PascalCase

The first format uses a 2-3 letter prefix depending on the icon library it comes from.

```yaml
GiBroadsword      --> :icon:GiBroadsword: 
LuHeart           --> :icon:LuHeart: 
FasDragon         --> :icon:FasDragon: 
```

**Rules:**
- Start with 2-3 letter prefix (Gi, Lu, Fas, etc.)
- Follow with icon name in PascalCase
- Example: `GiBroadsword`, `LuHeart`, `FasShield`


## Icon Libraries

We support 150+ icon libraries with 200,000+ icons through [Iconify](https://iconify.design/).

### Recommended for RPG Content

| Prefix | Library | Collection | Best For |
|--------|---------|------------|----------|
| **Gi** | Game Icons | `game-icons` | RPG, fantasy, combat, magic |
| **Lu** | Lucide | `lucide` | UI elements, stats, general icons |
| **Fas** | Font Awesome Solid | `fa6-solid` | General purpose, variety |

### All Supported Libraries

| Prefix | Library | Collection | Icon Count |
|--------|---------|------------|------------|
| **Gi** | Game Icons | `game-icons` | 4,000+ |
| **Lu** | Lucide | `lucide` | 1,000+ |
| **Fi** | Lucide (alt) | `lucide` | 1,000+ |
| **Fas** | Font Awesome Solid | `fa6-solid` | 2,000+ |
| **Far** | Font Awesome Regular | `fa6-regular` | 2,000+ |
| **Hi** | Heroicons | `heroicons` | 300+ |
| **Bs** | Bootstrap Icons | `bi` | 2,000+ |
| **Tb** | Tabler Icons | `tabler` | 4,000+ |
| **Ra** | Radix Icons | `radix-icons` | 300+ |
| **Ri** | Remix Icons | `ri` | 2,500+ |
| **Io** | Ionicons | `ion` | 1,300+ |
| **Mi** | Material Symbols | `material-symbols` | 2,500+ |
| **Md** | Material Design | `mdi` | 7,000+ |
| **Ai** | Ant Design | `ant-design` | 800+ |
| **Si** | Simple Icons | `simple-icons` | 2,500+ |
| **Bi** | BoxIcons | `bx` | 1,500+ |
| **Vi** | VSCode Icons | `vscode-icons` | 1,000+ |
| **Wi** | Weather Icons | `wi` | 200+ |
| **Ci** | Cryptocurrency | `cryptocurrency` | 500+ |
| **Di** | Devicons | `devicon` | 200+ |

## Finding Icons

### Step-by-Step Guide

1. **Go to** [Iconify Icon Sets](https://icon-sets.iconify.design/)
2. **Search** for your icon (e.g., "sword", "heart", "dragon")
3. **Select library** - Choose "Game Icons" for RPG, "Lucide" for UI
4. **Click icon** - You'll see a name like "broadsword" or "dragon-head"

### Conversion Examples

| What You Find | How to Use It |
|---------------|---------------|
| `broadsword` | `GiBroadsword` or `game-icons:broadsword` |
| `dragon-head` | `GiDragonHead` or `game-icons:dragon-head` |
| `spell-book` | `GiSpellBook` or `game-icons:spell-book` |
| `heart` | `LuHeart` or `lucide:heart` |
| `shield` | `LuShield` or `lucide:shield` |

## Inline Icon Features

### Basic Icon
```markdown
:icon:game-icons:bloody-sword:
```

### With Custom Size
```markdown
:icon:game-icons:bloody-sword|24:          (24 pixels)
:icon:game-icons:bloody-sword|32:          (32 pixels)
:icon:game-icons:bloody-sword|48:          (48 pixels)
```

### With Size and Color
```markdown
:icon:game-icons:bloody-sword|27|red:       (27px, red)
:icon:game-icons:bloody-sword|36|#ff6600:       (36px, orange hex color)
```

### Search Everything
- **[Iconify Icon Sets](https://icon-sets.iconify.design/)** - Search all 150+ libraries
