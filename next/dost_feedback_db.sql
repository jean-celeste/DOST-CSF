--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-06-04 13:43:34

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

DROP DATABASE IF EXISTS dost_feedback_db;
--
-- TOC entry 5031 (class 1262 OID 16639)
-- Name: dost_feedback_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE dost_feedback_db WITH TEMPLATE = template0 ENCODING = 'UTF8';


ALTER DATABASE dost_feedback_db OWNER TO postgres;

\connect dost_feedback_db

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
-- TOC entry 238 (class 1259 OID 16907)
-- Name: admins_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_admin_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_admin_id_seq OWNER TO postgres;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    admin_id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    office_id integer,
    division_id integer,
    created_at timestamp without time zone
);


ALTER TABLE public.admins OWNER TO postgres;

DO $$
BEGIN
    CREATE TYPE public.client_age_enum AS ENUM (
        '19 and lower',
        '20 - 34',
        '35 - 49',
        '50 - 64',
        '65 and up'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

--
-- TOC entry 221 (class 1259 OID 16659)
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    client_id integer NOT NULL,
    name character varying(255),
    email character varying,
    phone character varying NOT NULL,
    sex character varying NOT NULL,
    age public.client_age_enum NOT NULL,
    client_type_id integer NOT NULL,
    last_updated timestamp without time zone DEFAULT now() NOT NULL,
    email_hash character varying(64),
    phone_hash character varying(64),
    name_hash character varying(64)
);


ALTER TABLE public.client OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16666)
-- Name: client_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_type (
    client_type_id integer NOT NULL,
    client_type_name character varying NOT NULL
);


ALTER TABLE public.client_type OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16645)
-- Name: responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.responses (
    response_id integer NOT NULL,
    form_id integer,
    service_id integer,
    submitted_at timestamp without time zone,
    client_id integer,
    answers jsonb
);


ALTER TABLE public.responses OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16650)
-- Name: csm_flat_ratings; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.csm_flat_ratings AS
 SELECT response_id,
    form_id,
    ((jsonb_each_text(((answers -> 'csmARTARatings'::text) -> 'ratings'::text))).key)::integer AS question_id,
    (jsonb_each_text(((answers -> 'csmARTARatings'::text) -> 'ratings'::text))).value AS rating
   FROM public.responses r
  WHERE ((form_id = 1) AND (answers ? 'csmARTARatings'::text) AND ((answers -> 'csmARTARatings'::text) ? 'ratings'::text));


ALTER VIEW public.csm_flat_ratings OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16654)
-- Name: csm_sqd_positive_percentage; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.csm_sqd_positive_percentage AS
 SELECT question_id,
    count(*) FILTER (WHERE (rating = ANY (ARRAY['strongly-agree'::text, 'agree'::text]))) AS positive_count,
    count(*) FILTER (WHERE (rating <> 'na'::text)) AS valid_count,
        CASE
            WHEN (count(*) FILTER (WHERE (rating <> 'na'::text)) = 0) THEN (0)::numeric
            ELSE round((((count(*) FILTER (WHERE (rating = ANY (ARRAY['strongly-agree'::text, 'agree'::text]))))::numeric / (count(*) FILTER (WHERE (rating <> 'na'::text)))::numeric) * (100)::numeric), 2)
        END AS percentage_positive
   FROM public.csm_flat_ratings
  GROUP BY question_id;


ALTER VIEW public.csm_sqd_positive_percentage OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16665)
-- Name: customer_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.client ALTER COLUMN client_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.customer_customer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16671)
-- Name: division; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.division (
    division_id integer NOT NULL,
    division_name character varying(255),
    office_id integer
);


ALTER TABLE public.division OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16679)
-- Name: form_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_status (
    status_id integer NOT NULL,
    status_name character varying
);


ALTER TABLE public.form_status OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16684)
-- Name: forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms (
    form_id integer NOT NULL,
    form_title character varying,
    added_by integer,
    added_at timestamp without time zone,
    updated_at timestamp without time zone,
    status_id integer,
    description text,
    version integer DEFAULT 1
);


ALTER TABLE public.forms OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16689)
-- Name: office_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.office_type (
    office_type_id integer NOT NULL,
    type_name character varying
);


