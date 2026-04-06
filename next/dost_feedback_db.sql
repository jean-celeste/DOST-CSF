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

CREATE DATABASE dost_feedback_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Philippines.1252';


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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16640)
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    admin_id integer DEFAULT nextval('public.admins_admin_id_seq'::regclass) NOT NULL,
    username character varying,
    password character varying,
    role character varying,
    division_id integer,
    office_id integer,
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
    description text
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
    office_id integer NOT NULL,
    office_name character varying,
    office_type_id integer,
    location character varying
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
    unit_id integer,
    office_id integer NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16709)
-- Name: unit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unit (
    unit_id integer NOT NULL,
    unit_name character varying,
    office_id integer,
    division_id integer
);


ALTER TABLE public.unit OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16902)
-- Name: response_details_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.response_details_view AS
 SELECT r.response_id,
    r.submitted_at,
    r.answers,
    s.service_id,
    s.service_name,
    o.office_name,
    u.unit_name,
    c.client_id,
    c.name AS client_name,
    c.email AS client_email,
    c.phone AS client_phone,
    ct.client_type_name,
    f.form_id,
    f.form_title AS form_name,
        CASE
            WHEN (f.form_id = 1) THEN 'csm'::text
            WHEN (f.form_id = 2) THEN 'qms'::text
            ELSE 'unknown'::text
        END AS form_type
   FROM ((((((public.responses r
     JOIN public.services s ON ((r.service_id = s.service_id)))
     LEFT JOIN public.offices o ON ((s.office_id = o.office_id)))
     LEFT JOIN public.unit u ON ((s.unit_id = u.unit_id)))
     JOIN public.client c ON ((r.client_id = c.client_id)))
     LEFT JOIN public.client_type ct ON ((c.client_type_id = ct.client_type_id)))
     JOIN public.forms f ON ((r.form_id = f.form_id)));


