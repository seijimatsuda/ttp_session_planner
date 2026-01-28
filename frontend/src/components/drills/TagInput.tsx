import { useState, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  label: string;
  error?: string;
}

/**
 * TagInput component for array fields (equipment, tags)
 *
 * Features:
 * - Add tags with Enter or Tab keys
 * - Remove last tag with Backspace on empty input
 * - Remove specific tag by clicking X button
 * - Prevent duplicates
 * - Respect maxTags limit
 * - Touch-friendly design (44px touch targets)
 * - Error state styling
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  maxTags = 10,
  className,
  label,
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;

    // Prevent duplicates
    if (value.includes(trimmed)) {
      setInputValue("");
      return;
    }

    // Respect maxTags limit
    if (value.length >= maxTags) {
      setInputValue("");
      return;
    }

    onChange([...value, trimmed]);
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Enter or Tab: add tag
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addTag(inputValue);
    }

    // Backspace on empty input: remove last tag
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      e.preventDefault();
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    // Add current input as tag on blur
    addTag(inputValue);
  };

  const isMaxReached = value.length >= maxTags;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-md border bg-white px-3 py-2 transition-colors",
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
          error
            ? "border-red-500"
            : "border-gray-300 hover:border-gray-400"
        )}
      >
        {/* Display tags */}
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="min-h-11 min-w-11 flex items-center justify-center rounded-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 -mr-2"
              aria-label={`Remove ${tag}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={isMaxReached ? `Max ${maxTags} tags` : placeholder}
          disabled={isMaxReached}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-gray-400"
          style={{ minHeight: "44px" }}
        />
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        {value.length} / {maxTags} tags
      </p>
    </div>
  );
}
