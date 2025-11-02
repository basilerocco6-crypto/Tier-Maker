# Iframe SDK Setup Guide

This guide explains how iframe SDK functionality is implemented for the Whop Tier List App.

## Overview

The iframe SDK provides functionality for:
- Opening external URLs in new context
- Opening user profiles in modal overlays
- Navigation within the Whop iframe
- In-app purchases

## Provider Setup

✅ **Already configured** in `app/layout.tsx`:

```tsx
<WhopApp accentColor="blue" appearance="inherit">
  {children}
</WhopApp>
```

The `WhopApp` component provides the iframe SDK context to all child components.

## Components

### 1. ExternalLink Component (`components/ExternalLink.tsx`)

Opens external URLs using `iframeSdk.openExternalUrl()`:

```tsx
import { ExternalLink } from "@/components/ExternalLink";

<ExternalLink href="https://example.com">
  Visit Example
</ExternalLink>
```

**Features:**
- Uses `iframeSdk.openExternalUrl({ url })` when available
- Falls back to `window.open()` if iframe SDK not available
- Handles errors gracefully
- Supports custom `target` attribute
- Shows error indicator if link fails

**Usage:**
```tsx
<ExternalLink href="https://docs.whop.com/apps" target="_blank">
  <Button>Developer Docs</Button>
</ExternalLink>
```

### 2. UserProfileLink Component (`components/UserProfileLink.tsx`)

Opens Whop user profiles in modal using format: `https://whop.com/@username`:

```tsx
import { UserProfileLink } from "@/components/UserProfileLink";

<UserProfileLink username="johndoe">
  View Profile
</UserProfileLink>
```

**Features:**
- Uses `https://whop.com/@username` format
- Opens profile in modal overlay via iframe SDK
- Falls back to new tab if iframe SDK not available
- Automatically strips `@` prefix if provided
- Shows loading state
- Handles errors gracefully

**Usage:**
```tsx
// Show username
<UserProfileLink username="johndoe" showUsername />

// Custom children
<UserProfileLink username="johndoe">
  Click to view profile
</UserProfileLink>

// Inline usage
<p>
  Welcome, <UserProfileLink username={user.username} showUsername />!
</p>
```

### 3. SubmissionCard Component (`components/SubmissionCard.tsx`)

Example component that uses `UserProfileLink`:

```tsx
import { SubmissionCard } from "@/components/SubmissionCard";

<SubmissionCard
  submission={submission}
  username={username}
  onClick={() => {}}
/>
```

Shows submission with clickable user profile link that opens in modal.

## Utility Functions (`lib/iframe-sdk-utils.ts`)

Helper functions for iframe SDK operations:

### `openExternalUrl(iframeSdk, url)`

Opens an external URL using iframe SDK or fallback:

```tsx
import { openExternalUrl } from "@/lib/iframe-sdk-utils";

await openExternalUrl(iframeSdk, "https://example.com");
```

### `openUserProfile(iframeSdk, username)`

Opens a Whop user profile:

```tsx
import { openUserProfile } from "@/lib/iframe-sdk-utils";

await openUserProfile(iframeSdk, "johndoe");
```

### `formatUserProfileUrl(username)`

Formats a user profile URL:

```tsx
import { formatUserProfileUrl } from "@/lib/iframe-sdk-utils";

const url = formatUserProfileUrl("johndoe");
// Returns: "https://whop.com/@johndoe"
```

### `isIframeSdkAvailable(iframeSdk)`

Checks if iframe SDK is available:

```tsx
import { isIframeSdkAvailable } from "@/lib/iframe-sdk-utils";

if (isIframeSdkAvailable(iframeSdk)) {
  // Use iframe SDK features
}
```

## Usage Examples

### Opening External Links

```tsx
"use client";

import { ExternalLink } from "@/components/ExternalLink";
import { Button } from "@whop/react/components";

export function MyComponent() {
  return (
    <ExternalLink href="https://docs.whop.com/apps">
      <Button>View Docs</Button>
    </ExternalLink>
  );
}
```

### Displaying User Profiles

```tsx
"use client";

import { UserProfileLink } from "@/components/UserProfileLink";

export function UserDisplay({ user }) {
  return (
    <div>
      <p>
        Welcome, {user.name || (
          <UserProfileLink username={user.username} showUsername />
        )}!
      </p>
    </div>
  );
}
```

### Custom Navigation

```tsx
"use client";

import { useIframeSdk } from "@whop/react";
import { openExternalUrl } from "@/lib/iframe-sdk-utils";

export function MyComponent() {
  const iframeSdk = useIframeSdk();

  const handleExternalLink = async () => {
    await openExternalUrl(iframeSdk, "https://example.com");
  };

  return (
    <button onClick={handleExternalLink}>
      Open External URL
    </button>
  );
}
```

## Error Handling

All iframe SDK components include error handling:

1. **Try iframe SDK first**: Use `iframeSdk.openExternalUrl()` if available
2. **Fallback gracefully**: Use `window.open()` if SDK not available
3. **Show errors**: Display error indicators when operations fail
4. **Log errors**: Log all errors to console for debugging

**Error States:**
- Shows ⚠️ icon if link fails
- Logs error to console
- Automatically falls back to standard link behavior

## Navigation

For internal navigation, use:

```tsx
"use client";

import { useIframeSdk } from "@whop/react";

export function MyComponent() {
  const iframeSdk = useIframeSdk();

  const navigateTo = (path: string) => {
    if (iframeSdk?.navigate && typeof iframeSdk.navigate === "function") {
      iframeSdk.navigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <button onClick={() => navigateTo("/dashboard")}>
      Go to Dashboard
    </button>
  );
}
```

## Client Components

⚠️ **Important**: All components using iframe SDK must be client components:

```tsx
"use client"; // Required at the top of the file

import { useIframeSdk } from "@whop/react";
```

The `useIframeSdk()` hook is a React hook and only works in client components.

## Testing

### In Whop Iframe

1. **Access via Whop**: Open app through Whop iframe
2. **Test external links**: Click external links, should open in new context
3. **Test user profiles**: Click user profile links, should open in modal
4. **Verify behavior**: Check that modals appear correctly

### Outside Iframe (Fallback)

1. **Access directly**: Open app in regular browser (localhost)
2. **Test fallback**: Links should open in new tabs
3. **No errors**: Should not show errors for missing iframe SDK

## Troubleshooting

### External Links Not Opening

1. **Check iframe SDK**: Verify `iframeSdk.openExternalUrl` is available
2. **Check console**: Look for error messages
3. **Test fallback**: Should open in new tab if SDK not available

### User Profiles Not Opening in Modal

1. **Check iframe**: Ensure app is in Whop iframe
2. **Check username**: Verify username format is correct
3. **Check URL format**: Should be `https://whop.com/@username`
4. **Check console**: Look for error messages

### Navigation Not Working

1. **Check iframe SDK**: Verify `iframeSdk.navigate` is available
2. **Check path**: Ensure path is correct format
3. **Test fallback**: Should use `window.location.href` if SDK not available

## Summary

✅ **Provider**: `WhopApp` component in `app/layout.tsx`
✅ **ExternalLink**: Opens external URLs using iframe SDK
✅ **UserProfileLink**: Opens user profiles in modal
✅ **Utility Functions**: Helper functions for iframe SDK operations
✅ **Error Handling**: Graceful fallbacks and error indicators
✅ **Client Components**: All iframe SDK usage in client components

Your iframe SDK functionality is ready! 🎉

