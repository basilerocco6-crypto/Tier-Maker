# Frosted UI Complete Setup Guide

This guide documents the complete Frosted UI setup for the Whop Next.js app.

## 1. Package Installation

✅ **Already Installed**: `@whop/react` version 0.3.0 is installed and includes Frosted UI components.

The package exports all Frosted UI components from `@whop/react/components`, which re-exports from `frosted-ui`.

## 2. Tailwind Configuration

✅ **Configured** in `tailwind.config.ts`:

```typescript
import { frostedThemePlugin } from "@whop/react/tailwind";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [frostedThemePlugin()],
};
```

✅ **Styles Imported** in `app/globals.css`:

```css
@import "@whop/react/styles.css" layer(frosted_ui);
```

## 3. Available Frosted UI Components

All components are imported from `@whop/react/components`:

### Typography Components

- `Heading` - Headings with size props (0-9)
- `Text` - Text with size props (0-9)

**Example:**
```tsx
import { Heading, Text } from "@whop/react/components";

<Heading size="9">Main Title</Heading>
<Text size="3">Body text</Text>
```

### Button Component

- `Button` - With size, variant (solid/soft/ghost), and color props

**Example:**
```tsx
import { Button } from "@whop/react/components";

<Button variant="classic" size="4">Click me</Button>
<Button variant="outline" size="3">Secondary</Button>
<Button variant="ghost" size="2">Ghost</Button>
```

### Form Components

Available from `@whop/react/components`:
- `TextInput` - Text input fields
- `TextArea` - Textarea fields
- `Checkbox` - Checkbox inputs
- `Select` - Select dropdowns

**Example:**
```tsx
import { TextInput, TextArea, Checkbox, Select } from "@whop/react/components";

<TextInput placeholder="Enter text" />
<TextArea placeholder="Enter description" />
<Checkbox label="I agree" />
<Select options={[...]} />
```

### Layout Components

Available from `@whop/react/components`:
- `Card` - Card container
- `Box` - Box container
- `Flex` - Flexbox layout
- `Grid` - Grid layout

**Example:**
```tsx
import { Card, Box, Flex, Grid } from "@whop/react/components";

<Card>
  <Box>Content</Box>
</Card>
<Flex direction="column" gap="4">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Flex>
```

### Feedback Components

Available from `@whop/react/components`:
- `Badge` - Badge component
- `Dialog` - Dialog/Modal component
- `Spinner` - Loading spinner

**Example:**
```tsx
import { Badge, Dialog, Spinner } from "@whop/react/components";

<Badge color="blue">New</Badge>
<Dialog isOpen={isOpen} onClose={onClose}>Content</Dialog>
<Spinner size="md" />
```

## 4. Frosted UI Tailwind Classes

### Colors

Frosted UI uses a color scale system:

**Background Colors:**
- `bg-gray-a1`, `bg-gray-a2`, `bg-gray-a3` - Gray backgrounds
- `bg-blue-1`, `bg-blue-2`, `bg-blue-3` - Blue backgrounds
- `bg-green-1`, `bg-green-2` - Green backgrounds
- `bg-red-1`, `bg-red-2` - Red backgrounds

**Text Colors:**
- `text-gray-9`, `text-gray-10`, `text-gray-11`, `text-gray-12` - Gray text (lighter to darker)
- `text-blue-9`, `text-blue-11` - Blue text
- `text-green-11` - Green text

**Border Colors:**
- `border-gray-a4`, `border-gray-a6` - Gray borders
- `border-blue-6`, `border-blue-8` - Blue borders

**Example:**
```tsx
<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-4">
  <p className="text-gray-12">Dark text</p>
  <p className="text-gray-9">Lighter text</p>
</div>
```

### Typography

Frosted UI provides size classes (0-9):

- `text-1`, `text-2`, `text-3`, `text-4`, `text-5`, `text-6`, `text-7`, `text-8`, `text-9`
- `leading-1`, `leading-2`, `leading-3`, etc. - Line heights
- `font-medium`, `font-semibold`, `font-bold` - Font weights

**Example:**
```tsx
<h1 className="text-9 font-bold text-gray-12">Main Title</h1>
<p className="text-3 text-gray-10 leading-3">Body text</p>
<p className="text-2 text-gray-9">Small text</p>
```

### Spacing

