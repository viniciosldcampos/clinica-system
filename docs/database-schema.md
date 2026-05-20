# 🗄️ Modelagem do Banco de Dados

## Tabelas

### users
Tabela unificada de usuários (pacientes, médicos e admins)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'PATIENT', 'DOCTOR', 'ADMIN'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### patients
Dados específicos de pacientes

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  phone VARCHAR(15) NOT NULL,
  birth_date DATE NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### doctors
Dados específicos de médicos

```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  crm VARCHAR(20) UNIQUE NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### appointments
Consultas agendadas

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  status VARCHAR(20) DEFAULT 'AGENDADA', -- AGENDADA, CONFIRMADA, REALIZADA, CANCELADA, FALTOU
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_doctor_datetime UNIQUE (doctor_id, appointment_date, appointment_time),
  CONSTRAINT unique_patient_datetime UNIQUE (patient_id, appointment_date, appointment_time)
);
```

### doctor_unavailability
Horários indisponíveis dos médicos

```sql
CREATE TABLE doctor_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  unavailable_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### notifications
Log de notificações enviadas

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- EMAIL, SMS, WHATSAPP
  status VARCHAR(20) NOT NULL, -- PENDING, SENT, FAILED
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Índices para Performance

```sql
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_doctors_crm ON doctors(crm);
```

## Relacionamentos

- Um `user` pode ser um `patient` OU um `doctor` OU `admin`
- Um `patient` pode ter várias `appointments`
- Um `doctor` pode ter várias `appointments`
- Um `doctor` pode ter várias `doctor_unavailability`
- Uma `appointment` pode ter várias `notifications`