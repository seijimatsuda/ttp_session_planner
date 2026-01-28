/**
 * React hook for debouncing rapidly changing values
 *
 * Useful for search inputs, form fields, and any value that changes
 * frequently where you want to delay processing until changes settle.
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 500)
 * // API call only happens 500ms after user stops typing
 */

import { useState, useEffect } from 'react'

/**
 * Debounces a value by delaying updates until the value stops changing
 *
 * @param value - The value to debounce
 * @param delay - Milliseconds to wait after last change (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up a timeout to update the debounced value after the delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if value changes or component unmounts
    return () => {
      clearTimeout(timeoutId)
    }
  }, [value, delay])

  return debouncedValue
}
