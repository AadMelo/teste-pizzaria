CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: add_loyalty_points(uuid, integer, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_loyalty_points(p_user_id uuid, p_points integer, p_description text, p_order_id uuid DEFAULT NULL::uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_points integer;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Verify caller matches target user (only allow modifying own points)
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Not authorized to modify points for user %', p_user_id;
  END IF;

  -- Validate points is positive
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Points must be positive';
  END IF;

  -- Validate description length
  IF length(p_description) > 200 THEN
    RAISE EXCEPTION 'Description too long';
  END IF;

  -- Atomically update profile points and return new balance
  UPDATE profiles 
  SET loyalty_points = loyalty_points + p_points,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING loyalty_points INTO new_points;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;
  
  -- Insert transaction record
  INSERT INTO loyalty_transactions (user_id, order_id, points, type, description)
  VALUES (p_user_id, p_order_id, p_points, 'earned', p_description);
  
  RETURN new_points;
END;
$$;


--
-- Name: cancel_expired_pix_orders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cancel_expired_pix_orders() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Cancel orders that are pending_payment for more than 15 minutes
  UPDATE public.orders
  SET status = 'cancelled'
  WHERE status = 'pending_payment'
    AND created_at < NOW() - INTERVAL '15 minutes';
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, loyalty_points)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', 50);
  
  -- Add welcome bonus transaction
  INSERT INTO public.loyalty_transactions (user_id, points, type, description)
  VALUES (NEW.id, 50, 'bonus', 'Bônus de boas-vindas');
  
  RETURN NEW;
END;
$$;


--
-- Name: redeem_loyalty_points(uuid, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.redeem_loyalty_points(p_user_id uuid, p_points integer, p_description text) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  current_points integer;
  new_points integer;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Verify caller matches target user (only allow modifying own points)
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Not authorized to modify points for user %', p_user_id;
  END IF;

  -- Validate points is positive
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Points must be positive';
  END IF;

  -- Validate description length
  IF length(p_description) > 200 THEN
    RAISE EXCEPTION 'Description too long';
  END IF;

  -- Lock the row and get current points
  SELECT loyalty_points INTO current_points
  FROM profiles
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;
  
  IF current_points < p_points THEN
    RAISE EXCEPTION 'Insufficient points. Current: %, Required: %', current_points, p_points;
  END IF;
  
  -- Atomically update profile points
  UPDATE profiles 
  SET loyalty_points = loyalty_points - p_points,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING loyalty_points INTO new_points;
  
  -- Insert transaction record (negative points for redemption)
  INSERT INTO loyalty_transactions (user_id, points, type, description)
  VALUES (p_user_id, -p_points, 'redeemed', p_description);
  
  RETURN new_points;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: loyalty_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid,
    points integer NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    items jsonb NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    address text NOT NULL,
    payment_method text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    points_earned integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_address_length_check CHECK ((length(address) <= 500)),
    CONSTRAINT orders_amounts_check CHECK (((total >= (0)::numeric) AND (subtotal >= (0)::numeric) AND (discount >= (0)::numeric) AND (delivery_fee >= (0)::numeric))),
    CONSTRAINT orders_payment_method_check CHECK ((payment_method = ANY (ARRAY['pix'::text, 'card'::text, 'cash'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'pending_payment'::text, 'confirmed'::text, 'preparing'::text, 'delivering'::text, 'delivered'::text, 'cancelled'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text,
    phone text,
    loyalty_points integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT loyalty_points_non_negative CHECK ((loyalty_points >= 0))
);


--
-- Name: loyalty_transactions loyalty_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: loyalty_transactions loyalty_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: loyalty_transactions loyalty_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: orders Allow users to insert own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: orders Allow users to select own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to select own orders" ON public.orders FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: loyalty_transactions Deny all loyalty transaction deletions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deny all loyalty transaction deletions" ON public.loyalty_transactions FOR DELETE TO authenticated USING (false);


--
-- Name: loyalty_transactions Deny all loyalty transaction updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deny all loyalty transaction updates" ON public.loyalty_transactions FOR UPDATE TO authenticated USING (false);


--
-- Name: orders Deny all order deletions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deny all order deletions" ON public.orders FOR DELETE TO authenticated USING (false);


--
-- Name: orders Deny all order updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deny all order updates" ON public.orders FOR UPDATE TO authenticated USING (false);


--
-- Name: loyalty_transactions Deny direct loyalty transaction inserts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deny direct loyalty transaction inserts" ON public.loyalty_transactions FOR INSERT TO authenticated WITH CHECK (false);


--
-- Name: profiles Deny profile deletions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deny profile deletions" ON public.profiles FOR DELETE TO authenticated USING (false);


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: loyalty_transactions Users can view their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own transactions" ON public.loyalty_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: loyalty_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


