--
-- PostgreSQL database dump
--

\restrict Qf4voHUmp0BC1UbkDZFKP5g5EizFW7KSVYLYeSo8lzio9auDnbEGraoO5mu0xfW

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nome character varying(150) NOT NULL,
    telefone character varying(20),
    endereco text,
    bairro character varying(80),
    cidade character varying(80),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clientes OWNER TO crm;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: crm
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clientes_id_seq OWNER TO crm;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name text NOT NULL,
    phone_e164 text NOT NULL,
    region text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO crm;

--
-- Name: despesas; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.despesas (
    id integer NOT NULL,
    descricao character varying(150) NOT NULL,
    valor numeric(10,2) NOT NULL,
    data_despesa date DEFAULT CURRENT_DATE,
    categoria character varying(50)
);


ALTER TABLE public.despesas OWNER TO crm;

--
-- Name: despesas_id_seq; Type: SEQUENCE; Schema: public; Owner: crm
--

CREATE SEQUENCE public.despesas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.despesas_id_seq OWNER TO crm;

--
-- Name: despesas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm
--

ALTER SEQUENCE public.despesas_id_seq OWNED BY public.despesas.id;


--
-- Name: mensagens; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.mensagens (
    id integer NOT NULL,
    titulo character varying(100),
    conteudo text NOT NULL,
    data_envio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo character varying(50)
);


ALTER TABLE public.mensagens OWNER TO crm;

--
-- Name: mensagens_id_seq; Type: SEQUENCE; Schema: public; Owner: crm
--

CREATE SEQUENCE public.mensagens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mensagens_id_seq OWNER TO crm;

--
-- Name: mensagens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm
--

ALTER SEQUENCE public.mensagens_id_seq OWNED BY public.mensagens.id;


--
-- Name: message_queue; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.message_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    template_id uuid NOT NULL,
    channel text NOT NULL,
    payload jsonb NOT NULL,
    scheduled_for timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    provider_msg_id text,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.message_queue OWNER TO crm;

--
-- Name: message_templates; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.message_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    channel text DEFAULT 'whatsapp'::text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.message_templates OWNER TO crm;

--
-- Name: produtos; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.produtos (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    tipo character varying(50),
    preco numeric(10,2) NOT NULL,
    estoque integer DEFAULT 0,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.produtos OWNER TO crm;

--
-- Name: produtos_id_seq; Type: SEQUENCE; Schema: public; Owner: crm
--

CREATE SEQUENCE public.produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.produtos_id_seq OWNER TO crm;

--
-- Name: produtos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm
--

ALTER SEQUENCE public.produtos_id_seq OWNED BY public.produtos.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    product text NOT NULL,
    quantity integer NOT NULL,
    purchased_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT purchases_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.purchases OWNER TO crm;

--
-- Name: reminder_rules; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.reminder_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product text NOT NULL,
    after_days integer NOT NULL,
    template_id uuid NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reminder_rules_after_days_check CHECK ((after_days > 0))
);


ALTER TABLE public.reminder_rules OWNER TO crm;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha character varying(255) NOT NULL,
    perfil character varying(50) DEFAULT 'vendedor'::character varying,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO crm;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: crm
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO crm;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: vendas; Type: TABLE; Schema: public; Owner: crm
--

