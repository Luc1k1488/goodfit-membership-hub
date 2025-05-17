
import * as React from "react"
import { Dot } from "lucide-react"
import { OTPInput, SlotProps } from "input-otp"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn("flex items-center gap-2", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  SlotProps & React.ComponentPropsWithoutRef<"div">
>(({ char, isActive, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 items-center justify-center rounded-md border border-input text-sm shadow-sm transition-all",
      isActive && "z-10 ring-1 ring-ring",
      className
    )}
    {...props}
  >
    {char ? (
      <span className="animate-in fade-in-100">{char}</span>
    ) : (
      <span className="flex h-full w-full items-center justify-center">
        <span className={cn(
          "h-4 w-1 animate-caret-blink rounded-full",
          isActive && "bg-foreground opacity-70"
        )} />
      </span>
    )}
  </div>
))
InputOTPSlot.displayName = "InputOTPSlot"

export { InputOTP, InputOTPGroup, InputOTPSlot }