ALTER VIEW public.response_details_view OWNER TO postgres;

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
INSERT INTO public.admins VALUES (4, 'albay_psto_admin', '$2b$10$.vsVNSstjMV0Y08kvNj7tuYD2TrTvAuFaLQQSgg5hUUMIFKjwC93m', 'PSTO Administrator', NULL, 2, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (5, 'camarines_norte_psto_admin', '$2b$10$ca5JNHQGcorQsjKICQhMXeS.T./5UtHz2xtoAZpn/g.d6eZdhD2/K', 'PSTO Administrator', NULL, 3, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (6, 'camarines_sur_psto_admin', '$2b$10$kLACi1dQnYKe0Lg2Ltc1ROUBLwr1Fh6ltxyOAvxacwnMK40OlCVZy', 'PSTO Administrator', NULL, 4, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (7, 'catanduanes_psto_admin', '$2b$10$o9zXRHhfA1hQTEq2CVO9aeIPAdhUxBzGxLS/8XdepnqVCtDPFZBM.', 'PSTO Administrator', NULL, 5, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (8, 'masbate_psto_admin', '$2b$10$BqwSpKOxmBbYyV7KH.Iuh.ExsLF4KlcOW0NDmv2CIeoFwhRwXf.n6', 'PSTO Administrator', NULL, 6, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
INSERT INTO public.admins VALUES (9, 'sorsogon_psto_admin', '$2b$10$y1ABE8sftSZvEasgn5SKNetIMVhFrZG0NozlWKihTIRyOkDBjXtr.', 'PSTO Administrator', NULL, 7, '2025-03-25 10:52:18.304666') ON CONFLICT DO NOTHING;
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
INSERT INTO public.forms VALUES (2, '                            -F4: Customer Satisfaction Feedback (Eng)', 1, '2025-04-10 10:50:54.877214', '2025-04-10 10:50:54.877214', 1, 'Technical services specific customer satisfaction feedback form') ON CONFLICT DO NOTHING;


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

INSERT INTO public.offices VALUES (1, 'DOST Regional Office', 1, 'Rawis, Legazpi City') ON CONFLICT DO NOTHING;
INSERT INTO public.offices VALUES (2, 'Albay PSTO', 2, 'Camalig, Albay') ON CONFLICT DO NOTHING;
INSERT INTO public.offices VALUES (3, 'Camarines Norte PSTO', 2, 'Daet, Camarines Norte') ON CONFLICT DO NOTHING;
INSERT INTO public.offices VALUES (4, 'Camarines Sur PSTO', 2, 'J. Miranda Ave., Naga City') ON CONFLICT DO NOTHING;
INSERT INTO public.offices VALUES (5, 'Catanduanes PSTO', 2, 'Virac, Catanduanes') ON CONFLICT DO NOTHING;
INSERT INTO public.offices VALUES (6, 'Masbate PSTO', 2, 'Masbate City, Masbate') ON CONFLICT DO NOTHING;
INSERT INTO public.offices VALUES (7, 'Sorsogon PSTO', 2, 'Sorsogon State University Compound, Sorsogon') ON CONFLICT DO NOTHING;


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


--
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

INSERT INTO public.service_client_type VALUES (1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (10, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (12, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (14, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (19, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (21, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (22, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (24, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (26, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (28, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (29, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (30, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (31, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (3, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (4, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (5, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (6, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (7, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (9, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (11, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (13, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (15, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (16, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (17, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (18, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (20, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (23, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (25, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (27, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (3, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (4, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (5, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (6, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (7, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (9, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (11, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (13, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (15, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (16, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.service_client_type VALUES (17, 4) ON CONFLICT DO NOTHING;
-- Removed service_client_type entries for service_id 37


--
-- TOC entry 5018 (class 0 OID 16704)
-- Dependencies: 230
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (3, 'Microbiological Testing Analysis', 1, 'Testing of food and water samples for microbial content, including bacteria, yeast, and molds, to assess safety and quality.', 9, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (4, 'Metrology – Calibration Services', 1, 'Calibration of measuring instruments to ensure accuracy and compliance with national and international standards, supporting various industries in maintaining quality control.', 9, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (5, 'Request for Clearance/Certification', 1, 'Application for official documents certifying compliance with specific requirements or standards, often necessary for employment, education, or other official purposes.', 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (6, 'Scholarship Application', 1, 'Submission of applications for DOST scholarship programs aimed at supporting students pursuing degrees in science, technology, engineering, and mathematics (STEM) fields.', 8, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (7, 'Science Journo Ako (STII)', 1, 'A program designed to train and encourage individuals to engage in science journalism, promoting accurate and engaging reporting on scientific topics.', 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (8, 'S&T Promo and Information Services Request', 1, 'Request for promotional materials and information services related to science and technology, aimed at increasing public awareness and understanding of S&T initiatives.', 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (9, 'STARBOOKS', 1, 'A standalone digital library developed by DOST-STII, providing access to a wealth of science and technology resources, including books, journals, and multimedia materials, even without internet connectivity.', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (10, 'ICT Request', 1, 'Submission of requests for information and communications technology (ICT) support, including hardware, software, and technical assistance.', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (11, 'Project Monitoring', 1, 'Ongoing tracking and evaluation of projects to ensure they are progressing as planned and achieving their intended outcomes.', 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (12, 'IRTEC – Evaluation of Project Proposal', 1, 'Assessment of project proposals submitted for funding or support under the Industry-Based R&D Technology Transfer and Commercialization (IRTEC) program.', 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (13, 'Conduct of Training', 1, 'Organization and delivery of training programs aimed at enhancing skills and knowledge in various scientific and technical fields.', 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (29, 'Request for Supplies', 1, 'Submission of requests for office or laboratory supplies necessary for daily operations.', 13, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (22, 'Processing and recording of obligations', 1, 'Manage and record budgetary obligations and commitments.', 14, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (1, 'Documented Information Request', 1, 'A formal request for access to government-held information under the Freedom of Information (FOI) policy. This allows individuals to obtain records or documents maintained by government agencies, subject to certain exceptions.', 6, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (14, 'Training – Evaluation of Training Activity Proposal', 1, 'Review and assessment of proposed training activities to ensure they meet established standards and objectives.', 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (15, 'Consultancy Services', 1, 'Provision of expert advice and technical assistance to organizations and individuals in areas related to science, technology, and innovation.', 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (16, 'iFWD', 1, 'The Innovations for Filipinos Working Distantly from the Philippines (iFWD PH) program aims to assist returning Overseas Filipino Workers (OFWs) in establishing technology-based enterprises through capacity building and financial support.', 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (17, 'SETUP – Approval and Release of Funds', 1, 'The Small Enterprise Technology Upgrading Program (SETUP) provides financial assistance to micro, small, and medium enterprises (MSMEs) for technology adoption and innovation, enhancing productivity and competitiveness.', 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (18, 'Internship and Immersion', 1, 'Programs offering students practical experience in scientific and technological environments, bridging academic learning with real-world application.', 10, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (19, 'Request for Personnel Records', 1, 'Application to access personal employment records, such as service history, performance evaluations, and other HR-related documents.', 10, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (20, 'RSP', 1, 'The Recruitment and Selection Process (RSP) involves the procedures for hiring and appointing personnel within the organization, ensuring transparency and merit-based selection.', 10, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (21, 'Purchasing', 1, 'Procurement of goods and services necessary for the operations of the organization, following established guidelines and procedures.', 11, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (24, 'Processing of Payment (Reimbursements/Claims)', 1, 'Handling of payment processes for reimbursements and claims submitted by employees or external parties, ensuring timely and accurate disbursement.', 12, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (25, 'Disbursement of Payment', 1, 'Release of funds for approved expenditures, including salaries, operational costs, and other financial obligations.', 16, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (26, 'Request for Petty Cash', 1, 'Application for small amounts of cash to cover minor or incidental expenses, subject to organizational policies.', 16, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (27, 'Receiving of Incoming Documents/Communication', 1, 'Management and logging of incoming correspondence and documents, ensuring they are directed to the appropriate departments or individuals.', 17, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (28, 'Receiving and Releasing of Documents/Communication', 1, 'Handling of both incoming and outgoing documents and communications, maintaining records and ensuring timely delivery.', 17, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (31, 'Request for Vehicle', 2, 'Request for the use of organizational vehicles for official purposes, subject to availability and approval.', 15, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (2, 'Chemical Testing Analysis', 1, 'Laboratory analysis of chemical properties of various materials, including food, water, and industrial products, to ensure compliance with safety and quality standards.', 9, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (30, 'Request for Maintenance', 2, 'Application for maintenance services for equipment, facilities, or other organizational assets to ensure their proper functioning.', 15, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (23, 'Billing and Collection', 2, 'Preparation and issuance of billing statements, as well as the collection of payments for services rendered or goods provided.', 12, 1) ON CONFLICT DO NOTHING;
-- Removed test services (IDs: 36, 37, 38)


--
-- TOC entry 5024 (class 0 OID 16725)
-- Dependencies: 236
-- Data for Name: services_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.services_types VALUES (1, 'on-site') ON CONFLICT DO NOTHING;
INSERT INTO public.services_types VALUES (2, 'off-site') ON CONFLICT DO NOTHING;


--
-- TOC entry 5019 (class 0 OID 16709)
-- Dependencies: 231
-- Data for Name: unit; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.unit VALUES (1, 'MIS', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (2, 'S&T Promo', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (3, 'RPMO (SETUP, LGIA)', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (4, 'CEST / GRIND', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (5, 'Monitoring and Evaluation', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (6, 'GAD / QMS / DRRM / Compliances', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (7, 'Smart and Sustainable Communities', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (8, 'S&T Scholarship Unit', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (9, 'RSTL', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (10, 'Human Resources Management', 1, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (11, 'Procurement Unit', 1, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (12, 'Accounting Unit', 1, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (13, 'Supply and Property Unit', 1, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (14, 'Budget Unit', 1, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (15, 'General Support Services', 1, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (16, 'Cashier Unit', 1, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.unit VALUES (17, 'Records Management Unit', 1, 2) ON CONFLICT DO NOTHING;


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

SELECT pg_catalog.setval('public.services_service_id_seq', 23, true);


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 235
-- Name: services_service_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_service_id_seq1', 31, true);


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
-- TOC entry 4840 (class 2606 OID 16757)
-- Name: services_types services_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services_types
    ADD CONSTRAINT services_types_pkey PRIMARY KEY (service_type_id);


--
-- TOC entry 4836 (class 2606 OID 16759)
-- Name: unit unit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit
    ADD CONSTRAINT unit_pkey PRIMARY KEY (unit_id);


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
-- TOC entry 4854 (class 2606 OID 16831)
-- Name: services fk_services_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_services_unit FOREIGN KEY (unit_id) REFERENCES public.unit(unit_id);


--
-- TOC entry 4855 (class 2606 OID 16836)
-- Name: unit fk_unit_division; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit
    ADD CONSTRAINT fk_unit_division FOREIGN KEY (division_id) REFERENCES public.division(division_id);


--
-- TOC entry 4856 (class 2606 OID 16841)
-- Name: unit fk_unit_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit
    ADD CONSTRAINT fk_unit_office FOREIGN KEY (office_id) REFERENCES public.offices(office_id);


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


-- Completed on 2025-06-04 13:43:34

--
-- PostgreSQL database dump complete
--

