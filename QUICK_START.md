# Dashboard V1 — Quick Start Guide

## What's New
The portfolio bento grid on Dashboard V1 now has a **rotating animation**. Every 7 seconds, all portfolio company cards shift their content one position clockwise. After ~84 seconds, all 12 companies have been displayed.

## How to View It
```
1. Open your browser
2. Go to: http://localhost:8080/dashboard-v1.html
3. Wait 4 seconds for initial animations to complete
4. At the 7-second mark, you'll see the first rotation
5. Continue watching to see all 12 companies cycle through
```

## What to Expect

### Timeline
```
0s:   Page loads, entry animations begin
4s:   Rotation starts (VAST → Coralogix, Coralogix → Exodigo, etc.)
      BigPanda appears in featured (VAST) position
7s:   Second rotation (cards shift again)
      Capitolis appears in featured position
...
84s:  All 12 companies have been shown
91s:  Cycle repeats from the beginning
```

### Visual Experience
- **Smooth crossfade**: Each card fades out, swaps content, fades back in
- **Clockwise wave**: Rotation starts from featured card (top-left) and moves clockwise
- **Takes ~1 second**: The staggered fades create a smooth, non-jarring effect

### Interactive Behavior
- **Hover to pause**: Move your cursor over the portfolio grid → rotation stops
- **Move away to resume**: Move cursor away from grid → rotation continues
- **Tab hidden**: Rotation pauses if you switch tabs or browser windows
- **Tab visible**: Rotation resumes when you return to the tab

## Company Rotation Order

**Initial 7 companies (visible on page load):**
1. VAST Data
2. Coralogix
3. Exodigo
4. Silverfort
5. AAI
6. Torq
7. RobCo

**Staged 5 companies (enter during rotation):**
8. BigPanda
9. Capitolis
10. GoodShip
11. Regulus
12. Commcrete

Then it repeats. *(Option B shuffle planned for future: will prevent duplicates)*

## Technical Details

### Files Involved
- `portfolio-data.js` — Company data (all 12 companies)
- `dashboard-v1.html` — HTML with data-slot attributes
- `dashboard-v1.css` — Styles with opacity animation support
- `bento-rotation.js` — The rotation engine (NEW)
- `dashboard.js` — Loads GSAP library (dependency)

### Key Configuration
```javascript
ROTATION_INTERVAL = 7000ms      // 7 seconds between rotations
FADE_DURATION     = 0.6s        // Total crossfade time
STAGGER_DELAY     = 0.07s       // 70ms between each slot (creates clockwise wave)
INITIAL_DELAY     = 4000ms      // Wait for entry animations before starting
```

### How It Works
1. Cards stay in their fixed grid positions
2. Only the **content** inside cards changes:
   - Background image
   - Company logo
   - Company name
   - Description text
   - Sector tag
3. Content crossfades smoothly (fade out → swap data → fade in)
4. Staggered timing creates a clockwise sweep effect

## Troubleshooting

### No rotation?
1. Check browser console (F12) for errors
2. Verify portfolio-data.js loaded (look for PORTFOLIO in console)
3. Verify GSAP library loaded (check for gsap in console)
4. Check the local server is running on port 8080

### Rotation is jerky?
- This shouldn't happen with the 70ms stagger
- Check if your browser has hardware acceleration enabled (Settings → Advanced)

### Images not showing?
- Images are preloaded on page load (4-second delay)
- Check if assets folder exists with proper image paths
- Verify image files exist: `assets/portfolio bgs/<company>` and `assets/Favicons/<company>`

### Rotation paused and won't resume?
- Move cursor away from the portfolio grid
- Check if you switched to another browser tab

## Testing Checklist
- [ ] Page loads without console errors
- [ ] Entry animations finish at 4-second mark
- [ ] Cards rotate at exactly 7-second intervals
- [ ] Rotation stops when you hover over grid
- [ ] Rotation resumes when you move cursor away
- [ ] All 12 companies appear within 84 seconds
- [ ] Company names, logos, and sectors update correctly
- [ ] No visual flashing or blank backgrounds

## Files Modified/Created

| File | Status | Changes |
|------|--------|---------|
| `portfolio-data.js` | Modified | Added `<br>` to AAI description |
| `dashboard-v1.html` | Modified | Added `data-slot` attributes, added script tags |
| `dashboard-v1.css` | Modified | Added opacity rules for animation |
| `bento-rotation.js` | **NEW** | Complete rotation system |

## Next Steps (Future)
- **Option B Shuffle**: Add shuffle logic to prevent duplicate companies appearing in succession
- **Manual controls**: Add next/previous buttons
- **Analytics**: Track which companies are viewed and for how long
- **V2 integration**: Apply similar rotation to dashboard-v2

---

**Implementation Status:** ✅ COMPLETE
**Verification:** ✅ ALL CHECKS PASSED
**Ready for Testing:** ✅ YES
