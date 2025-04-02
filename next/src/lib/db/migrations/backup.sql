--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    admin_id integer NOT NULL,
    username character varying,
    password character varying,
    role character varying,
    division_id integer,
    office_id integer,
    created_at timestamp without time zone
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: age_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.age_group (
    age_group_id integer NOT NULL,
    age_group_range character varying
);


ALTER TABLE public.age_group OWNER TO postgres;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    customer_id integer NOT NULL,
    email character varying,
    phone character varying,
    sex character varying,
    customer_type_id integer,
    external_type_id integer,
    age_group_id integer
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- Name: customer_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_type (
    cust_type_id integer NOT NULL,
    cust_type_name character varying NOT NULL
);


ALTER TABLE public.customer_type OWNER TO postgres;

--
-- Name: division; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.division (
    division_id integer NOT NULL,
    division_name character varying(255),
    office_id integer
);


ALTER TABLE public.division OWNER TO postgres;

--
-- Name: external_customer_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_customer_type (
    external_type_id integer NOT NULL,
    external_type_name character varying NOT NULL
);


ALTER TABLE public.external_customer_type OWNER TO postgres;

--
-- Name: form_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_status (
    status_id integer NOT NULL,
    status_name character varying
);


ALTER TABLE public.form_status OWNER TO postgres;

--
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
-- Name: office_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.office_type (
    office_type_id integer NOT NULL,
    type_name character varying
);


ALTER TABLE public.office_type OWNER TO postgres;

--
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
-- Name: options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.options (
    option_id integer NOT NULL,
    question_id integer,
    option_text text
);


ALTER TABLE public.options OWNER TO postgres;

--
-- Name: question_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_types (
    question_type_id integer NOT NULL,
    question_type_name character varying,
    description text
);


ALTER TABLE public.question_types OWNER TO postgres;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    form_id integer,
    question_text text,
    question_type_id integer
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: response_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.response_details (
    response_details_id integer NOT NULL,
    response_id integer,
    question_id integer,
    answer_text text,
    option_id integer
);


ALTER TABLE public.response_details OWNER TO postgres;

--
-- Name: responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.responses (
    response_id integer NOT NULL,
    form_id integer,
    service_id integer,
    submitted_at timestamp without time zone,
    customer_id integer
);


ALTER TABLE public.responses OWNER TO postgres;

--
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
-- Name: services_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services_types (
    service_type_id integer NOT NULL,
    status_name character varying
);


ALTER TABLE public.services_types OWNER TO postgres;

--
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
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (admin_id, username, password, role, division_id, office_id, created_at) FROM stdin;
\.


--
-- Data for Name: age_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.age_group (age_group_id, age_group_range) FROM stdin;
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (customer_id, email, phone, sex, customer_type_id, external_type_id, age_group_id) FROM stdin;
\.


--
-- Data for Name: customer_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_type (cust_type_id, cust_type_name) FROM stdin;
\.


--
-- Data for Name: division; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.division (division_id, division_name, office_id) FROM stdin;
1	Technical Operations Division	1
2	Finance Administrative and Support Services Division	1
\.


--
-- Data for Name: external_customer_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_customer_type (external_type_id, external_type_name) FROM stdin;
\.


--
-- Data for Name: form_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_status (status_id, status_name) FROM stdin;
1	active
2	draft
3	archived
\.


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forms (form_id, form_title, added_by, added_at, updated_at, status_id, description) FROM stdin;
\.


--
-- Data for Name: office_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.office_type (office_type_id, type_name) FROM stdin;
2	Provincial Science and Technology Office
1	Regional Office
\.


--
-- Data for Name: offices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offices (office_id, office_name, office_type_id, location) FROM stdin;
1	DOST Regional Office	1	Rawis, Legazpi City
2	Albay PSTO	2	Camalig, Albay
3	Camarines Norte PSTO	2	Daet, Camarines Norte
4	Camarines Sur PSTO	2	J. Miranda Ave., Naga City
5	Catanduanes PSTO	2	Virac, Catanduanes
6	Masbate PSTO	2	Masbate City, Masbate
7	Sorsogon PSTO	2	Sorsogon State University Compound, Sorsogon
\.


--
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.options (option_id, question_id, option_text) FROM stdin;
\.


--
-- Data for Name: question_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_types (question_type_id, question_type_name, description) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (question_id, form_id, question_text, question_type_id) FROM stdin;
\.


--
-- Data for Name: response_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.response_details (response_details_id, response_id, question_id, answer_text, option_id) FROM stdin;
\.


--
-- Data for Name: responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.responses (response_id, form_id, service_id, submitted_at, customer_id) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (service_id, service_name, service_type_id, description, unit_id, office_id) FROM stdin;
\.


--
-- Data for Name: services_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services_types (service_type_id, status_name) FROM stdin;
\.


--
-- Data for Name: unit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unit (unit_id, unit_name, office_id, division_id) FROM stdin;
1	MIS	1	1
2	S&T Promo	1	1
3	RPMO (SETUP, LGIA)	1	1
4	CEST / GRIND	1	1
5	Monitoring and Evaluation	1	1
6	GAD / QMS / DRRM / Compliances	1	1
7	Smart and Sustainable Communities	1	1
8	S&T Scholarship Unit	1	1
9	RSTL	1	1
10	Human Resources Management	1	2
11	Procurement Unit	1	2
12	Accounting Unit	1	2
13	Supply and Property Unit	1	2
14	Budget Unit	1	2
15	General Support Services	1	2
16	Cashier Unit	1	2
17	Records Management Unit	1	2
\.


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);


