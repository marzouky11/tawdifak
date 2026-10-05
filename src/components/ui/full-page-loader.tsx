import { Loader2 } from 'lucide-react';

/**
 * An in-page loading indicator for the main content area.
 *
 * Unlike a full-viewport overlay, this renders in the normal document flow
 * inside <main>, so the header and bottom navigation (rendered by AppLayout
 * outside of `children`) stay visible and untouched. Only the content area
 * collapses into a big, centered spinner while the page/data is loading.
 *
 * `min-h-[70vh]` keeps the placeholder tall/roomy on every page (login,
 * signup, profile, edit profile, ...) so the spinner sits centered in a
 * generous empty area instead of near the top of the page.
 */
export function FullPageLoader() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
