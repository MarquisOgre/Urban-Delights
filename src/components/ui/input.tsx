import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value: valueProp, onChange, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState<string | undefined>(undefined)

    const isNumeric = type === "number"
    const isZero =
      isNumeric &&
      valueProp !== "" &&
      valueProp !== null &&
      valueProp !== undefined &&
      Number(valueProp) === 0

    const displayValue =
      isNumeric && focused && isZero
        ? ""
        : internalValue !== undefined
        ? internalValue
        : valueProp

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isZero) {
        setFocused(true)
        setInternalValue("")
      } else {
        setFocused(true)
      }
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      if (internalValue === "") {
        if (onChange) {
          const synthetic = {
            target: { value: "0", name: e.target.name },
            currentTarget: { value: "0", name: e.target.name },
          } as unknown as React.ChangeEvent<HTMLInputElement>
          onChange(synthetic)
        }
      }
      setInternalValue(undefined)
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value)
      onChange?.(e)
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        value={displayValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
