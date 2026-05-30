const MEDICAL_KEYWORDS = [
  // Care settings & roles
  'patient', 'patients', 'doctor', 'physician', 'clinician', 'nurse', 'hospital',
  'clinic', 'pharmacy', 'pharmacist', 'radiologist', 'pathologist', 'surgeon',
  'gp', 'consultant', 'ward', 'icu', 'er', 'emergency room', 'outpatient',
  'inpatient', 'admitted', 'discharge', 'referral', 'specialist',
  // Document types
  'diagnosis', 'diagnoses', 'prognosis', 'prescription', 'medication', 'medications',
  'dosage', 'dose', 'mg', 'ml', 'mcg', 'tablet', 'capsule', 'syrup', 'injection',
  'iv', 'oral', 'topical', 'chronic', 'acute', 'condition', 'treatment',
  'therapy', 'procedure', 'surgery', 'operation', 'biopsy', 'screening',
  // Vitals / measurements
  'blood pressure', 'bp', 'heart rate', 'pulse', 'respiratory', 'spo2',
  'oxygen saturation', 'temperature', 'fever', 'glucose', 'cholesterol', 'hba1c',
  'hemoglobin', 'haemoglobin', 'wbc', 'rbc', 'platelet', 'creatinine', 'sodium',
  'potassium', 'tsh', 'lipid', 'urea', 'bilirubin', 'liver function', 'lft',
  'kidney function', 'rft',
  // Imaging / labs
  'lab', 'laboratory', 'pathology', 'radiology', 'x-ray', 'xray', 'mri', 'ct scan',
  'ultrasound', 'ecg', 'ekg', 'echocardiogram', 'biopsy', 'culture', 'serology',
  'urinalysis', 'microbiology',
  // Common symptoms / complaints
  'symptom', 'symptoms', 'pain', 'ache', 'headache', 'migraine', 'nausea',
  'vomiting', 'diarrhea', 'diarrhoea', 'constipation', 'fatigue', 'dizziness',
  'cough', 'cold', 'fever', 'rash', 'inflammation', 'swelling', 'bleeding',
  'shortness of breath', 'chest pain', 'palpitation', 'insomnia', 'allergy',
  'allergies',
  // Conditions
  'diabetes', 'diabetic', 'hypertension', 'asthma', 'copd', 'cancer', 'tumor',
  'tumour', 'arthritis', 'anemia', 'anaemia', 'thyroid', 'hypothyroidism',
  'hyperthyroidism', 'covid', 'covid-19', 'influenza', 'pneumonia', 'bronchitis',
  'sinusitis', 'gastritis', 'ulcer', 'depression', 'anxiety', 'adhd', 'autism',
  'stroke', 'seizure', 'epilepsy', 'fracture', 'sprain', 'concussion',
  'pregnancy', 'prenatal', 'postnatal',
  // Anatomy
  'cardiac', 'cardiovascular', 'pulmonary', 'renal', 'hepatic', 'gastric',
  'intestinal', 'neurological', 'dermatological', 'orthopedic', 'orthopaedic',
  'musculoskeletal', 'abdomen', 'abdominal', 'thorax', 'spine', 'cervical',
  'lumbar',
  // Records / process
  'medical history', 'family history', 'allergies', 'immunization',
  'immunisation', 'vaccination', 'vaccine', 'booster', 'follow-up', 'followup',
  'visit', 'consultation', 'appointment', 'admission', 'discharge summary',
  'progress note', 'soap note', 'chief complaint', 'plan of care', 'icd',
  'icd-10', 'cpt code',
];

const NON_MEDICAL_RED_FLAGS = [
  // Code / tech
  'function ', 'const ', 'import ', 'class ', 'public static', 'void main',
  'def ', 'return ', '=>', '<html', 'console.log', '#include',
  // Finance / legal
  'invoice', 'tax invoice', 'subtotal', 'total due', 'gst', 'purchase order',
  'agreement', 'whereas', 'lessor', 'lessee',
  // Recipes / lifestyle
  'cup of flour', 'tablespoon', 'teaspoon', 'preheat', 'bake for', 'serves 4',
  // Resumes / generic business
  'curriculum vitae', 'work experience', 'resume', 'cover letter', 'startup',
];

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

export const MEDICAL_CONTENT_MESSAGE =
  "This doesn't look like a medical or clinical document, so SymptIQ can't index it. Please upload health-related files only — lab reports, prescriptions, discharge summaries, doctor's notes, radiology reports, or similar.";

export const classifyMedicalContent = (rawText) => {
  const text = String(rawText ?? '').toLowerCase();
  if (!text.trim()) {
    return { isMedical: false, score: 0, reason: 'empty' };
  }

  const tokens = tokenize(text);
  const totalWords = tokens.length;
  if (totalWords < 25) {
    const shortHits = new Set();
    for (const keyword of MEDICAL_KEYWORDS) {
      if (text.includes(keyword)) shortHits.add(keyword);
    }
    const isMedical = shortHits.size >= 2;
    return {
      isMedical,
      score: shortHits.size,
      reason: isMedical ? 'short-but-medical' : 'too-short-and-non-medical',
    };
  }

  const uniqueHits = new Set();
  let totalHits = 0;
  for (const keyword of MEDICAL_KEYWORDS) {
    let idx = text.indexOf(keyword);
    while (idx !== -1) {
      totalHits += 1;
      uniqueHits.add(keyword);
      idx = text.indexOf(keyword, idx + keyword.length);
    }
  }

  let redFlags = 0;
  for (const flag of NON_MEDICAL_RED_FLAGS) {
    if (text.includes(flag)) redFlags += 1;
  }

  const density = totalHits / totalWords;
  const isMedical =
    (uniqueHits.size >= 4 && density >= 0.004 && redFlags < 3) ||
    uniqueHits.size >= 8;

  return {
    isMedical,
    score: uniqueHits.size,
    density,
    redFlags,
    reason: isMedical ? 'medical' : 'non-medical',
  };
};
