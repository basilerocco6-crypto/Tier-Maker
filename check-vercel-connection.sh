#!/bin/bash
echo "=== Checking Vercel Deployment Setup ==="
echo ""
echo "1. GitHub Repo: https://github.com/basilerocco6-crypto/Tier-Maker"
echo "   Latest commit:"
git log --oneline -1
echo ""
echo "2. Checking if .vercel directory exists:"
if [ -d ".vercel" ]; then
  echo "   ✓ .vercel directory exists"
  cat .vercel/project.json 2>/dev/null || echo "   ⚠ No project.json found"
else
  echo "   ⚠ .vercel directory not found (this is normal if project isn't linked locally)"
fi
echo ""
echo "3. Checking vercel.json:"
if [ -f "vercel.json" ]; then
  echo "   ✓ vercel.json exists"
  cat vercel.json
else
  echo "   ⚠ vercel.json not found"
fi
echo ""
echo "=== ACTION REQUIRED ==="
echo "Go to: https://vercel.com/dashboard"
echo "1. Make sure you're logged in with 'basilerocco6-crypto' account"
echo "2. Find project 'tier-maker-oh93'"
echo "3. Settings → Git → Verify connected to 'basilerocco6-crypto/Tier-Maker'"
echo "4. Enable auto-deployments for 'main' branch"
echo "5. Check webhook is configured in GitHub repo settings"


