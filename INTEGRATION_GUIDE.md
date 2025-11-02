# Frontend Integration Guide

## Steps to Integrate Your v0 Frontend

### 1. Export Components from v0
   - Go to your v0 chat: https://v0.app/chat/b/b_fU23H5aKOWx
   - Click "Export" or "Copy code" for each component
   - Save component files to the `components/` folder

### 2. Component Structure
   - **Components**: `components/your-component.tsx`
   - **Main App Component**: Create `components/TierMakerApp.tsx` (or your main component)
   - **Styles**: Keep with components or in `app/globals.css`

### 3. Integration Checklist
- [ ] Copy all component files to `components/`
- [ ] Update imports to use `@/components` instead of relative paths
- [ ] Replace auth logic with Whop SDK
- [ ] Replace UI components with Frosted UI (`@whop/react/components`)
- [ ] Update navigation to use `useIframeSdk` from `@whop/react`

## Component Updates Needed

### Authentication
Replace any auth logic with:
```tsx
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

// In server components
const { userId } = await whopsdk.verifyUserToken(await headers());
```

### Navigation
Replace `useRouter` or `Link` with:
```tsx
import { useIframeSdk } from "@whop/react";
const { navigate } = useIframeSdk();
navigate("/your-route");
```

### UI Components
Replace shadcn/ui components with Frosted UI:
- `@/components/ui/button` → `@whop/react/components` (Button)
- `@/components/ui/card` → Use Frosted UI Card styles
- Other components → Check `@whop/react/components`

## Next Steps

1. Export your components from v0
2. Copy them to `components/` folder
3. I'll help update them to work with Whop SDK and Frosted UI


