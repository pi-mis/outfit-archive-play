-- Irrobustimento della sicurezza, in quattro punti:
--   1. le note interne dei capi non devono più uscire dal negozio
--   2. le prenotazioni devono reggere lo spam
--   3. il ruolo admin non deve poter essere rivendicato da un estraneo
--   4. lo storage delle foto diventa pubblico in modo dichiarato

-- ---------------------------------------------------------------------------
-- 1. Note interne riservate all'admin
-- Il catalogo resta leggibile da chiunque, ma la colonna `notes` esce dai
-- permessi del ruolo anonimo: dove la mamma annota prezzi d'acquisto, conto
-- vendita o promemoria, quel testo non raggiunge più il browser dei visitatori.
-- ---------------------------------------------------------------------------
REVOKE SELECT ON public.items FROM anon;
GRANT SELECT (
  id, code, zone_key, type_key, name, era, brand, size, measurements,
  condition, flaws, price, status, original_photos, back_original_photos,
  processed_image_url, back_image_url, thumbnail_url,
  height_cm, scale, offset_x, offset_y, created_at, updated_at
) ON public.items TO anon;

-- ---------------------------------------------------------------------------
-- 2. Prenotazioni: limiti di lunghezza, nessuna richiesta su capi inesistenti
--    o già venduti, e niente righe già marcate come gestite.
-- ---------------------------------------------------------------------------
ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_customer_name_len
    CHECK (char_length(customer_name) BETWEEN 1 AND 80),
  ADD CONSTRAINT reservations_contact_len
    CHECK (char_length(contact) BETWEEN 3 AND 120),
  ADD CONSTRAINT reservations_message_len
    CHECK (message IS NULL OR char_length(message) <= 400);

DROP POLICY IF EXISTS "reservations public insert" ON public.reservations;
CREATE POLICY "reservations public insert" ON public.reservations FOR INSERT
  WITH CHECK (
    handled = false
    AND EXISTS (
      SELECT 1 FROM public.items i
      WHERE i.id = item_id AND i.status <> 'venduto'
    )
  );

-- Freno allo svuotamento del modulo a raffica: al massimo 5 richieste per capo
-- nell'arco di un'ora. Una cliente vera non ne manda mai così tante.
CREATE OR REPLACE FUNCTION public.reservations_throttle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (
    SELECT count(*) FROM public.reservations
    WHERE item_id = NEW.item_id AND created_at > now() - interval '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Troppe richieste per questo capo: riprova tra poco.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reservations_throttle ON public.reservations;
CREATE TRIGGER reservations_throttle BEFORE INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.reservations_throttle();

-- ---------------------------------------------------------------------------
-- 3. Il ruolo admin non è più "primo arrivato, primo servito"
-- Prima bastava registrarsi per primi su /auth per prendersi il pannello.
-- Ora la rivendicazione è possibile solo per l'account più vecchio del
-- progetto, e solo finché nessun admin esiste: un estraneo che si registra
-- dopo non può più ottenerlo, nemmeno chiamando la funzione direttamente.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  first_user uuid;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = uid AND role = 'admin'
    );
  END IF;

  SELECT id INTO first_user FROM auth.users ORDER BY created_at LIMIT 1;
  IF first_user IS NULL OR uid <> first_user THEN RETURN false; END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- Permette alla pagina di accesso di mostrare la registrazione solo finché il
-- negozio non ha ancora un admin. Non rivela chi sia: solo se esiste.
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;

REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- Se un account esiste già ed è l'unico, è quello del negozio: lo promuoviamo
-- subito, così la porta si chiude senza lasciare nessuno fuori.
DO $$
DECLARE only_user uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    SELECT id INTO only_user FROM auth.users ORDER BY created_at LIMIT 1;
    IF only_user IS NOT NULL AND (SELECT count(*) FROM auth.users) = 1 THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (only_user, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Storage coerente: il bucket delle foto è pubblico perché le foto dei capi
--    devono essere viste. Niente più link firmati a dieci anni, che fingevano
--    un bucket privato e si sarebbero rotti tutti insieme alla prima rotazione
--    delle chiavi.
-- ---------------------------------------------------------------------------
UPDATE storage.buckets SET public = true WHERE id = 'garments';
