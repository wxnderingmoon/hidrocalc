-- =====================================================================
-- HidroCalc v2 - script de inicialización de la base de datos
-- Motor: PostgreSQL 14
-- Uso:  psql -U postgres -f db/init.sql
-- =====================================================================

-- Usuario y base de datos de la aplicación
DROP DATABASE IF EXISTS hidrocalc;
DROP ROLE IF EXISTS hidrocalc_app;
CREATE ROLE hidrocalc_app WITH LOGIN PASSWORD 'cambiar_en_produccion';
CREATE DATABASE hidrocalc OWNER hidrocalc_app ENCODING 'UTF8';

\connect hidrocalc
SET ROLE hidrocalc_app;

-- Catálogo de municipios (para estadísticas por zona)
CREATE TABLE municipios (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(80)  NOT NULL,
    estado  VARCHAR(40)  NOT NULL DEFAULT 'Guanajuato',
    CONSTRAINT uq_municipio UNIQUE (nombre, estado)
);

-- Cálculos guardados de forma anónima (no se guarda nombre, correo ni IP)
CREATE TABLE calculos (
    id               SERIAL PRIMARY KEY,
    municipio_id     INTEGER REFERENCES municipios(id) ON DELETE SET NULL,
    personas         SMALLINT     NOT NULL CHECK (personas BETWEEN 1 AND 20),
    ducha_min        SMALLINT     NOT NULL CHECK (ducha_min BETWEEN 0 AND 60),
    inodoro_veces    SMALLINT     NOT NULL CHECK (inodoro_veces BETWEEN 0 AND 20),
    lavadora_cargas  SMALLINT     NOT NULL CHECK (lavadora_cargas BETWEEN 0 AND 30),
    riego_min        SMALLINT     NOT NULL CHECK (riego_min BETWEEN 0 AND 600),
    litros_dia       NUMERIC(8,1) NOT NULL CHECK (litros_dia >= 0),
    litros_persona   NUMERIC(8,1) NOT NULL CHECK (litros_persona >= 0),
    creado_en        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Índices para las consultas de estadísticas
CREATE INDEX idx_calculos_municipio ON calculos (municipio_id);
CREATE INDEX idx_calculos_fecha     ON calculos (creado_en);

-- Municipios de Guanajuato
INSERT INTO municipios (nombre) VALUES
  ('Celaya'), ('Dolores Hidalgo'), ('Guanajuato'), ('Irapuato'), ('León'),
  ('Pénjamo'), ('Salamanca'), ('San Francisco del Rincón'), ('San Miguel de Allende'),
  ('Silao de la Victoria'), ('Valle de Santiago'), ('Otro municipio');