--
-- Name: age_group age_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.age_group
    ADD CONSTRAINT age_group_pkey PRIMARY KEY (age_group_id);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (customer_id);


--
-- Name: customer_type customer_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_type
    ADD CONSTRAINT customer_type_pkey PRIMARY KEY (cust_type_id);


--
-- Name: division division_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.division
    ADD CONSTRAINT division_pkey PRIMARY KEY (division_id);


--
-- Name: external_customer_type external_customer_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_customer_type
    ADD CONSTRAINT external_customer_type_pkey PRIMARY KEY (external_type_id);


--
-- Name: form_status form_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_status
    ADD CONSTRAINT form_status_pkey PRIMARY KEY (status_id);


--
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (form_id);


--
-- Name: office_type office_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.office_type
    ADD CONSTRAINT office_type_pkey PRIMARY KEY (office_type_id);


--
-- Name: offices offices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offices
    ADD CONSTRAINT offices_pkey PRIMARY KEY (office_id);


--
-- Name: options options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_pkey PRIMARY KEY (option_id);


--
-- Name: question_types question_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_types
    ADD CONSTRAINT question_types_pkey PRIMARY KEY (question_type_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- Name: response_details response_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_details
    ADD CONSTRAINT response_details_pkey PRIMARY KEY (response_details_id);


--
-- Name: responses responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_pkey PRIMARY KEY (response_id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- Name: services_types services_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services_types
    ADD CONSTRAINT services_types_pkey PRIMARY KEY (service_type_id);


--
-- Name: unit unit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit
    ADD CONSTRAINT unit_pkey PRIMARY KEY (unit_id);


--
-- Name: admins fk_admin_division; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admin_division FOREIGN KEY (division_id) REFERENCES public.division(division_id);


--
-- Name: admins fk_admin_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admin_office FOREIGN KEY (office_id) REFERENCES public.offices(office_id);


--
-- Name: customer fk_customer_age_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT fk_customer_age_group FOREIGN KEY (age_group_id) REFERENCES public.age_group(age_group_id);


--
-- Name: customer fk_customer_external_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT fk_customer_external_type FOREIGN KEY (external_type_id) REFERENCES public.external_customer_type(external_type_id);


--
-- Name: customer fk_customer_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT fk_customer_type FOREIGN KEY (customer_type_id) REFERENCES public.customer_type(cust_type_id);


--
-- Name: division fk_division_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.division
    ADD CONSTRAINT fk_division_office FOREIGN KEY (office_id) REFERENCES public.offices(office_id);


--
-- Name: forms fk_forms_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT fk_forms_admin FOREIGN KEY (added_by) REFERENCES public.admins(admin_id);


--
-- Name: forms fk_forms_status; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT fk_forms_status FOREIGN KEY (status_id) REFERENCES public.form_status(status_id);


--
-- Name: offices fk_offices_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offices
    ADD CONSTRAINT fk_offices_type FOREIGN KEY (office_type_id) REFERENCES public.office_type(office_type_id);


--
-- Name: options fk_options_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES public.questions(question_id);


--
-- Name: questions fk_questions_form; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_questions_form FOREIGN KEY (form_id) REFERENCES public.forms(form_id);


--
-- Name: questions fk_questions_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_questions_type FOREIGN KEY (question_type_id) REFERENCES public.question_types(question_type_id);


--
-- Name: response_details fk_response_details_option; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_details
    ADD CONSTRAINT fk_response_details_option FOREIGN KEY (option_id) REFERENCES public.options(option_id);


--
-- Name: response_details fk_response_details_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_details
    ADD CONSTRAINT fk_response_details_question FOREIGN KEY (question_id) REFERENCES public.questions(question_id);


--
-- Name: response_details fk_response_details_response; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_details
    ADD CONSTRAINT fk_response_details_response FOREIGN KEY (response_id) REFERENCES public.responses(response_id);


--
-- Name: responses fk_responses_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT fk_responses_customer FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id);


--
-- Name: responses fk_responses_form; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT fk_responses_form FOREIGN KEY (form_id) REFERENCES public.forms(form_id);


--
-- Name: responses fk_responses_service; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT fk_responses_service FOREIGN KEY (service_id) REFERENCES public.services(service_id);


--
-- Name: services fk_services_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_services_office FOREIGN KEY (office_id) REFERENCES public.offices(office_id);


--
-- Name: services fk_services_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_services_type FOREIGN KEY (service_type_id) REFERENCES public.services_types(service_type_id);


--
-- Name: services fk_services_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_services_unit FOREIGN KEY (unit_id) REFERENCES public.unit(unit_id);


--
-- Name: unit fk_unit_division; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit
    ADD CONSTRAINT fk_unit_division FOREIGN KEY (division_id) REFERENCES public.division(division_id);


--
-- Name: unit fk_unit_office; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit
    ADD CONSTRAINT fk_unit_office FOREIGN KEY (office_id) REFERENCES public.offices(office_id);


--
-- PostgreSQL database dump complete
--

