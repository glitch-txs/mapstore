# MemoMap [ MapStore was taken :( ]

`memomap` is a lightweight extension of JavaScript's `Map` that includes state management features such as reactive updates and subscription callbacks. It's ideal for managing global state in a simple and efficient way.

## Installation

```bash
npm install memomap
```

## Usage

### Basic Usage

You can initialize the `Store` with an initial set of values:

```typescript
import { Store } from 'memomap';

const store = new Store({
  count: 0,
  name: 'memomap'
});

console.log(store.get('count')); // 0
console.log(store.get('name')); // 'memomap'
```

### Setting Values

To set a value, use the `.set()` method:

```typescript
store.set('count', 5);
console.log(store.get('count')); // 5
```

### Updating Values

You can also update values based on their previous state with `.update()`:

```typescript
store.update('count', (prev) => prev + 1);
console.log(store.get('count')); // 6
```

If you try to update a key that doesn't exist, it will throw an error:

```typescript
store.update('nonExistentKey', (prev) => prev + 1); // Error: Calling update: "nonExistentKey" was not initialized.
```

### Subscribing to Changes

You can subscribe to changes on a specific key using `.subscribe()`. This will trigger the callback every time the value changes:

```typescript
const unsubscribe = store.subscribe('count', (newValue) => {
  console.log('Count changed to:', newValue);
});

store.set('count', 10); // Logs: Count changed to: 10

unsubscribe();

store.set('count', 15); // No log, subscription is removed
```