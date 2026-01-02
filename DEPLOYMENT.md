# GitHub Deployment Guide

## Step 1: Create GitHub Repository

```bash
# Initialize git in your project folder
cd your-nsd-project
git init

# Create .gitignore
echo "node_modules/" > .gitignore
echo ".DS_Store" >> .gitignore
echo "*.log" >> .gitignore

# Add all files
git add .
git commit -m "ChaosTech NSD v4.0 - MVP Ready"

# Create repo on GitHub.com first, then:
git remote add origin https://github.com/yourusername/nsd-demo.git
git branch -M main
git push -u origin main
```

---

## Step 2: Enable GitHub Pages

1. **Go to:** `https://github.com/yourusername/nsd-demo/settings`
2. **Scroll to:** "Pages" section (left sidebar)
3. **Select:** "Deploy from a branch"
4. **Choose:** `main` branch, `/root` folder
5. **Click:** "Save"
6. **Wait:** 2-3 minutes for deployment
7. **Your live URL:** `https://yourusername.github.io/nsd-demo`

---

## Step 3: Update README.md

Replace `yourusername` with your actual GitHub username in:

```markdown
**[View Live Demo](https://yourusername.github.io/nsd-demo)**
```

---

## Step 4: Verify Deployment

### Check if live:
```bash
curl https://yourusername.github.io/nsd-demo
# Should return HTML (no 404)
```

### Test in browser:
```
https://yourusername.github.io/nsd-demo
↓
Open DevTools (F12)
↓
Look for: "✅ All Features Loaded"
↓
Scroll down and test swarm launch
```

---

## Step 5: Create `.github/workflows/deploy.yml` (Optional)

For automatic deployment on every push:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## Step 6: Share Your Demo

### For Investors:
```
🎯 ChaosTech NSD - Live Demo
https://yourusername.github.io/nsd-demo

Try launching a 50-drone swarm with aggressive mix.
Watch AI detect, triangulate operator, and export forensics.
Zero civilian impact guaranteed.
```

### For Gov Customers:
```
Counter-UAS Demonstration System
https://yourusername.github.io/nsd-demo

NDAA-Compliant • Real-time Attribution • Forensics Export
Ready for integration with existing defense infrastructure
```

---

## File Checklist (What You Need in `/`)

```
✅ index.html                    (main page)
✅ ai_core.js                    (AI engine)
✅ ai_threat_assessment.js       (threat scoring)
✅ scenarios.js                  (scenario logic)
✅ radar_ui.js                   (2D radar)
✅ 3d_radar.js                   (3D visualization)
✅ chaostech_complete.js         (advanced features)
✅ README.md                     (documentation)
✅ DEPLOYMENT.md                 (this file)
```

---

## Troubleshooting

### Issue: "404 File Not Found"
**Solution:** Make sure all files are in the root directory (same folder as index.html)

### Issue: "Failed to load resource"
**Solution:** 
- Hard refresh: `Ctrl+Shift+R`
- Check console for exact file name
- Ensure no typos in script src paths

### Issue: "Advanced Features not detected"
**Solution:**
- Verify `chaostech_complete.js` is loading
- Check console: "✅ All Features Loaded" message
- Make sure script loads AFTER `ai_threat_assessment.js`

### Issue: Panels not showing
**Solution:**
- Scroll down past the log section
- Panels appear below event log
- Check console for any JavaScript errors

---

## Push Updates to GitHub

After making changes locally:

```bash
git add .
git commit -m "Update: [what changed]"
git push origin main

# GitHub Pages auto-updates in 1-2 minutes
```

---

## GitHub Pages Best Practices

✅ **Do:**
- Keep index.html in root folder
- Use relative paths for assets
- Test locally before pushing
- Use descriptive commit messages

❌ **Don't:**
- Use Jekyll (not needed for this project)
- Commit node_modules (it's in .gitignore)
- Use absolute paths `/assets/...`
- Forget to test after deployment

---

## Success Indicators

Your deployment is working when:

1. ✅ Repo shows on `https://github.com/yourusername/nsd-demo`
2. ✅ Live demo runs at `https://yourusername.github.io/nsd-demo`
3. ✅ Console shows "✅ All Features Loaded"
4. ✅ Can launch swarms
5. ✅ Can export forensics reports
6. ✅ All three panels visible and updating

---

## Next: Share with Boost VC

Once deployed, share:

**Email to:** Boost VC team  
**Subject:** ChaosTech NSD - Counter-UAS MVP Demo

```
Hi [Investor Name],

We've completed our MVP for counter-UAS swarm detection.

Live Demo: https://yourusername.github.io/nsd-demo

Try: Launch 50-drone aggressive swarm, watch operator triangulation in real-time.

System proves:
✅ Multi-type swarm detection (5-100 drones, 6 types)
✅ Real-time operator attribution (RF triangulation)
✅ Selective disruption with zero civilian impact
✅ NDAA-compliant incident forensics

Ready to discuss seed funding and CTO partnership.

Best regards,
Davon Brown
ChaosTech Defense LLC
```

---

**Last Updated:** January 1, 2026