ALTER TABLE public.office_type OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16694)
-- Name: offices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offices (
    office_id integer GENERATED BY DEFAULT AS IDENTITY,
    office_name character varying,
    office_type_id integer,
    office_category varchar(20) DEFAULT 'main'::character varying,
    division_id integer,
    parent_office_id integer,
    is_archived boolean DEFAULT false NOT NULL,
    archived_at timestamp without time zone
);


ALTER TABLE public.offices OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16699)
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    form_id integer,
    question_text text
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16704)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    service_id integer NOT NULL,
    service_name character varying,
    service_type_id integer,
    description text,
    office_id integer,
    is_archived boolean DEFAULT false NOT NULL,
    archived_at timestamp without time zone
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16719)
-- Name: responses_response_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.responses ALTER COLUMN response_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.responses_response_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 16720)
-- Name: service_client_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_client_type (
    service_id integer NOT NULL,
    client_type_id integer NOT NULL
);


ALTER TABLE public.service_client_type OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16723)
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_service_id_seq OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16724)
-- Name: services_service_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.services ALTER COLUMN service_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.services_service_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 16725)
-- Name: services_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services_types (
    service_type_id integer NOT NULL,
    service_type_name character varying
);


ALTER TABLE public.services_types OWNER TO postgres;

--
-- TOC entry 5007 (class 0 OID 16640)
-- Dependencies: 217
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admins VALUES (1, 'regional_admin', '$2b$10$MilWPtrdKnMh/gRrJdq9feHQvF75/p3Mlc7jd6mNvRYO4OmPoEkS.', 'Regional Administrator', NULL, 1, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (4, 'albay_psto_admin', '$2b$10$.vsVNSstjMV0Y08kvNj7tuYD2TrTvAuFaLQQSgg5hUUMIFKjwC93m', 'Office Administrator', 2, NULL, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (5, 'camarines_norte_psto_admin', '$2b$10$ca5JNHQGcorQsjKICQhMXeS.T./5UtHz2xtoAZpn/g.d6eZdhD2/K', 'Office Administrator', 3, NULL, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (6, 'camarines_sur_psto_admin', '$2b$10$kLACi1dQnYKe0Lg2Ltc1ROUBLwr1Fh6ltxyOAvxacwnMK40OlCVZy', 'Office Administrator', 4, NULL, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (7, 'catanduanes_psto_admin', '$2b$10$o9zXRHhfA1hQTEq2CVO9aeIPAdhUxBzGxLS/8XdepnqVCtDPFZBM.', 'Office Administrator', 5, NULL, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (8, 'masbate_psto_admin', '$2b$10$BqwSpKOxmBbYyV7KH.Iuh.ExsLF4KlcOW0NDmv2CIeoFwhRwXf.n6', 'Office Administrator', 6, NULL, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (9, 'sorsogon_psto_admin', '$2b$10$y1ABE8sftSZvEasgn5SKNetIMVhFrZG0NozlWKihTIRyOkDBjXtr.', 'Office Administrator', 7, NULL, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (2, 'tech_ops_admin', '$2b$10$F3PD7AOv2SzBE6h6t5kJzut1wyMUDoYArzChzFYRt/Ytzpt2Me7Qm', 'Division Administrator', 1, 1, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (3, 'finance_admin', '$2b$10$Ug3g/muBoZfsxs2IcptjtuIg1Ltc4qSSaGJwUfZwgN6iSEpXxH5aW', 'Division Administrator', 2, 1, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;


--
-- TOC entry 5009 (class 0 OID 16659)
-- Dependencies: 221
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- No initial client data


--
-- TOC entry 5011 (class 0 OID 16666)
-- Dependencies: 223
-- Data for Name: client_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_type VALUES (1, 'internal') ON CONFLICT DO NOTHING;
INSERT INTO public.client_type VALUES (2, 'citizen') ON CONFLICT DO NOTHING;
INSERT INTO public.client_type VALUES (3, 'business') ON CONFLICT DO NOTHING;
INSERT INTO public.client_type VALUES (4, 'government') ON CONFLICT DO NOTHING;


--
-- TOC entry 5012 (class 0 OID 16671)
-- Dependencies: 224
-- Data for Name: division; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.division VALUES (1, 'Technical Operations Division', 1) ON CONFLICT DO NOTHING;
INSERT INTO public.division VALUES (2, 'Finance Administrative and Support Services Division', 1) ON CONFLICT DO NOTHING;


--
-- TOC entry 5013 (class 0 OID 16679)
-- Dependencies: 225
-- Data for Name: form_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.form_status VALUES (1, 'active') ON CONFLICT DO NOTHING;
INSERT INTO public.form_status VALUES (2, 'draft') ON CONFLICT DO NOTHING;
INSERT INTO public.form_status VALUES (3, 'archived') ON CONFLICT DO NOTHING;


--
-- TOC entry 5014 (class 0 OID 16684)
-- Dependencies: 226
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.forms VALUES (1, 'CSM-ARTA-F1: Client Satisfaction Measurement (Eng)', 1, '2025-04-10 10:50:54.877214', '2025-04-10 10:50:54.877214', 1, 'Standard client satisfaction measurement form for DOST services') ON CONFLICT DO NOTHING;
INSERT INTO public.forms VALUES (2, 'QMS-F4: Customer Satisfaction Feedback (Eng)', 1, '2025-04-10 10:50:54.877214', '2025-04-10 10:50:54.877214', 1, 'Technical services specific customer satisfaction feedback form') ON CONFLICT DO NOTHING;


--
-- TOC entry 5015 (class 0 OID 16689)
-- Dependencies: 227
-- Data for Name: office_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.office_type VALUES (2, 'Provincial Science and Technology Office') ON CONFLICT DO NOTHING;
INSERT INTO public.office_type VALUES (1, 'Regional Office') ON CONFLICT DO NOTHING;


--
-- TOC entry 5016 (class 0 OID 16694)
-- Dependencies: 228
-- Data for Name: offices; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (1, 'DOST Regional Office', 1, 'main', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (2, 'Albay PSTO', 2, 'branch', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (3, 'Camarines Norte PSTO', 2, 'branch', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (4, 'Camarines Sur PSTO', 2, 'branch', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (5, 'Catanduanes PSTO', 2, 'branch', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (6, 'Masbate PSTO', 2, 'branch', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (7, 'Sorsogon PSTO', 2, 'branch', NULL, NULL) ON CONFLICT DO NOTHING;

-- Former regional "units" (operational unit offices; parent = DOST Regional Office)
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (8, 'SETUP', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (9, 'SSCP', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (10, 'CEST', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (11, 'GIA', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (12, 'IFWD PH', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (13, 'TECHGROW', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (14, 'GRIND', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (15, 'IHUB', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (16, 'BFST', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (17, 'BCHRD', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (18, 'RSTL', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (19, 'SCHOLARSHIP', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (20, 'S&T Institutional Events & Public Engagement', 1, 'unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (21, 'RMU', 1, 'unit', 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (22, 'CASHIER', 1, 'unit', 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (23, 'PROCUREMENT', 1, 'unit', 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.offices (office_id, office_name, office_type_id, office_category, division_id, parent_office_id) VALUES (24, 'HR', 1, 'unit', 2, 1) ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('public.offices', 'office_id'), (SELECT MAX(office_id) FROM public.offices));


--
-- TOC entry 5017 (class 0 OID 16699)
-- Dependencies: 229
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.questions VALUES (1, 1, E'Which of the following best describes your awareness of a Citizen''s Charter?') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (2, 1, E'Would you say the CC of this office was…?') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (3, 1, E'How much did the CC help you in your transaction?') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (4, 1, E'I am satisfied with the service that I availed.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (5, 1, E'I spent a reasonable amount of time for my transaction.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (6, 1, E'The office followed the transaction''s requirements and steps based on the information provided.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (7, 1, E'The steps (including payment) I needed to follow for my transaction were easy and simple.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (8, 1, E'I easily found information about my transaction from the office or its website.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (9, 1, E'I paid a reasonable amount of fees for my transaction.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (10, 1, E'I feel the office was fair to everyone, or "walang palakasan" during my transaction.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (11, 1, E'I was treated courteously by the staff, and (if asked for help) the staff was helpful.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (12, 1, E'I got what I needed from the government office, or (if denied) the denial of request was sufficiently explained to me.') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (13, 2, E'Appropriateness of the Service/Activity') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (14, 2, E'How beneficial is the Service/Activity') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (15, 2, E'Timeliness of Delivery') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (16, 2, E'Attitude of Staff') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (17, 2, E'Gender Fair Treatment') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (18, 2, E'Over-all Satisfaction') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (19, 2, E'Appropriateness of the Service/Activity') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (21, 2, E'Timeliness of Delivery') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (22, 2, E'Attitude of Staff') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (23, 2, E'Gender Fair Treatment') ON CONFLICT DO NOTHING;
INSERT INTO public.questions VALUES (24, 2, E'How beneficial is the Service/Activity') ON CONFLICT DO NOTHING;

ALTER TABLE public.questions
    ADD COLUMN question_type character varying(20) DEFAULT 'text';

ALTER TABLE public.questions
    ADD COLUMN question_order integer DEFAULT 1;

ALTER TABLE public.questions
    ADD CONSTRAINT chk_question_type CHECK (((question_type)::text = ANY ((ARRAY['rating'::character varying, 'checkmark'::character varying, 'text'::character varying, 'radio'::character varying, 'textarea'::character varying])::text[])));

UPDATE public.questions SET question_type = 'checkmark', question_order = question_id WHERE question_id IN (1, 2, 3, 13, 14, 15, 16, 17);
UPDATE public.questions SET question_type = 'rating', question_order = question_id WHERE question_id IN (4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 19, 21, 22, 23, 24);



-- TOC entry 5008 (class 0 OID 16645)
-- Dependencies: 218
-- Data for Name: responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- No initial responses data


--
-- TOC entry 5021 (class 0 OID 16720)
-- Dependencies: 233
-- Data for Name: service_client_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.service_client_type VALUES
(1, 2), (1, 3), (1, 4),
(2, 2), (2, 3), (2, 4),
(3, 2), (3, 3), (3, 4),
(4, 2), (4, 3), (4, 4),
(5, 2), (5, 3), (5, 4),
(6, 2), (6, 3), (6, 4),
(7, 2), (7, 3), (7, 4),
(8, 2), (8, 3), (8, 4),
(9, 2), (9, 3), (9, 4),
(10, 2), (10, 3), (10, 4),
(11, 2), (11, 3), (11, 4),
(12, 2), (12, 3), (12, 4),
(13, 2), (13, 3), (13, 4),
(14, 2), (14, 3), (14, 4),
(15, 2), (15, 3), (15, 4),
(16, 2), (16, 3), (16, 4),
(17, 2), (17, 3), (17, 4),
(18, 2), (18, 3), (18, 4),
(19, 2), (19, 3), (19, 4),
(20, 2), (20, 3), (20, 4),
(21, 2), (21, 3), (21, 4),
(22, 2), (22, 3), (22, 4),
(23, 2), (23, 3), (23, 4),
(24, 2), (24, 3), (24, 4),
(25, 2), (25, 3), (25, 4),
(26, 2), (26, 3), (26, 4),
(27, 2), (27, 3), (27, 4),
(28, 2), (28, 3), (28, 4),
(29, 2), (29, 3), (29, 4),
(30, 2), (30, 3), (30, 4),
(31, 2), (31, 3), (31, 4),
(32, 2), (32, 3), (32, 4),
(33, 2), (33, 3), (33, 4),
(34, 2), (34, 3), (34, 4),
(35, 2), (35, 3), (35, 4),
(36, 2), (36, 3), (36, 4),
(37, 2), (37, 3), (37, 4),
(38, 2), (38, 3), (38, 4),
(39, 2), (39, 3), (39, 4),
(40, 2), (40, 3), (40, 4),
(41, 2), (41, 3), (41, 4),
(42, 2), (42, 3), (42, 4)
ON CONFLICT DO NOTHING;


--
-- TOC entry 5018 (class 0 OID 16704)
-- Dependencies: 230
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.services (service_id, service_name, service_type_id, description, office_id) OVERRIDING SYSTEM VALUE VALUES
(1, 'Provision of Technological Innovation Funding', 1, 'Small Enterprise Technology Upgrading Program', 8),
(2, 'Technology Training', 1, 'Small Enterprise Technology Upgrading Program', 8),
(3, 'Technical Consultancy', 1, 'Small Enterprise Technology Upgrading Program', 8),
(4, 'Formulation and Implementation of Smart Community Strategic Roadmaps for LGUs', 1, 'Smart and Sustainable Communities Program', 9),
(5, 'Technology Training', 1, 'Smart and Sustainable Communities Program', 9),
(6, 'Technical Consultancy', 1, 'Smart and Sustainable Communities Program', 9),
(7, 'Implementation of Community-Based S&T Interventions', 1, 'Community Empowerment through Science and Technology', 10),
(8, 'Technology Training', 1, 'Community Empowerment through Science and Technology', 10),
(9, 'Technical Consultancy', 1, 'Community Empowerment through Science and Technology', 10),
(10, 'Funding and Management of S&T Research and Development Projects', 1, 'Grants-In-Aid', 11),
(11, 'Provision of Innovation Financing and Support for Repatriated OFWs', 1, 'Innovations for Filipinos Working Distantly from the Philippines', 12),
(12, 'Technology Training', 1, 'Innovations for Filipinos Working Distantly from the Philippines', 12),
(13, 'Technical Consultancy', 1, 'Innovations for Filipinos Working Distantly from the Philippines', 12),
(14, 'Provision of Enterprise Growth and Technology Commercialization Support', 1, 'Technology Transfer and Entrepreneurship Collaboration and Harmonization of Growing Regional Opportunities on Wealth Creation', 13),
(15, 'Technology Training', 1, 'Technology Transfer and Entrepreneurship Collaboration and Harmonization of Growing Regional Opportunities on Wealth Creation', 13),
(16, 'Technical Consultancy', 1, 'Technology Transfer and Entrepreneurship Collaboration and Harmonization of Growing Regional Opportunities on Wealth Creation', 13),
(17, 'Identification, Validation, and Scaling of Grassroots Innovations', 1, 'Grassroots Innovation for Inclusive Development', 14),
(18, 'Technology Training', 1, 'Grassroots Innovation for Inclusive Development', 14),
(19, 'Technical Consultancy', 1, 'Grassroots Innovation for Inclusive Development', 14),
(20, 'Provision of Incubation Space, Mentorship, and Facility Access', 1, 'Innovation Hub', 15),
(21, 'Technology Training', 1, 'Innovation Hub', 15),
(22, 'Technical Consultancy', 1, 'Innovation Hub', 15),
(23, 'Provision of Food Safety Audits and Compliance Advisory', 1, 'Bicol Food Safety Team', 16),
(24, 'Technology Training', 1, 'Bicol Food Safety Team', 16),
(25, 'Technical Consultancy', 1, 'Bicol Food Safety Team', 16),
(26, 'Administration of Health Research Grants and Capacity Building', 1, 'Bicol Consortium for Health R&D', 17),
(27, 'Technology Training', 1, 'Bicol Consortium for Health R&D', 17),
(28, 'Technical Consultancy', 1, 'Bicol Consortium for Health R&D', 17),
(29, 'Provision of Calibration and Metrology Services', 1, 'Regional Standards & Testing Lab', 18),
(30, 'Technology Training', 1, 'Regional Standards & Testing Lab', 18),
(31, 'Technical Consultancy', 1, 'Regional Standards & Testing Lab', 18),
(32, 'Provision of Microbiological Testing and Analysis', 1, 'Regional Standards & Testing Lab', 18),
(33, 'Provision of Chemical Testing and Analytical Services', 1, 'Regional Standards & Testing Lab', 18),
(34, 'Administration of S&T Undergraduate and Graduate Scholarships', 1, NULL, 19),
(35, 'S&T Scholar Capability Building and Welfare Monitoring', 1, NULL, 19),
(36, 'Execution of Regional S&T Institutional Events, Expositions, and Other Public Engagements', 1, NULL, 20),
(37, 'Issuance of Certified True Copies of Agency Records to Public Claimants', 1, 'Records Management Unit', 21),
(38, 'Receiving and Routing of Inbound Official Communications from Outside Organizations', 1, 'Records Management Unit', 21),
(39, 'Collection of Fees and Issuance of Official Receipts', 1, NULL, 22),
(40, 'Management of Public Bidding Activities and Supplier Evaluation', 1, NULL, 23),
(41, 'Processing of Supplier Contracts and Quotations', 1, NULL, 23),
(42, 'Administration of Recruitment, Selection, and Placement (RSP)', 1, 'Human Resources', 24)
ON CONFLICT DO NOTHING;

--
-- TOC entry 5024 (class 0 OID 16725)
-- Dependencies: 236
-- Data for Name: services_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.services_types VALUES (1, 'on-site') ON CONFLICT DO NOTHING;
INSERT INTO public.services_types VALUES (2, 'off-site') ON CONFLICT DO NOTHING;


--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 238
-- Name: admins_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_admin_id_seq', 9, true);


--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 222
-- Name: customer_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_customer_id_seq', 1, false);


--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 232
-- Name: responses_response_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.responses_response_id_seq', 1, false);


--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 234
-- Name: services_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_service_id_seq', 42, true);


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 235
-- Name: services_service_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_service_id_seq1', 42, true);


--
-- TOC entry 4813 (class 2606 OID 16731)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 4818 (class 2606 OID 16733)
-- Name: client customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT customer_pkey PRIMARY KEY (client_id);


--
-- TOC entry 4820 (class 2606 OID 16735)
-- Name: client_type customer_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_type
    ADD CONSTRAINT customer_type_pkey PRIMARY KEY (client_type_id);


--
-- TOC entry 4822 (class 2606 OID 16737)
-- Name: division division_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.division
    ADD CONSTRAINT division_pkey PRIMARY KEY (division_id);


--
-- TOC entry 4824 (class 2606 OID 16741)
-- Name: form_status form_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_status
    ADD CONSTRAINT form_status_pkey PRIMARY KEY (status_id);


--
-- TOC entry 4826 (class 2606 OID 16743)
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (form_id);


--
-- TOC entry 4828 (class 2606 OID 16745)
-- Name: office_type office_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.office_type
    ADD CONSTRAINT office_type_pkey PRIMARY KEY (office_type_id);


--
-- TOC entry 4830 (class 2606 OID 16747)
-- Name: offices offices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offices
    ADD CONSTRAINT offices_pkey PRIMARY KEY (office_id);

ALTER TABLE public.offices ADD CONSTRAINT chk_office_category CHECK (office_category IN ('main', 'branch', 'unit'));


--
-- TOC entry 4832 (class 2606 OID 16749)
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- TOC entry 4816 (class 2606 OID 16751)
-- Name: responses responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_pkey PRIMARY KEY (response_id);


--
-- TOC entry 4838 (class 2606 OID 16753)
-- Name: service_client_type service_customer_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_client_type
    ADD CONSTRAINT service_customer_type_pkey PRIMARY KEY (service_id, client_type_id);


--
-- TOC entry 4834 (class 2606 OID 16755)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- TOC entry 237 (class 1259 OID 16731)
-- Name: service_office_service_office_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_office_service_office_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_office_service_office_id_seq OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16910)
-- Name: service_office; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_office (
    service_office_id integer DEFAULT nextval('public.service_office_service_office_id_seq'::regclass) NOT NULL,
    service_id integer NOT NULL,
    office_id integer NOT NULL,
    is_process_owner boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT service_office_pkey PRIMARY KEY (service_office_id),
    CONSTRAINT service_office_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id) ON DELETE CASCADE,
    CONSTRAINT service_office_office_id_fkey FOREIGN KEY (office_id) REFERENCES public.offices(office_id) ON DELETE CASCADE,
    CONSTRAINT service_office_unique_service_office UNIQUE (service_id, office_id)
);


ALTER TABLE public.service_office OWNER TO postgres;

-- Partial unique index: exactly one process owner per service
--
CREATE UNIQUE INDEX idx_service_owner ON public.service_office (service_id) WHERE is_process_owner = true;


--
-- TOC entry 239 (class 1259 OID 16915)
-- Name: service_form; Type: TABLE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_form_service_form_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_form_service_form_id_seq OWNER TO postgres;

CREATE TABLE public.service_form (
    service_form_id integer DEFAULT nextval('public.service_form_service_form_id_seq'::regclass) NOT NULL,
    service_id integer NOT NULL,
    form_id integer NOT NULL,
    form_order integer NOT NULL DEFAULT 1,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT service_form_pkey PRIMARY KEY (service_form_id),
    CONSTRAINT service_form_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id) ON DELETE CASCADE,
    CONSTRAINT service_form_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(form_id) ON DELETE CASCADE,
    CONSTRAINT service_form_unique_service_form UNIQUE (service_id, form_id)
);


ALTER TABLE public.service_form OWNER TO postgres;


--
-- TOC entry 5026 (class 0 OID 16910)
-- Dependencies: 238
-- Data for Name: service_office; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Migrate existing services to service_office table (each service links to current office_id as process owner)
INSERT INTO public.service_office (service_office_id, service_id, office_id, is_process_owner) VALUES 
(1, 1, 8, true),
(2, 2, 8, true),
(3, 3, 8, true),
(4, 4, 9, true),
(5, 5, 9, true),
(6, 6, 9, true),
(7, 7, 10, true),
(8, 8, 10, true),
(9, 9, 10, true),
(10, 10, 11, true),
(11, 11, 12, true),
(12, 12, 12, true),
(13, 13, 12, true),
(14, 14, 13, true),
(15, 15, 13, true),
(16, 16, 13, true),
(17, 17, 14, true),
(18, 18, 14, true),
(19, 19, 14, true),
(20, 20, 15, true),
(21, 21, 15, true),
(22, 22, 15, true),
(23, 23, 16, true),
(24, 24, 16, true),
(25, 25, 16, true),
(26, 26, 17, true),
(27, 27, 17, true),
(28, 28, 17, true),
(29, 29, 18, true),
(30, 30, 18, true),
(31, 31, 18, true),
(32, 32, 18, true),
(33, 33, 18, true),
(34, 34, 19, true),
(35, 35, 19, true),
(36, 36, 20, true),
(37, 37, 21, true),
(38, 38, 21, true),
(39, 39, 22, true),
(40, 40, 23, true),
(41, 41, 23, true),
(42, 42, 24, true)
 ON CONFLICT DO NOTHING;

--
-- TOC entry 5027 (class 0 OID 0)
-- Data for Name: service_form; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Link form_id=1 (CSM-ARTA) to all services that were previously using it (services with citizen client type)
INSERT INTO public.service_form (service_form_id, service_id, form_id, form_order, created_by, created_at) VALUES 
(1, 1, 1, 1, 1, NOW()),
(2, 2, 1, 1, 1, NOW()),
(3, 3, 1, 1, 1, NOW()),
(4, 4, 1, 1, 1, NOW()),
(5, 5, 1, 1, 1, NOW()),
(6, 6, 1, 1, 1, NOW()),
(7, 7, 1, 1, 1, NOW()),
(8, 8, 1, 1, 1, NOW()),
(9, 9, 1, 1, 1, NOW()),
(10, 10, 1, 1, 1, NOW()),
(11, 11, 1, 1, 1, NOW()),
(12, 12, 1, 1, 1, NOW()),
(13, 13, 1, 1, 1, NOW()),
(14, 14, 1, 1, 1, NOW()),
(15, 15, 1, 1, 1, NOW()),
(16, 16, 1, 1, 1, NOW()),
(17, 17, 1, 1, 1, NOW()),
(18, 18, 1, 1, 1, NOW()),
(19, 19, 1, 1, 1, NOW()),
(20, 20, 1, 1, 1, NOW()),
(21, 21, 1, 1, 1, NOW()),
(22, 22, 1, 1, 1, NOW()),
(23, 23, 1, 1, 1, NOW()),
(24, 24, 1, 1, 1, NOW()),
(25, 25, 1, 1, 1, NOW()),
(26, 26, 1, 1, 1, NOW()),
(27, 27, 1, 1, 1, NOW()),
(28, 28, 1, 1, 1, NOW()),
(29, 29, 1, 1, 1, NOW()),
(30, 30, 1, 1, 1, NOW()),
(31, 31, 1, 1, 1, NOW()),
(32, 32, 1, 1, 1, NOW()),
(33, 33, 1, 1, 1, NOW()),
(34, 34, 1, 1, 1, NOW()),
(35, 35, 1, 1, 1, NOW()),
(36, 36, 1, 1, 1, NOW()),
(37, 37, 1, 1, 1, NOW()),
(38, 38, 1, 1, 1, NOW()),
(39, 39, 1, 1, 1, NOW()),
(40, 40, 1, 1, 1, NOW()),
(41, 41, 1, 1, 1, NOW()),
(42, 42, 1, 1, 1, NOW())
 ON CONFLICT DO NOTHING;


--
-- TOC entry 4840 (class 2606 OID 16757)
-- Name: services_types services_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services_types
    ADD CONSTRAINT services_types_pkey PRIMARY KEY (service_type_id);


--
-- TOC entry 4814 (class 1259 OID 16760)
-- Name: fki_fk_responses_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_responses_customer ON public.responses USING btree (client_id);


--
-- TOC entry 4841 (class 2606 OID 16761)
-- Name: admins fk_admin_division; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admin_division FOREIGN KEY (division_id) REFERENCES public.division(division_id);


--
-- TOC entry 4842 (class 2606 OID 16766)
-- Name: admins fk_admin_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admin_office FOREIGN KEY (office_id) REFERENCES public.offices(office_id);


--
-- TOC entry 4846 (class 2606 OID 16776)
-- Name: client fk_customer_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT fk_customer_type FOREIGN KEY (client_type_id) REFERENCES public.client_type(client_type_id);


--
-- TOC entry 4847 (class 2606 OID 16781)
-- Name: division fk_division_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.division
    ADD CONSTRAINT fk_division_office FOREIGN KEY (office_id) REFERENCES public.offices(office_id);


--
-- TOC entry 4848 (class 2606 OID 16786)
-- Name: forms fk_forms_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT fk_forms_admin FOREIGN KEY (added_by) REFERENCES public.admins(admin_id);


--
-- TOC entry 4849 (class 2606 OID 16791)
-- Name: forms fk_forms_status; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT fk_forms_status FOREIGN KEY (status_id) REFERENCES public.form_status(status_id);


--
-- TOC entry 4850 (class 2606 OID 16796)
-- Name: offices fk_offices_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offices
    ADD CONSTRAINT fk_offices_type FOREIGN KEY (office_type_id) REFERENCES public.office_type(office_type_id);


--
-- TOC entry 4851 (class 2606 OID 16801)
-- Name: questions fk_questions_form; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_questions_form FOREIGN KEY (form_id) REFERENCES public.forms(form_id);


--
-- TOC entry 4843 (class 2606 OID 16806)
-- Name: responses fk_responses_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT fk_responses_customer FOREIGN KEY (client_id) REFERENCES public.client(client_id);


--
-- TOC entry 4844 (class 2606 OID 16811)
-- Name: responses fk_responses_form; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT fk_responses_form FOREIGN KEY (form_id) REFERENCES public.forms(form_id);


--
-- TOC entry 4845 (class 2606 OID 16816)
-- Name: responses fk_responses_service; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT fk_responses_service FOREIGN KEY (service_id) REFERENCES public.services(service_id);


--
-- TOC entry 4852 (class 2606 OID 16821)
-- Name: services fk_services_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_services_office FOREIGN KEY (office_id) REFERENCES public.offices(office_id);


--
-- TOC entry 4853 (class 2606 OID 16826)
-- Name: services fk_services_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_services_type FOREIGN KEY (service_type_id) REFERENCES public.services_types(service_type_id);


--
-- TOC entry 4854b (class 2606 OID 16828)
-- Name: offices fk_offices_division; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offices
    ADD CONSTRAINT fk_offices_division FOREIGN KEY (division_id) REFERENCES public.division(division_id);


--
-- TOC entry 4854c (class 2606 OID 16829)
-- Name: offices fk_offices_parent_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offices
    ADD CONSTRAINT fk_offices_parent_office FOREIGN KEY (parent_office_id) REFERENCES public.offices(office_id);


--
-- TOC entry 4857 (class 2606 OID 16846)
-- Name: service_client_type service_customer_type_cust_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_client_type
    ADD CONSTRAINT service_customer_type_cust_type_id_fkey FOREIGN KEY (client_type_id) REFERENCES public.client_type(client_type_id) ON DELETE CASCADE;


--
-- TOC entry 4858 (class 2606 OID 16851)
-- Name: service_client_type service_customer_type_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_client_type
    ADD CONSTRAINT service_customer_type_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id) ON DELETE CASCADE;

--
-- Set sequence for service_office table
--
SELECT pg_catalog.setval('public.service_office_service_office_id_seq', 42, true);

-- Set sequence for service_form table
SELECT pg_catalog.setval('public.service_form_service_form_id_seq', 42, true);

-- Completed on 2025-06-04 13:43:34

--
-- PostgreSQL database dump complete
--

