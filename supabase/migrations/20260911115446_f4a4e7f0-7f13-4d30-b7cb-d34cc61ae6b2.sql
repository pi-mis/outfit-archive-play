ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS back_image_url text,
  ADD COLUMN IF NOT EXISTS back_original_photos text[] NOT NULL DEFAULT '{}';