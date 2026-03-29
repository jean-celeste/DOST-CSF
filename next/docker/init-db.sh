#!/bin/sh
set -e

echo "[init-db] Loading /docker-entrypoint-initdb.d/dost_feedback_db.sql into postgres"

# The dump references OWNER TO postgres; create the role when the cluster
# is initialized with a non-default superuser (e.g., POSTGRES_USER=dev_user).
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -c "DO \
\$\$ \
BEGIN \
	IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN \
		CREATE ROLE postgres WITH LOGIN SUPERUSER; \
	END IF; \
END \
\$\$;"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -f /docker-entrypoint-initdb.d/dost_feedback_db.sql
echo "[init-db] Database import completed"
