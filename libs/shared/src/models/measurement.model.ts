export interface BodyMeasurement {
  id: number;
  client_id: number;
  date: string;
  weight_kg?: number;
  waist_cm?: number;
  abdomen_low_cm?: number;
  thigh_cm?: number;
  arm_relaxed_cm?: number;
  arm_flexed_cm?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Deltas vs el registro anterior (computados por el backend)
  delta_weight_kg?: number;
  delta_waist_cm?: number;
  delta_abdomen_low_cm?: number;
  delta_thigh_cm?: number;
  delta_arm_relaxed_cm?: number;
  delta_arm_flexed_cm?: number;
}

export interface MeasurementFields {
  label: string;
  field: keyof BodyMeasurement;
  deltaField?: keyof BodyMeasurement;
  unit: string;
  // true = aumentar es bueno (músculo); false = bajar es bueno (grasa)
  increaseIsGood: boolean;
}

export const MEASUREMENT_FIELDS: MeasurementFields[] = [
  { label: 'Cintura', field: 'waist_cm', deltaField: 'delta_waist_cm', unit: 'cm', increaseIsGood: false },
  { label: 'Abdomen bajo', field: 'abdomen_low_cm', deltaField: 'delta_abdomen_low_cm', unit: 'cm', increaseIsGood: false },
  { label: 'Pierna', field: 'thigh_cm', deltaField: 'delta_thigh_cm', unit: 'cm', increaseIsGood: true },
  { label: 'Brazo sin fuerza', field: 'arm_relaxed_cm', deltaField: 'delta_arm_relaxed_cm', unit: 'cm', increaseIsGood: true },
  { label: 'Brazo con fuerza', field: 'arm_flexed_cm', deltaField: 'delta_arm_flexed_cm', unit: 'cm', increaseIsGood: true },
  { label: 'Peso', field: 'weight_kg', deltaField: 'delta_weight_kg', unit: 'kg', increaseIsGood: false }
];
