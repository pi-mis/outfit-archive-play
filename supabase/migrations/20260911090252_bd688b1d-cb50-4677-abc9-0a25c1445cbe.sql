CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.item_status AS ENUM ('disponibile', 'prenotato', 'venduto');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  all_label text NOT NULL DEFAULT 'Tutti',
  none_label text NOT NULL DEFAULT 'Nessuno',
  sort_order int NOT NULL DEFAULT 0,
  anchor text NOT NULL DEFAULT 'top',
  anchor_y_cm numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.zones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.zones TO authenticated;
GRANT ALL ON public.zones TO service_role;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zones public read" ON public.zones FOR SELECT USING (true);
CREATE POLICY "zones admin write" ON public.zones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER zones_updated_at BEFORE UPDATE ON public.zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.item_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_key text NOT NULL REFERENCES public.zones(key) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  spans_two_zones boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (zone_key, key)
);
GRANT SELECT ON public.item_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_types TO authenticated;
GRANT ALL ON public.item_types TO service_role;
ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "item_types public read" ON public.item_types FOR SELECT USING (true);
CREATE POLICY "item_types admin write" ON public.item_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER item_types_updated_at BEFORE UPDATE ON public.item_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  zone_key text NOT NULL REFERENCES public.zones(key),
  type_key text NOT NULL,
  name text NOT NULL,
  era text,
  brand text,
  size text,
  measurements jsonb NOT NULL DEFAULT '{}'::jsonb,
  condition text,
  flaws text,
  price numeric NOT NULL DEFAULT 0,
  status public.item_status NOT NULL DEFAULT 'disponibile',
  original_photos text[] NOT NULL DEFAULT '{}',
  processed_image_url text,
  thumbnail_url text,
  height_cm numeric NOT NULL DEFAULT 60,
  scale numeric NOT NULL DEFAULT 1,
  offset_x numeric NOT NULL DEFAULT 0,
  offset_y numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX items_zone_type_idx ON public.items (zone_key, type_key);
GRANT SELECT ON public.items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items public read" ON public.items FOR SELECT USING (true);
CREATE POLICY "items admin write" ON public.items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  contact text NOT NULL,
  message text,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reservations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations public insert" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "reservations admin read" ON public.reservations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reservations admin update" ON public.reservations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));