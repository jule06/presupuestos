ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(10) NOT NULL DEFAULT 'USER';

UPDATE usuarios SET rol = 'ADMIN'
WHERE email IN ('jhulian10@gmail.com', 'proyectopresupuesto.arg@gmail.com');
