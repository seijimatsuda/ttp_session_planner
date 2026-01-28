import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateDrill } from "@/hooks/useDrills";
import { MediaUpload } from "@/components/MediaUpload";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  drillFormSchema,
  drillFormDefaults,
  DRILL_CATEGORIES,
  type DrillFormData,
} from "./DrillForm.schema";
import { TagInput } from "./TagInput";
import type { MediaType } from "@/types/media";

interface DrillFormProps {
  /** Callback after successful drill creation */
  onSuccess?: (drillId: string) => void;
}

/**
 * DrillForm component for creating new drills
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Media upload integration (optional)
 * - Tag inputs for equipment and tags
 * - Real-time validation on blur
 * - Loading states during upload and mutation
 * - Success/error feedback via toasts
 */
export function DrillForm({ onSuccess }: DrillFormProps) {
  const { user } = useAuth();
  const createDrill = useCreateDrill();

  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<DrillFormData>({
    resolver: zodResolver(drillFormSchema),
    defaultValues: drillFormDefaults,
    mode: "onBlur",
  });

  // Media upload state (separate from form)
  const [mediaFilePath, setMediaFilePath] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Submit handler
  const onSubmit = async (data: DrillFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a drill");
      return;
    }

    try {
      const drillData = {
        ...data,
        user_id: user.id,
        creator_email: user.email!,
        video_file_path: mediaFilePath,
        video_url: data.video_url || null, // Convert empty string to null
      };

      const newDrill = await createDrill.mutateAsync(drillData);
      toast.success("Drill created successfully!");

      // Reset form and media state
      reset();
      setMediaFilePath(null);
      setMediaType(null);

      // Trigger success callback
      onSuccess?.(newDrill.id);
    } catch (error) {
      console.error("Failed to create drill:", error);
      toast.error("Failed to create drill. Please try again.");
    }
  };

  const isFormDisabled = isSubmitting || createDrill.isPending || isUploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name (required) */}
      <Input
        {...register("name")}
        label="Drill Name *"
        type="text"
        placeholder="e.g., Triangle Passing Drill"
        error={errors.name?.message}
        disabled={isFormDisabled}
      />

      {/* Category (required) */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category *
        </label>
        <select
          {...register("category")}
          id="category"
          disabled={isFormDisabled}
          className="block w-full min-h-11 px-3 rounded-md border shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-0 border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {DRILL_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        {errors.category?.message && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Media Upload (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Media (optional)
        </label>
        <MediaUpload
          onUploadComplete={(filePath, type) => {
            setMediaFilePath(filePath);
            setMediaType(type);
            setIsUploading(false);
          }}
          onDelete={() => {
            setMediaFilePath(null);
            setMediaType(null);
          }}
          initialFilePath={mediaFilePath || undefined}
          initialMediaType={mediaType || undefined}
        />
      </div>

      {/* Number of Players (optional) */}
      <Input
        {...register("num_players", { valueAsNumber: true })}
        label="Number of Players (optional)"
        type="number"
        placeholder="e.g., 6"
        min={1}
        max={30}
        error={errors.num_players?.message}
        disabled={isFormDisabled}
      />

      {/* Equipment (optional) */}
      <Controller
        name="equipment"
        control={control}
        render={({ field }) => (
          <TagInput
            label="Equipment (optional)"
            value={field.value}
            onChange={field.onChange}
            placeholder="e.g., cones, balls"
            error={errors.equipment?.message}
          />
        )}
      />

      {/* Tags (optional) */}
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <TagInput
            label="Tags (optional)"
            value={field.value}
            onChange={field.onChange}
            placeholder="e.g., warm-up, beginner"
            error={errors.tags?.message}
          />
        )}
      />

      {/* Reference URL (optional) */}
      <Input
        {...register("video_url")}
        label="Reference URL (optional)"
        type="url"
        placeholder="https://youtube.com/watch?v=..."
        hint="Link to YouTube video or other reference"
        error={errors.video_url?.message}
        disabled={isFormDisabled}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isFormDisabled}
        loading={isSubmitting || createDrill.isPending}
        className="w-full"
      >
        {isUploading
          ? "Uploading..."
          : isSubmitting || createDrill.isPending
          ? "Creating..."
          : "Create Drill"}
      </Button>
    </form>
  );
}
