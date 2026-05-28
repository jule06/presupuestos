"""
Genera 322 presupuestos de construcción realistas para Argentina (2023-2025).
Valores basados en datos reales de mercado (COPAIPA, INDEC, Estudio Lat, El Cronista).
Ejecutar: python seed_presupuestos.py > seed_presupuestos.sql
"""

import random
import json
import math
from datetime import datetime, timedelta

random.seed(42)

# ── Valores base ARS/m² por categoría ─────────────────────────────────────────
# Calibrados para dar totales realistas: $3.000 – $100.000 USD
# (tipo de cambio referencia ~$1.000 ARS/USD promedio del período 2022-2025)
# BASICA:  USD 200-380/m²  → obras económicas / Procrear
# MEDIA:   USD 380-650/m²  → construcción estándar llave en mano
# PREMIUM: USD 600-950/m²  → alta gama / countries
COSTO_BASE = {
    "BASICA":  {"min": 200_000,  "max": 380_000},
    "MEDIA":   {"min": 380_000,  "max": 650_000},
    "PREMIUM": {"min": 600_000,  "max": 950_000},
}

MAX_COSTO_TOTAL = 100_000_000  # ~$100.000 USD techo absoluto

# ── Factor regional ────────────────────────────────────────────────────────────
REGIONES = {
    "CABA": {"factor": 1.00, "ciudades": ["Palermo", "Belgrano", "Recoleta", "Caballito", "Villa Crespo", "Almagro", "Flores", "San Telmo", "Boedo", "Coghlan", "Núñez", "Colegiales"]},
    "Buenos Aires":    {"factor": 0.92, "ciudades": ["La Plata", "Mar del Plata", "Quilmes", "Tigre", "San Isidro", "Lomas de Zamora", "Bahía Blanca", "Tandil", "Pilar", "Morón", "Lanús", "Avellaneda", "Vicente López"]},
    "Córdoba":         {"factor": 0.72, "ciudades": ["Córdoba Capital", "Villa Carlos Paz", "Río Cuarto", "Villa María", "Alta Gracia"]},
    "Santa Fe":        {"factor": 0.68, "ciudades": ["Rosario", "Santa Fe Capital", "Rafaela", "Venado Tuerto", "Villa Gobernador Gálvez"]},
    "Mendoza":         {"factor": 0.70, "ciudades": ["Mendoza Capital", "Godoy Cruz", "Maipú", "Luján de Cuyo", "San Rafael"]},
    "Neuquén":         {"factor": 1.15, "ciudades": ["Neuquén Capital", "San Martín de los Andes", "Villa La Angostura", "Zapala"]},
    "Tucumán":         {"factor": 0.65, "ciudades": ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo", "Concepción"]},
    "Salta":           {"factor": 0.67, "ciudades": ["Salta Capital", "Tartagal", "Orán", "General Güemes"]},
    "Entre Ríos":      {"factor": 0.70, "ciudades": ["Paraná", "Concordia", "Gualeguaychú", "Colón"]},
    "Chubut":          {"factor": 1.10, "ciudades": ["Comodoro Rivadavia", "Rawson", "Trelew", "Puerto Madryn"]},
    "Río Negro":       {"factor": 1.05, "ciudades": ["Bariloche", "General Roca", "Viedma", "Cipolletti"]},
    "Misiones":        {"factor": 0.68, "ciudades": ["Posadas", "Oberá", "Eldorado", "Puerto Iguazú"]},
}

# ── Factor por tipo de obra (relativo a vivienda nueva) ───────────────────────
TIPO_OBRA_CONFIG = {
    "VIVIENDA_NUEVA":    {"factor": 1.00, "m2_min": 45,  "m2_max": 180, "dur_min": 8,  "dur_max": 16},
    "REFORMA_PARCIAL":   {"factor": 0.55, "m2_min": 6,   "m2_max": 45,  "dur_min": 1,  "dur_max": 4},
    "REFORMA_INTEGRAL":  {"factor": 0.76, "m2_min": 35,  "m2_max": 120, "dur_min": 3,  "dur_max": 7},
    "LOCAL_COMERCIAL":   {"factor": 1.05, "m2_min": 25,  "m2_max": 150, "dur_min": 2,  "dur_max": 7},
    "OFICINA":           {"factor": 0.95, "m2_min": 30,  "m2_max": 200, "dur_min": 2,  "dur_max": 6},
    "OTRO":              {"factor": 0.85, "m2_min": 15,  "m2_max": 100, "dur_min": 1,  "dur_max": 7},
}

# ── Distribución deseada ──────────────────────────────────────────────────────
DIST_TIPO = [
    ("VIVIENDA_NUEVA",   130),
    ("REFORMA_PARCIAL",   55),
    ("REFORMA_INTEGRAL",  60),
    ("LOCAL_COMERCIAL",   40),
    ("OFICINA",           22),
    ("OTRO",              15),
]

DIST_CAT = {
    "BASICA":  0.33,
    "MEDIA":   0.46,
    "PREMIUM": 0.21,
}

# ── Barrios por ciudad ─────────────────────────────────────────────────────────
BARRIOS = {
    "CABA": ["Palermo", "Belgrano", "Recoleta", "Caballito", "Villa Crespo", "Almagro", "Flores", "San Telmo", "Boedo", "Coghlan", "Núñez", "Colegiales"],
    "La Plata": ["Centro", "City Bell", "Gonnet", "Villa Elisa", "Tolosa"],
    "Mar del Plata": ["Centro", "La Perla", "Los Troncos", "Punta Iguana", "El Grosellar"],
    "Rosario": ["Centro", "Fisherton", "Pichincha", "La Florida", "Echesortu", "Belgrano"],
    "Córdoba Capital": ["Nueva Córdoba", "Güemes", "Cerro de las Rosas", "General Paz", "Villa Allende"],
    "Mendoza Capital": ["Centro", "El Challao", "Chacras de Coria", "Dorrego"],
    "Neuquén Capital": ["Centro", "Confluencia", "Villa del Parque", "Bouquet Roldán"],
    "Bariloche": ["Centro", "Melipal", "Arrayanes", "Virgen de las Nieves"],
    "San Miguel de Tucumán": ["Centro", "Yerba Buena", "Los Pocitos", "Cevil Pozo"],
    "Salta Capital": ["Centro", "San Bernardo", "Tres Ceibos", "Palermo"],
}

# ── Notas temáticas ───────────────────────────────────────────────────────────
NOTAS_POOL = [
    "Llave en mano, incluye dirección técnica.",
    "No incluye amoblamientos ni electrodomésticos.",
    "Construcción tradicional en mampostería de ladrillo.",
    "Se cotizó con materiales de primera calidad.",
    "El presupuesto no incluye honorarios de arquitecto.",
    "Reforma financiada parcialmente con crédito bancario.",
    "Materiales cotizados en dólares al tipo de cambio oficial.",
    "Se realizaron varios pedidos de presupuesto, este fue el más conveniente.",
    "Incluye pintura interior y exterior.",
    "Construcción en barrio cerrado, con gastos de habilitación incluidos.",
    "Se realizó en etapas por cuestiones presupuestarias.",
    "El contratista ajustó los precios a mitad de obra.",
    "Obra finalizada con pequeñas diferencias respecto al presupuesto inicial.",
    "Incluye IRAM certificado para materiales.",
    "Proyecto y dirección de obra incluidos en el precio.",
    "Se usó sistema de steel frame para reducir tiempos.",
    "Presupuesto ajustado mensualmente por índice CAC.",
    None, None, None, None, None,  # muchos sin nota
]

def redondear(valor, multiplo=5000):
    return round(valor / multiplo) * multiplo

def desglose(costo_total, categoria):
    """Genera un desglose realista del costo total."""
    if categoria == "BASICA":
        pct_mo = random.uniform(0.44, 0.52)
        pct_mat = random.uniform(0.38, 0.46)
    elif categoria == "MEDIA":
        pct_mo = random.uniform(0.40, 0.48)
        pct_mat = random.uniform(0.40, 0.48)
    else:
        pct_mo = random.uniform(0.35, 0.45)
        pct_mat = random.uniform(0.42, 0.50)

    pct_proyecto = random.uniform(0.03, 0.08)
    total_sin_proy = pct_mo + pct_mat
    if total_sin_proy > 0.95:
        scale = 0.92 / total_sin_proy
        pct_mo *= scale
        pct_mat *= scale

    pct_imprevistos = max(0.02, 1.0 - pct_mo - pct_mat - pct_proyecto)

    return {
        "mano_obra":    redondear(costo_total * pct_mo),
        "materiales":   redondear(costo_total * pct_mat),
        "proyecto":     redondear(costo_total * pct_proyecto),
        "imprevistos":  redondear(costo_total * pct_imprevistos),
    }

def fecha_aleatoria(anio):
    inicio = datetime(anio, 1, 1)
    fin = datetime(anio, 12, 31) if anio < 2025 else datetime(2025, 10, 31)
    delta = (fin - inicio).days
    return inicio + timedelta(days=random.randint(0, delta))

def escape_sql(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

# ── Generar registros ──────────────────────────────────────────────────────────
registros = []
id_counter = 1

for tipo, cantidad in DIST_TIPO:
    cfg = TIPO_OBRA_CONFIG[tipo]
    for _ in range(cantidad):
        # Categoría según distribución
        rand_cat = random.random()
        if rand_cat < DIST_CAT["BASICA"]:
            categoria = "BASICA"
        elif rand_cat < DIST_CAT["BASICA"] + DIST_CAT["MEDIA"]:
            categoria = "MEDIA"
        else:
            categoria = "PREMIUM"

        # Provincia y ciudad
        provincia = random.choice(list(REGIONES.keys()))
        reg = REGIONES[provincia]
        ciudad = random.choice(reg["ciudades"])
        barrio = None
        if ciudad in BARRIOS:
            barrio = random.choice(BARRIOS[ciudad]) if random.random() > 0.35 else None

        # Superficie
        m2 = round(random.uniform(cfg["m2_min"], cfg["m2_max"]), 1)
        if tipo == "VIVIENDA_NUEVA" and categoria == "PREMIUM":
            m2 = round(random.uniform(120, 350), 1)

        # Costo por m²
        base = COSTO_BASE[categoria]
        factor_regional = reg["factor"]
        factor_tipo = cfg["factor"]
        # Pequeña variación aleatoria ±12%
        variacion = random.uniform(0.88, 1.12)
        cpm2 = (base["min"] + random.random() * (base["max"] - base["min"])) * factor_regional * factor_tipo * variacion
        cpm2 = redondear(cpm2, 1000)

        costo_total = redondear(cpm2 * m2, 10000)
        # Cap absoluto: si supera el techo, reducimos la superficie proporcionalmente
        if costo_total > MAX_COSTO_TOTAL:
            costo_total = redondear(MAX_COSTO_TOTAL * random.uniform(0.80, 1.00), 10000)
            m2 = round(costo_total / cpm2, 1)

        # Año presupuesto (más recientes = más frecuentes)
        anio = random.choices([2022, 2023, 2024, 2025], weights=[8, 20, 42, 30])[0]
        fecha = fecha_aleatoria(anio)

        # Duración
        duracion = random.randint(cfg["dur_min"], cfg["dur_max"]) if random.random() > 0.2 else None

        # Ganó trabajo
        gano = random.choices(["SI", "NO", "NO_SABE"], weights=[55, 30, 15])[0]

        # Tipo cliente
        if tipo in ("LOCAL_COMERCIAL", "OFICINA"):
            tipo_cliente = random.choices(["PARTICULAR", "EMPRESA", "DESARROLLADORA"], weights=[20, 55, 25])[0]
        elif tipo == "VIVIENDA_NUEVA" and categoria == "PREMIUM":
            tipo_cliente = random.choices(["PARTICULAR", "EMPRESA", "DESARROLLADORA"], weights=[50, 20, 30])[0]
        else:
            tipo_cliente = random.choices(["PARTICULAR", "EMPRESA", "DESARROLLADORA"], weights=[65, 25, 10])[0]

        # Anonimo
        anonimo = "true" if random.random() > 0.15 else "false"

        # Desglose
        des = desglose(costo_total, categoria)
        des_json = json.dumps(des, ensure_ascii=False)

        # Nota
        nota = random.choice(NOTAS_POOL)

        registros.append({
            "tipo_obra": tipo,
            "superficie_m2": m2,
            "provincia": provincia,
            "ciudad": ciudad,
            "barrio": barrio,
            "anio_presupuesto": anio,
            "categoria_terminacion": categoria,
            "costo_total": costo_total,
            "costo_por_m2": cpm2,
            "desglose": des_json,
            "gano_trabajo": gano,
            "tipo_cliente": tipo_cliente,
            "duracion_meses": duracion,
            "notas": nota,
            "anonimo": anonimo,
            "fecha_carga": fecha.strftime("%Y-%m-%d %H:%M:%S"),
        })

random.shuffle(registros)

# ── Escribir SQL ───────────────────────────────────────────────────────────────
print("-- ============================================================")
print("-- SEED: 322 presupuestos de construcción Argentina 2022-2025")
print("-- Valores basados en datos reales de mercado (COPAIPA, INDEC,")
print("-- Estudio Lat, El Cronista, Metroobra)")
print("-- ============================================================")
print()
print("-- Usamos el primer usuario existente en la DB como autor.")
print("-- Asegurate de tener al menos un usuario antes de correr esto.")
print()
print("DO $$")
print("DECLARE seed_user_id BIGINT;")
print("BEGIN")
print("  SELECT id INTO seed_user_id FROM usuarios ORDER BY id LIMIT 1;")
print("  IF seed_user_id IS NULL THEN")
print("    RAISE EXCEPTION 'No hay usuarios en la base de datos. Creá uno primero.';")
print("  END IF;")
print()
print("  INSERT INTO presupuestos")
print("    (tipo_obra, superficie_m2, provincia, ciudad, barrio, anio_presupuesto,")
print("     categoria_terminacion, costo_total, costo_por_m2, desglose,")
print("     gano_trabajo, tipo_cliente, duracion_meses, notas, anonimo, fecha_carga, usuario_id)")
print("  VALUES")

for i, r in enumerate(registros):
    barrio_val = escape_sql(r["barrio"])
    dur_val = str(r["duracion_meses"]) if r["duracion_meses"] else "NULL"
    notas_val = escape_sql(r["notas"])
    des_val = "'" + r["desglose"].replace("'", "''") + "'::jsonb"
    comma = "," if i < len(registros) - 1 else ""

    print(f"    ('{r['tipo_obra']}', {r['superficie_m2']}, {escape_sql(r['provincia'])}, "
          f"{escape_sql(r['ciudad'])}, {barrio_val}, {r['anio_presupuesto']}, "
          f"'{r['categoria_terminacion']}', {r['costo_total']}, {r['costo_por_m2']}, "
          f"{des_val}, "
          f"'{r['gano_trabajo']}', '{r['tipo_cliente']}', {dur_val}, {notas_val}, "
          f"{r['anonimo']}, '{r['fecha_carga']}', seed_user_id){comma}")

print("  ;")
print("END $$;")
print()
print(f"-- Total registros insertados: {len(registros)}")

# Estadísticas a modo informativo (van como comentarios)
from collections import Counter
tipos_c = Counter(r["tipo_obra"] for r in registros)
cats_c = Counter(r["categoria_terminacion"] for r in registros)
print()
print("-- Distribución generada:")
for k, v in sorted(tipos_c.items()):
    print(f"--   {k}: {v}")
for k, v in sorted(cats_c.items()):
    print(f"--   {k}: {v}")
