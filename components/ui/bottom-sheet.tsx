'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomSheet = DialogPrimitive.Root;
const BottomSheetTrigger = DialogPrimitive.Trigger;
const BottomSheetClose = DialogPrimitive.Close;

const BottomSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
BottomSheetOverlay.displayName = 'BottomSheetOverlay';

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showHandle?: boolean;
    hideCloseButton?: boolean;
  }
>(({ className, children, showHandle = true, hideCloseButton, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <BottomSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex max-h-[88vh] flex-col rounded-t-2xl border-t border-border bg-background shadow-soft-lg',
        'data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out',
        'focus:outline-none',
        className
      )}
      {...props}
    >
      <div className="relative flex shrink-0 items-center justify-center border-b border-border py-3">
        {showHandle && (
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" aria-hidden />
        )}
        {!hideCloseButton && (
          <DialogPrimitive.Close
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
        {children}
      </div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
BottomSheetContent.displayName = 'BottomSheetContent';

export { BottomSheet, BottomSheetTrigger, BottomSheetContent, BottomSheetClose };