Standard Tailwind spacing classes work:
- `p-4`, `md:p-6`, `lg:p-8` - Padding
- `m-4`, `md:m-6` - Margins
- `gap-4`, `gap-6` - Gaps
- `space-y-4` - Vertical spacing

### Dark Mode

Frosted UI components automatically adapt to dark/light mode based on the `WhopApp` provider in `app/layout.tsx`:

```tsx
<WhopApp accentColor="blue" appearance="inherit">
  {children}
</WhopApp>
```

The `appearance="inherit"` prop allows the theme to inherit from the parent (Whop iframe).

No need for `dark:` prefixes - components handle theme switching automatically!

## 5. Component Migration Guide

### Replacing shadcn/ui Components

**Button:**
```tsx
// ❌ Old (shadcn/ui)
import { Button } from "@/components/ui/button";

// ✅ New (Frosted UI)
import { Button } from "@whop/react/components";
```

**Input:**
```tsx
// ❌ Old (shadcn/ui)
import { Input } from "@/components/ui/input";

// ✅ New (Frosted UI)
import { TextInput } from "@whop/react/components";
```

**Card:**
```tsx
// ❌ Old (shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ✅ New (Frosted UI - using Tailwind classes)
<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
  <h2 className="text-7 font-semibold text-gray-12 mb-4">Title</h2>
  <div>Content</div>
</div>

// OR use Card component if available:
import { Card } from "@whop/react/components";
```

**Badge:**
```tsx
// ❌ Old (shadcn/ui)
import { Badge } from "@/components/ui/badge";

// ✅ New (Frosted UI)
import { Badge } from "@whop/react/components";
```

### Updating Tailwind Classes

Replace shadcn/ui classes with Frosted UI classes:

- `bg-white` → `bg-gray-a2`
- `bg-black` → `bg-gray-a1`
- `text-black` → `text-gray-12`
- `text-white` → `text-gray-12` (on dark backgrounds) or `text-gray-9` (on light)
- `border` → `border border-gray-a4`
- `text-sm` → `text-2` or `text-3`
- `text-base` → `text-3` or `text-4`
- `text-lg` → `text-5` or `text-6`
- `text-xl` → `text-7` or `text-8`
- `text-2xl` → `text-8` or `text-9`

## 6. Theme Support

All Frosted UI components automatically respect the theme (light/dark mode) based on:

1. The `WhopApp` provider in `app/layout.tsx`
2. The Whop iframe theme (if running in Whop)
3. System preference (if `appearance="inherit"` is used)

No manual theme switching needed - components adapt automatically!

## 7. Best Practices

1. **Use Frosted UI Components First**: Always check if a component exists in `@whop/react/components` before creating a custom one.

2. **Use Frosted UI Color Tokens**: Always use Frosted UI color classes (`bg-gray-a2`, `text-blue-11`) instead of standard Tailwind colors.

3. **Use Size Scale**: Use the 0-9 size scale for typography (`text-3`, `text-9`) for consistency.

4. **Dark Mode Ready**: All components work in both light and dark modes automatically - no need for `dark:` variants.

5. **Accessibility**: Frosted UI components include built-in accessibility features.

## 8. Complete Example

```tsx
"use client";

import { Button, TextInput, Badge } from "@whop/react/components";

export function ExampleComponent() {
  return (
    <div className="bg-gray-a1 min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        {/* Card-like container */}
        <div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6 mb-6">
          <h1 className="text-9 font-bold text-gray-12 mb-4">
            Example Title
          </h1>
          <p className="text-3 text-gray-10 mb-4">
            This is body text using Frosted UI classes.
          </p>
          
          {/* Form */}
          <div className="space-y-4 mb-4">
            <TextInput placeholder="Enter name" />
            <TextInput placeholder="Enter email" type="email" />
          </div>
          
          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="classic" size="4">
              Submit
            </Button>
            <Button variant="outline" size="4">
              Cancel
            </Button>
            <Badge color="blue">New</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Summary

✅ **Package**: `@whop/react` installed
✅ **Tailwind Config**: `frostedThemePlugin()` configured
✅ **Content Paths**: Added for `app/`, `components/`, and `src/`
✅ **Styles**: Imported in `globals.css`
✅ **Theme**: Auto-switching via `WhopApp` provider
✅ **Components**: Available from `@whop/react/components`
✅ **Classes**: Use Frosted UI color tokens and size scales

Your app is fully set up with Frosted UI! 🎉

