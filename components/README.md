# Components Directory

This directory contains your frontend components.

## Structure

- `TierMakerApp.tsx` - Main Tier Maker application component
- Add your other components here

## Integration Checklist

When copying components from v0:

1. **Update Imports**
   - Replace `@/components/ui/button` → `@whop/react/components` (Button)
   - Replace `@/components/ui/card` → Use Frosted UI styles
   - Update all relative imports to use `@/components` alias

2. **Replace Authentication**
   - Remove any custom auth logic
   - Props are already passed from the server component (userId, user, experience)

3. **Replace Navigation**
   - Replace `useRouter()` from Next.js → `useIframeSdk()` from `@whop/react`
   - Replace `Link` from Next.js → Use `useIframeSdk().navigate()` for navigation

4. **Replace UI Components**
   - Use components from `@whop/react/components`
   - Use Frosted UI Tailwind classes (bg-gray-a2, text-3, etc.)

5. **API Calls**
   - Move API logic to `app/api/` routes
   - Use `whopsdk` from `@/lib/whop-sdk` for Whop API calls
   - Use `supabase` or `supabaseAdmin` from `@/lib/supabase` for database operations

## Example Component Structure

```tsx
"use client";

import { useIframeSdk } from "@whop/react";
import { Button } from "@whop/react/components";
import type { Experience, User } from "@whop/sdk";

interface YourComponentProps {
  experienceId: string;
  userId: string;
  experience: Experience;
  user: User;
}

export function YourComponent(props: YourComponentProps) {
  const { navigate } = useIframeSdk();
  
  // Your component logic here
  
  return (
    <div>
      <Button onClick={() => navigate("/some-route")}>
        Navigate
      </Button>
    </div>
  );
}
```