CREATE TABLE public.vendas (
    id integer NOT NULL,
    cliente_id integer,
    usuario_id integer,
    produto_id integer,
    quantidade integer NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    forma_pagamento character varying(30),
    data_venda timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vendas OWNER TO crm;

--
-- Name: vendas_id_seq; Type: SEQUENCE; Schema: public; Owner: crm
--

CREATE SEQUENCE public.vendas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendas_id_seq OWNER TO crm;

--
-- Name: vendas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm
--

ALTER SEQUENCE public.vendas_id_seq OWNED BY public.vendas.id;


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: despesas id; Type: DEFAULT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.despesas ALTER COLUMN id SET DEFAULT nextval('public.despesas_id_seq'::regclass);


--
-- Name: mensagens id; Type: DEFAULT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.mensagens ALTER COLUMN id SET DEFAULT nextval('public.mensagens_id_seq'::regclass);


--
-- Name: produtos id; Type: DEFAULT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.produtos ALTER COLUMN id SET DEFAULT nextval('public.produtos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: vendas id; Type: DEFAULT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.vendas ALTER COLUMN id SET DEFAULT nextval('public.vendas_id_seq'::regclass);


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.clientes (id, nome, telefone, endereco, bairro, cidade, criado_em) FROM stdin;
1	Maria Oliveira	88992000011	Rua das Flores, 120	Centro	Sobral	2025-10-22 10:26:17.623051
2	José Santos	88991555522	Av. Dom José, 500	Campo dos Velhos	Sobral	2025-10-22 10:26:17.623051
3	Ana Costa	88998111133	Rua Raimundo Nonato, 45	Junco	Sobral	2025-10-22 10:26:17.623051
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.customers (id, full_name, phone_e164, region, created_at, updated_at) FROM stdin;
79d0c795-0a78-41cd-857b-73342d0068c3	Maria Souza	+5588999999999	Sede	2025-10-23 20:42:02.099109+00	2025-10-23 20:42:02.099109+00
785487ed-71f4-47c1-b6e7-da9d8b429292	Cliente 1	+558899990001	\N	2025-10-24 10:04:10.364125+00	2025-10-24 10:04:10.364125+00
24466e0f-ee77-4f2c-9ba5-3d4f08425741	Cliente 2	+558899990002	\N	2025-10-24 10:04:10.364125+00	2025-10-24 10:04:10.364125+00
fb956d61-b04c-4fd6-90b3-13a97b2ff9c6	Cliente 3	+558899990003	\N	2025-10-24 10:04:10.364125+00	2025-10-24 10:04:10.364125+00
d86b03bb-f1db-4d44-824e-4a575ba02c88	Cliente Teste	+5588999990001	\N	2025-10-25 01:54:08.451643+00	2025-10-25 01:54:08.451643+00
\.


--
-- Data for Name: despesas; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.despesas (id, descricao, valor, data_despesa, categoria) FROM stdin;
\.


--
-- Data for Name: mensagens; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.mensagens (id, titulo, conteudo, data_envio, tipo) FROM stdin;
\.


--
-- Data for Name: message_queue; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.message_queue (id, customer_id, template_id, channel, payload, scheduled_for, status, provider_msg_id, error, created_at, updated_at) FROM stdin;
86c1cd98-9b83-4f65-86aa-6b358f6ff279	785487ed-71f4-47c1-b6e7-da9d8b429292	f0506e83-ee4c-4b53-97b5-81dafc506dd3	whatsapp	{}	2025-10-25 21:57:47.202874+00	pending	\N	\N	2025-10-25 21:57:47.202874+00	2025-10-25 21:57:47.202874+00
3596eb04-bcaa-4bb4-9a43-de330f47041b	24466e0f-ee77-4f2c-9ba5-3d4f08425741	f0506e83-ee4c-4b53-97b5-81dafc506dd3	whatsapp	{}	2025-10-25 21:58:20.573313+00	pending	\N	\N	2025-10-25 21:58:20.573313+00	2025-10-25 21:58:20.573313+00
445aa527-3f33-4c64-8ff4-a817cea24a58	79d0c795-0a78-41cd-857b-73342d0068c3	f0506e83-ee4c-4b53-97b5-81dafc506dd3	whatsapp	{}	2025-10-25 22:02:27.446202+00	pending	\N	\N	2025-10-25 22:00:27.446202+00	2025-10-25 22:00:27.446202+00
\.


--
-- Data for Name: message_templates; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.message_templates (id, name, channel, body, created_at, updated_at) FROM stdin;
f0506e83-ee4c-4b53-97b5-81dafc506dd3	Lembrete P13 padrão	whatsapp	Olá {{firstName}}! Seu último P13 foi em {{lastBuyDate}}. Costuma durar {{days}} dias. Quer repor hoje?	2025-10-23 20:42:02.345502+00	2025-10-23 20:42:02.345502+00
\.


--
-- Data for Name: produtos; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.produtos (id, nome, tipo, preco, estoque, criado_em) FROM stdin;
2	Água Mineral 20L	água	10.00	50	2025-10-22 10:19:04.517671
3	Água Dessalinizada 20L	água	6.00	40	2025-10-22 10:19:04.517671
4	Gás P13	gás	120.00	30	2025-10-22 10:24:48.303422
5	Água Mineral 20L	água	10.00	50	2025-10-22 10:24:48.303422
6	Água Dessalinizada 20L	água	6.00	40	2025-10-22 10:24:48.303422
1	Gás P13	gás	120.00	28	2025-10-22 10:19:04.517671
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.purchases (id, customer_id, product, quantity, purchased_at) FROM stdin;
4c485bad-78ad-4780-89c3-a30e8a819081	79d0c795-0a78-41cd-857b-73342d0068c3	GAS_P13	1	2025-10-03 20:42:02.241911+00
\.


--
-- Data for Name: reminder_rules; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.reminder_rules (id, product, after_days, template_id, active, created_at, updated_at) FROM stdin;
c3c15fd2-1cba-456a-8e8a-6e9834f34811	GAS_P13	25	f0506e83-ee4c-4b53-97b5-81dafc506dd3	t	2025-10-24 10:05:42.207862+00	2025-10-24 10:05:42.207862+00
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.usuarios (id, nome, email, senha, perfil, criado_em) FROM stdin;
1	Administrador	admin@crm.com	admin123	administrador	2025-10-22 10:19:04.144169
\.


--
-- Data for Name: vendas; Type: TABLE DATA; Schema: public; Owner: crm
--

COPY public.vendas (id, cliente_id, usuario_id, produto_id, quantidade, valor_total, forma_pagamento, data_venda) FROM stdin;
1	1	1	1	2	240.00	pix	2025-10-22 10:26:51.885451
2	1	1	1	2	240.00	pix	2025-10-27 10:07:41.885176
\.


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm
--

SELECT pg_catalog.setval('public.clientes_id_seq', 3, true);


--
-- Name: despesas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm
--

SELECT pg_catalog.setval('public.despesas_id_seq', 1, false);


--
-- Name: mensagens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm
--

SELECT pg_catalog.setval('public.mensagens_id_seq', 1, false);


--
-- Name: produtos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm
--

SELECT pg_catalog.setval('public.produtos_id_seq', 6, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 2, true);


--
-- Name: vendas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm
--

SELECT pg_catalog.setval('public.vendas_id_seq', 34, true);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_phone_e164_key; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_e164_key UNIQUE (phone_e164);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: despesas despesas_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.despesas
    ADD CONSTRAINT despesas_pkey PRIMARY KEY (id);


--
-- Name: mensagens mensagens_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_pkey PRIMARY KEY (id);


--
-- Name: message_queue message_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.message_queue
    ADD CONSTRAINT message_queue_pkey PRIMARY KEY (id);


--
-- Name: message_templates message_templates_name_key; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_name_key UNIQUE (name);


--
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: reminder_rules reminder_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.reminder_rules
    ADD CONSTRAINT reminder_rules_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: vendas vendas_pkey; Type: CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_pkey PRIMARY KEY (id);


--
-- Name: idx_message_queue_status_time; Type: INDEX; Schema: public; Owner: crm
--

CREATE INDEX idx_message_queue_status_time ON public.message_queue USING btree (status, scheduled_for);


--
-- Name: idx_purchases_customer_time; Type: INDEX; Schema: public; Owner: crm
--

CREATE INDEX idx_purchases_customer_time ON public.purchases USING btree (customer_id, purchased_at DESC);


--
-- Name: message_queue message_queue_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.message_queue
    ADD CONSTRAINT message_queue_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: message_queue message_queue_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.message_queue
    ADD CONSTRAINT message_queue_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.message_templates(id) ON DELETE RESTRICT;


--
-- Name: purchases purchases_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: reminder_rules reminder_rules_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.reminder_rules
    ADD CONSTRAINT reminder_rules_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.message_templates(id) ON DELETE RESTRICT;


--
-- Name: vendas vendas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: vendas vendas_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: vendas vendas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Qf4voHUmp0BC1UbkDZFKP5g5EizFW7KSVYLYeSo8lzio9auDnbEGraoO5mu0xfW

