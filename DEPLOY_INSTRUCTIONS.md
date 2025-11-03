# How to Deploy to Vercel (basilerocco6-crypto account)

## Issue
The Vercel CLI is currently logged in as `gitttttt111`, but the project `tier-maker-oh93` is under the `basilerocco6-crypto` account.

## Solution

### Option 1: Log in with correct account via CLI
```bash
# Log out from current account
npx vercel logout

# Log in with basilerocco6-crypto account
npx vercel login

# Deploy
npx vercel deploy --prod --yes
```

### Option 2: Use Vercel Dashboard (Recommended)
Since the Git repo is already connected:
1. Go to https://vercel.com/basilerocco6-crypto/tier-maker-oh93
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment, OR
4. Click **"Create Deployment"** → Select `main` branch → Select latest commit → **Deploy**

### Option 3: Trigger via GitHub Push
Make a small change and push:
```bash
echo "" >> README.md
git add README.md
git commit -m "Trigger deployment"
git push origin main
```

This should trigger auto-deployment if the webhook is working correctly.


