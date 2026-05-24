"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// disablePointerDismissal=true globally so dialogs never close when
// clicking inside Select/Popover portals or backspacing in inputs
function Dialog({ disablePointerDismissal = true, ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" disablePointerDismissal={disablePointerDismissal} {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-sm duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = "default",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  size?: "sm" | "default" | "lg" | "xl" | "full" | "property"
}) {
  const sizeClasses = {
    // sm — confirm dialogs, small alerts
    sm: "w-full max-w-[calc(100%-2rem)] sm:max-w-sm",
    // default — medium single-section forms
    default: "w-full max-w-[calc(100%-2rem)] sm:max-w-md",
    // lg — multi-field forms (leads, plot)
    lg: "w-full max-w-[calc(100%-2rem)] sm:max-w-lg",
    // xl — rich multi-section forms (add/edit property, add associate)
    xl: "w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl",
    // full — take up most of screen
    full: "w-full max-w-[95vw] max-h-[95vh]",
    // property — large detail view
    property: "w-full max-w-[calc(100%-2rem)] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl",
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          // base layout
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          // height — never taller than viewport, always scrollable
          "max-h-[calc(100vh-2rem)] overflow-y-auto",
          // appearance
          "rounded-2xl bg-white text-sm text-popover-foreground shadow-2xl outline-none",
          // animation
          "duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3 z-50 rounded-full w-8 h-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-500"
                size="icon-sm"
              />
            }
          >
            <XIcon className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-0", className)}
      {...props}
    />
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("px-6 py-5", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 px-6 pb-6 pt-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg font-bold leading-tight text-[#1e1b4b]",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogBody,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogContent,
}
