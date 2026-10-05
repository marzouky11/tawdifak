'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PhotoLightboxProps {
  photoURL?: string | null;
  name?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a profile photo (e.g. UserAvatar) so tapping it opens a fullscreen,
 * dark-backdrop viewer — similar to the photo viewer in Facebook/WhatsApp.
 * If there is no photoURL (avatar showing only initials), the children are
 * rendered as-is with no click behavior.
 */
export function PhotoLightbox({ photoURL, name, children, className }: PhotoLightboxProps) {
  const [open, setOpen] = useState(false);

  if (!photoURL) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('cursor-zoom-in', className)}
        aria-label={`تكبير الصورة الشخصية${name ? ` لـ ${name}` : ''}`}
      >
        {children}
      </button>
      <DialogContent
        className="max-w-none w-screen h-screen sm:h-screen bg-transparent border-0 shadow-none p-0 rounded-none flex items-center justify-center [&>button]:h-10 [&>button]:w-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-black/70 [&>button]:top-[calc(1rem+env(safe-area-inset-top,0px))] [&>button]:right-[calc(1rem+env(safe-area-inset-right,0px))]"
      >
        <DialogTitle className="sr-only">{`الصورة الشخصية${name ? ` لـ ${name}` : ''}`}</DialogTitle>
        {/* Backdrop area: clicking it closes the viewer, like WhatsApp/Facebook */}
        <div className="w-full h-full flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoURL}
            alt={name ? `الصورة الشخصية لـ ${name}` : 'صورة شخصية'}
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
