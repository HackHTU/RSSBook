---
name: kita-html
description: KitaJS HTML — TypeScript JSX rendering library. Use when building HTML templates, creating server-side components, handling async rendering, streaming HTML with Suspense, or integrating with Fastify for HTML responses. Covers type-safe JSX components, layouts, async/await patterns, error boundaries, and Fastify HTML plugin usage.
---

# KitaJS HTML Skill

KitaJS HTML is a modern TypeScript JSX framework for server-side HTML rendering. It provides type-safe component definitions, async/await support, streaming with Suspense, and seamless Fastify integration.

## Critical Limitation: Server-Side Only

⚠️ **KitaJS HTML is for server-side rendering only.** You cannot write client-side JavaScript logic inside components like you do in React.

### What You CANNOT Do:
- Use `useState`, `useEffect`, `useCallback`, or any React hooks
- Add event handlers (`onClick`, `onChange`, etc.) with inline logic
- Use browser APIs (`localStorage`, `window`, `document`)
- Create stateful components or client-side interactivity

```tsx
// ❌ WRONG - This does not work in KitaJS HTML
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### What You CAN Do:
- Render HTML structure server-side
- Fetch data from databases/APIs
- Process and transform data
- Output static HTML
- Use `data-*` attributes for client-side enhancement (with separate JS)

```tsx
// ✅ CORRECT - Pure server-side rendering
function Counter(props: { initialCount: number }) {
  return (
    <div>
      <p>Current count: {props.initialCount}</p>
      <button data-action="increment">Click me</button>
    </div>
  );
}

// Then in a separate JS file, handle client-side events:
// document.querySelector('[data-action="increment"]').addEventListener('click', ...)
```

### Adding Client-Side Interactivity:
Use `data-*` attributes and separate JavaScript files:

```tsx
// Server component
function FormField(props: { id: string; label: string }) {
  return (
    <div>
      <label htmlFor={props.id}>{props.label}</label>
      <input id={props.id} data-validate="email" type="email" />
    </div>
  );
}

// Separate client scripts/validators.js
document.querySelectorAll('[data-validate="email"]').forEach(input => {
  input.addEventListener('blur', () => {
    // Validate email client-side
  });
});
```

---

## Core Concepts

### 1. Basic JSX Components

KitaJS HTML uses JSX syntax to create type-safe HTML components. Components are functions that return HTML strings.

```tsx
import { html } from '@kitajs/html';

// Simple component
function Greeting(props: { name: string }) {
  return html`<p>Hello, ${props.name}!</p>`;
}

// Using in a layout
const page = html`
  <div>
    ${Greeting({ name: 'World' })}
  </div>
`;
```

**Key Points:**
- JSX is compiled to function calls
- Components receive props as the first argument
- HTML strings are tagged templates
- Props are type-safe with TypeScript interfaces

### 2. Layout Components

Create reusable layout wrappers for HTML structure:

```tsx
interface LayoutProps {
  title?: string;
  head?: string;
  children: string;
}

export function Layout(props: LayoutProps) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{props.title || 'Default Title'}</title>
          <link rel="stylesheet" href="/style.css" />
          {props.head}
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}

// Usage
const page = (
  <Layout title="My Page" head={<meta name="description" content="..." />}>
    <h1>Welcome</h1>
  </Layout>
);
```

**Layout Patterns:**
- Use fragments `<>` to return multiple root elements
- Include DOCTYPE as a string literal: `{'<!doctype html>'}`
- Nest `head` slot for metadata and styles
- Nest `children` slot for page content

### 3. Async Components & Suspense

Handle asynchronous data fetching in components:

```tsx
import { Suspense } from '@kitajs/html';

// Async component fetches data
async function UserCard(props: { userId: string }) {
  const user = await fetchUser(props.userId);
  return (
    <div class="card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Wrap async components with Suspense for streaming
const page = (
  <Layout>
    <Suspense fallback={<div>Loading user...</div>}>
      <UserCard userId="123" />
    </Suspense>
  </Layout>
);
```

**Suspense Behavior:**
- Fallback UI renders first, then streams the async component
- Ideal for server-side rendering with data fetching
- Enables progressive HTML streaming

### 4. Conditional Rendering & Loops

Use JavaScript expressions for logic:

```tsx
interface ListProps {
  items: Array<{ id: string; name: string }>;
  empty?: boolean;
}

function ItemList(props: ListProps) {
  return (
    <ul>
      {props.empty ? (
        <li>No items found</li>
      ) : (
        props.items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))
      )}
    </ul>
  );
}
```

### 5. Fastify Integration

Use the Fastify HTML plugin to send rendered HTML:

```tsx
import Fastify from 'fastify';
import { fastifyHtmlPlugin } from '@kitajs/fastify-html-plugin';

