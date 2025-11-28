import React from 'react';
import renderer, { ReactTestRenderer, act } from 'react-test-renderer';
import { NavigationProvider } from '../src/contexts/NavigationContext';
import { ZoomProvider } from '../src/contexts/ZoomContext';

export type Options = {
  // placeholder for future options (initial states, mocks)
};

// Async render that waits for provider effects (e.g. async storage hydration)
export async function renderWithProvidersAsync(
  component: React.ReactElement,
  _opts?: Options
): Promise<ReactTestRenderer> {
  let tree: ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <ZoomProvider>
        <NavigationProvider>{component}</NavigationProvider>
      </ZoomProvider>
    );
    // ensure async microtasks (like init in providers) settle
    await Promise.resolve();
  });
  // tree is defined when act resolves
  // @ts-ignore - TypeScript may not infer that tree is defined after act
  return tree;
}

// Synchronous wrapper that invokes the async variant and returns the result
// This default export preserves the previous tests that used renderWithProviders
export default function renderWithProviders(
  component: React.ReactElement,
  _opts?: Options
): ReactTestRenderer {
  // This synchronous API will render the component and try to flush updates,
  // but tests that need provider effects should use renderWithProvidersAsync
  let tree: ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <ZoomProvider>
        <NavigationProvider>{component}</NavigationProvider>
      </ZoomProvider>
    );
  });
  // @ts-ignore
  return tree;
}
