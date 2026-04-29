CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    foto_url TEXT,
    matricula VARCHAR(100),
    provincia VARCHAR(100),
    ciudad VARCHAR(100),
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    presupuestos_cargados INTEGER NOT NULL DEFAULT 0,
    acceso_desbloqueado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TYPE tipo_obra_enum AS ENUM (
    'VIVIENDA_NUEVA', 'REFORMA_PARCIAL', 'REFORMA_INTEGRAL',
    'LOCAL_COMERCIAL', 'OFICINA', 'OTRO'
);

CREATE TYPE categoria_terminacion_enum AS ENUM ('BASICA', 'MEDIA', 'PREMIUM');
CREATE TYPE gano_trabajo_enum AS ENUM ('SI', 'NO', 'NO_SABE');
CREATE TYPE tipo_cliente_enum AS ENUM ('PARTICULAR', 'EMPRESA', 'DESARROLLADORA');

CREATE TABLE presupuestos (
    id BIGSERIAL PRIMARY KEY,
    tipo_obra VARCHAR(50) NOT NULL,
    superficie_m2 DECIMAL(10,2) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    barrio VARCHAR(100),
    anio_presupuesto INTEGER NOT NULL,
    categoria_terminacion VARCHAR(20) NOT NULL,
    costo_total DECIMAL(15,2) NOT NULL,
    costo_por_m2 DECIMAL(10,2) NOT NULL,
    desglose JSONB,
    gano_trabajo VARCHAR(20) NOT NULL,
    tipo_cliente VARCHAR(30) NOT NULL,
    duracion_meses INTEGER,
    notas TEXT,
    fecha_carga TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_presupuestos_tipo_obra ON presupuestos(tipo_obra);
CREATE INDEX idx_presupuestos_provincia ON presupuestos(provincia);
CREATE INDEX idx_presupuestos_categoria ON presupuestos(categoria_terminacion);
CREATE INDEX idx_presupuestos_anio ON presupuestos(anio_presupuesto);
CREATE INDEX idx_presupuestos_usuario ON presupuestos(usuario_id);