const app = Fastify();
app.register(fastifyHtmlPlugin);

// Simple HTML response
app.get('/page', (req, reply) =>
  reply.html(
    <Layout title="Home">
      <h1>Welcome to my site</h1>
    </Layout>
  )
);

// Streaming with Suspense
app.get('/stream', (req, reply) =>
  reply.html(
    <Layout title="Dashboard">
      <Suspense rid={req.id} fallback={<div>Loading...</div>}>
        <UserProfile userId={req.query.userId} />
      </Suspense>
    </Layout>
  )
);

app.listen({ port: 3000 });
```

**reply.html() options:**
- Automatically sets `Content-Type: text/html; charset=utf-8`
- Supports streaming with Suspense components
- Returns a Promise that resolves when HTML is sent
- `rid` parameter enables request-specific streaming context

## Common Patterns

### Error Boundaries

Create error boundary components to catch rendering errors:

```tsx
async function PageWithErrorBoundary(props: any) {
  try {
    return (
      <Layout>
        <SomeAsyncComponent />
      </Layout>
    );
  } catch (err) {
    return (
      <Layout title="Error">
        <div class="error">
          <h1>Something went wrong</h1>
          <p>{err instanceof Error ? err.message : 'Unknown error'}</p>
        </div>
      </Layout>
    );
  }
}
```

### Props with Children

Define components that accept nested content:

```tsx
interface CardProps {
  title: string;
  children: string; // Content inside the card
}

function Card(props: CardProps) {
  return (
    <div class="card">
      <h2>{props.title}</h2>
      <div class="content">{props.children}</div>
    </div>
  );
}

// Usage with JSX children
const page = (
  <Card title="My Card">
    <p>This content goes inside the card</p>
  </Card>
);
```

### Conditional Elements

Use ternary operators and logical AND for conditional rendering:

```tsx
function Dashboard(props: { isAdmin: boolean; items: Item[] }) {
  return (
    <div>
      {props.isAdmin && <AdminPanel />}
      {props.items.length > 0 ? (
        <ItemList items={props.items} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
```

## Best Practices

1. **Type Your Props**: Use TypeScript interfaces for all component props
   ```tsx
   interface ButtonProps {
     label: string;
     href: string;
     variant?: 'primary' | 'secondary';
   }
   ```

2. **Compose Components**: Build larger UIs from smaller, reusable pieces
   ```tsx
   function Page() {
     return (
       <Layout>
         <Header />
         <MainContent />
         <Footer />
       </Layout>
     );
   }
   ```

3. **Use Async Wisely**: Async components are great for data fetching but can slow page load if not streamed
   ```tsx
   // Good: Non-critical data in Suspense
   <Suspense>
     <RecommendedProducts />
   </Suspense>

   // Avoid: Heavy blocking on critical path
   const criticalData = await fetchEssentialData(); // Better at page level
   ```

4. **Escape User Input**: Always escape dynamic content to prevent XSS
   ```tsx
   // KitaJS auto-escapes string values, but review custom HTML
   function SafeHTML(props: { userText: string }) {
     return html`<p>${props.userText}</p>`; // Safe: auto-escaped
   }
   ```

5. **Organize Component Structure**:
   ```
   components/
   ├── layouts/
   │   ├── Base.tsx
   │   └── Admin.tsx
   ├── sections/
   │   ├── Header.tsx
   │   └── Footer.tsx
   └── ui/
       ├── Button.tsx
       └── Card.tsx
   ```

## Integration Tips

- **With Express**: Use manual response handling instead of reply.html()
  ```tsx
  app.get('/page', (req, res) => {
    const html = <Layout><h1>Page</h1></Layout>;
    res.type('text/html').send(html);
  });
  ```

- **With Next.js**: Use KitaJS for email templates or partial rendering, not full page rendering

- **With Databases**: Fetch data before rendering, not inside components for critical paths
  ```tsx
  app.get('/users/:id', async (req, reply) => {
    const user = await db.users.findOne({ id: req.params.id });
    return reply.html(<UserProfile user={user} />);
  });
  ```

## Related Resources

- [KitaJS HTML GitHub](https://github.com/kitajs/html)
- [Fastify Official Docs](https://www.fastify.io/)
- [JSX/TSX Documentation](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
