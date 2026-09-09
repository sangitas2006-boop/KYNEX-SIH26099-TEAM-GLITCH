// KYNEX — Material Identity Data Layer
// Cross-enterprise material standardization and harmonization
// Note: Material records, codes, and metrics follow the governed workspace model.

export interface CandidateRecord {
  id: string
  org: string
  code: string
  name: string
  plant: string
  erpSystem: string
  relationship: 'Reference record' | 'Near-duplicate candidate' | 'Conflict — do not merge' | 'Exact duplicate' | 'Near duplicate' | 'Functional equivalent' | 'Conflict'
  relationshipNote: string
  isConflict?: boolean
  concordance: {
    composite: number
    lexical: number
    taxonomy: number
    technicalAttributes: number
    unit: number
    sourceLineage: number
  }
  rawAttributes: Record<string, string>
}

export interface AttributeChip {
  id: string
  key: string
  label: string
  rawValue: string
  normalizedValue: string
  standardRef: string
  confidence: number
  isNormalized?: boolean
  normalizationNote?: string
}

export interface MaterialCase {
  id: string
  title: string
  category: string
  subcategory: string
  recommendedCode: string
  controlledDisclaimer: string
  mappingVersion: string
  
  // Intake sample data
  intakeSample: {
    org: string
    code: string
    description: string
    uom: string
    sourceSystem: string
    plant: string
    poNumber: string
    scanType: string
  }

  // Fingerprint attributes
  fingerprint: {
    category: string
    type: string
    material: string
    nominalDiameter: string
    pressureClass: string
    endConnection: string
    standardClue: string
    uom: string
    attributes: AttributeChip[]
  }

  // Compare candidates
  candidates: CandidateRecord[]

  // Evidence Graph data
  evidence: {
    compositeScore: number
    lexicalScore: number
    attributeScore: number
    taxonomyScore: number
    unitScore: number
    lineageScore: number
    reasons: string[]
    conflictExplanation: string
    lineageNotes: string
    graphNodes: Array<{
      id: string
      label: string
      type: 'source' | 'target' | 'attribute' | 'conflict'
      details: string
    }>
    graphEdges: Array<{
      from: string
      to: string
      label: string
      type: 'exact' | 'near' | 'attribute' | 'conflict'
    }>
  }

  // Governance & Passport
  governance: {
    recommendedCommonCode: string
    defaultStatus: 'pending' | 'approved' | 'rejected'
    authority: string
    auditTimestamp: string
    guardrailNote: string
    retainedAliases: Array<{
      org: string
      code: string
      erp: string
      status: 'Harmonized' | 'Preserved' | 'Conflict Quarantined'
    }>
  }
}

export const MATERIAL_CASES: Record<string, MaterialCase> = {
  'gate-valve': {
    id: 'gate-valve',
    title: 'Industrial Gate Valve (SS 50mm PN16)',
    category: 'Process Piping & Valves',
    subcategory: 'Cast Stainless Steel Gate Valves',
    recommendedCode: 'CNMC-VALVE-GATE-SS-050-PN16',
    mappingVersion: 'v2.4-NMSB-2026',
    controlledDisclaimer: 'governed material identity workspace.',

    intakeSample: {
      org: 'CPCL',
      code: 'CPCL-VLV-04182',
      description: 'SS GATE VALVE 2 IN PN16',
      uom: 'EA',
      sourceSystem: 'SAP S/4HANA (workspace)',
      plant: 'Manali Refinery, Unit 4',
      poNumber: 'PO-2025-CPCL-88914',
      scanType: 'QR Label / SAP Barcode 128'
    },

    fingerprint: {
      category: 'Valve',
      type: 'Gate valve',
      material: 'Stainless steel (ASTM A351 CF8M / SS 316)',
      nominalDiameter: '50 mm / 2 in',
      pressureClass: 'PN16',
      endConnection: 'Flanged Raised Face (RF)',
      standardClue: 'ISO 15761 / API 602',
      uom: 'Each (EA)',
      attributes: [
        { id: 'cat', key: 'category', label: 'Category', rawValue: 'VALVE', normalizedValue: 'Process Valve (HSN 8481)', standardRef: 'UNSPSC 401416', confidence: 99 },
        { id: 'type', key: 'type', label: 'Type', rawValue: 'GATE VALVE', normalizedValue: 'Gate Valve (Wedge Gate)', standardRef: 'ISO 15761', confidence: 98 },
        { id: 'mat', key: 'material', label: 'Material Metallurgy', rawValue: 'SS', normalizedValue: 'Austenitic Stainless Steel (CF8M / SS 316)', standardRef: 'ASTM A351', confidence: 96 },
        { id: 'dia', key: 'nominalDiameter', label: 'Nominal Diameter', rawValue: '2 IN', normalizedValue: '50 mm (DN50)', standardRef: 'ISO 6708', confidence: 100, isNormalized: true, normalizationNote: '2 in → 50.8 mm (normalized to 50 mm nominal standard)' },
        { id: 'pres', key: 'pressureClass', label: 'Pressure Class', rawValue: 'PN16', normalizedValue: 'PN16 (16 bar / Class 150 equiv)', standardRef: 'EN 1092-1', confidence: 98 },
        { id: 'conn', key: 'endConnection', label: 'End Connection', rawValue: 'FLG', normalizedValue: 'Flanged Raised Face (RF)', standardRef: 'ASME B16.5', confidence: 95 },
        { id: 'std', key: 'standardClue', label: 'Standard Clue', rawValue: 'ISO/API', normalizedValue: 'ISO 15761 / API 602 Spec', standardRef: 'ISO 15761', confidence: 94 },
        { id: 'uom', key: 'uom', label: 'Unit of Measure', rawValue: 'EA', normalizedValue: 'Each (EA / Code C62)', standardRef: 'UNECE Rec 20', confidence: 100 }
      ]
    },

    candidates: [
      {
        id: 'cand-cpcl',
        org: 'CPCL',
        code: 'CPCL-VLV-04182',
        name: 'SS GATE VALVE 2 IN PN16',
        plant: 'Manali Refinery, Chennai',
        erpSystem: 'SAP S/4HANA (workspace)',
        relationship: 'Reference record',
        relationshipNote: 'Baseline intake record; matches common code on all technical parameters.',
        concordance: {
          composite: 98.6,
          lexical: 94.2,
          taxonomy: 99.0,
          technicalAttributes: 99.5,
          unit: 100.0,
          sourceLineage: 100.0
        },
        rawAttributes: {
          'Raw Material': 'SS',
          'Size': '2 IN',
          'Pressure': 'PN16',
          'Type': 'GATE VLV'
        }
      },
      {
        id: 'cand-sail',
        org: 'SAIL',
        code: 'SAIL-VALVE-G50-16',
        name: 'GATE VLV SS316 DN50 PN16 FLANGED',
        plant: 'Bhilai Steel Plant, SMS-II',
        erpSystem: 'SAP ECC 6.0 (workspace)',
        relationship: 'Near-duplicate candidate',
        relationshipNote: 'Metric bore descriptor DN50 harmonizes 100% with imperial 2 in. Same metallurgy and pressure class.',
        concordance: {
          composite: 96.4,
          lexical: 91.8,
          taxonomy: 98.5,
          technicalAttributes: 98.8,
          unit: 100.0,
          sourceLineage: 100.0
        },
        rawAttributes: {
          'Raw Material': 'SS316',
          'Size': 'DN50',
          'Pressure': 'PN16',
          'Connection': 'FLANGED'
        }
      },
      {
        id: 'cand-ntpc',
        org: 'NTPC',
        code: 'NTPC-VLV-3307',
        name: 'VALVE GATE 50MM SS PN25 FLG',
        plant: 'Ramagundam STPS Unit 7',
        erpSystem: 'Oracle SCM Cloud (workspace)',
        relationship: 'Conflict — do not merge',
        relationshipNote: 'Conflict detected: Rated for PN25 (25 bar) vs target PN16 (16 bar). Pressure rating mismatch prohibits automatic or unified merge.',
        isConflict: true,
        concordance: {
          composite: 64.2,
          lexical: 82.0,
          taxonomy: 95.0,
          technicalAttributes: 41.5,
          unit: 100.0,
          sourceLineage: 100.0
        },
        rawAttributes: {
          'Raw Material': 'SS',
          'Size': '50MM',
          'Pressure': 'PN25 (MISMATCH)',
          'Connection': 'FLG'
        }
      }
    ],

    evidence: {
      compositeScore: 97.5,
      lexicalScore: 93.0,
      attributeScore: 99.1,
      taxonomyScore: 98.7,
      unitScore: 100.0,
      lineageScore: 100.0,
      reasons: [
        'Lexical Concordance: "SS GATE VALVE 2 IN" and "GATE VLV SS316 DN50" resolve to identical ASME/ISO taxonomy.',
        'Dimensional Normalization: 2-inch imperial nominal bore and DN50 metric diameter align with 0mm functional variance.',
        'Metallurgy Mapping: ASTM A351 CF8M casting maps to standard 316 Austenitic Stainless Steel.',
        'Pressure Class Validation: PN16 flange bolt circle conforms to EN 1092-1 / ISO 7005-1.',
        'Source Lineage Traceability: 100% immutable origin link preserved for CPCL and SAIL ERP instances.',
        'Deterministic Code Compilation: CNMC compiled per Ministry guidelines as CNMC-VALVE-GATE-SS-050-PN16.'
      ],
      conflictExplanation: 'CRITICAL SAFETY GUARDRAIL: NTPC-VLV-3307 is rated at PN25 (25 bar test pressure). Merging a PN25 valve into a PN16 identity could lead to hazardous overpressure or under-specified field replacements. KYNEX automatically flags and isolates this record.',
      lineageNotes: 'Original legacy catalog codes (CPCL-VLV-04182, SAIL-VALVE-G50-16) remain 100% active in their native ERP instances. Zero database rows are overwritten.',
      graphNodes: [
        { id: 'CPCL', label: 'CPCL-VLV-04182 (Ref)', type: 'source', details: 'CPCL Manali Refinery · SAP S/4HANA (Reference Record)' },
        { id: 'SAIL', label: 'SAIL-VALVE-G50-16', type: 'source', details: 'SAIL Bhilai Steel · SAP ECC 6.0 (Near-Duplicate)' },
        { id: 'NTPC', label: 'NTPC-VLV-3307 (PN25)', type: 'conflict', details: 'NTPC Ramagundam · Oracle SCM (Conflict — Do Not Merge)' },
        { id: 'CNMC', label: 'CNMC-VALVE-GATE-SS-050-PN16', type: 'target', details: 'Recommended Common National Material Code' },
        { id: 'ATTR_DIM', label: 'Bore: 50mm / 2"', type: 'attribute', details: 'Normalized DN50 diameter' },
        { id: 'ATTR_MAT', label: 'Grade: SS 316 / CF8M', type: 'attribute', details: 'Austenitic Stainless Steel' },
        { id: 'ATTR_PRS', label: 'Rating: PN16 (16 Bar)', type: 'attribute', details: 'Nominal pressure rating' }
      ],
      graphEdges: [
        { from: 'CPCL', to: 'CNMC', label: 'Reference Record (98.6%)', type: 'exact' },
        { from: 'SAIL', to: 'CNMC', label: 'Near-Duplicate (96.4%)', type: 'near' },
        { from: 'NTPC', to: 'CNMC', label: 'Conflict: PN25 ≠ PN16', type: 'conflict' },
        { from: 'CPCL', to: 'ATTR_DIM', label: '2 IN → 50mm', type: 'attribute' },
        { from: 'SAIL', to: 'ATTR_DIM', label: 'DN50 → 50mm', type: 'attribute' },
        { from: 'CPCL', to: 'ATTR_MAT', label: 'SS → CF8M', type: 'attribute' },
        { from: 'SAIL', to: 'ATTR_MAT', label: 'SS316 → CF8M', type: 'attribute' },
        { from: 'CPCL', to: 'ATTR_PRS', label: 'PN16 Concordant', type: 'attribute' },
        { from: 'SAIL', to: 'ATTR_PRS', label: 'PN16 Concordant', type: 'attribute' }
      ]
    },

    governance: {
      recommendedCommonCode: 'CNMC-VALVE-GATE-SS-050-PN16',
      defaultStatus: 'pending',
      authority: 'controlled material governance reviewer',
      auditTimestamp: '2026-08-25T14:32:00Z',
      guardrailNote: 'AI suggests candidate mappings. Approval creates a federated cross-reference pointer; native CPSE ERP records remain untampered.',
      retainedAliases: [
        { org: 'CPCL', code: 'CPCL-VLV-04182', erp: 'SAP S/4HANA', status: 'Harmonized' },
        { org: 'SAIL', code: 'SAIL-VALVE-G50-16', erp: 'SAP ECC 6.0', status: 'Harmonized' },
        { org: 'NTPC', code: 'NTPC-VLV-3307', erp: 'Oracle SCM Cloud', status: 'Conflict Quarantined' }
      ]
    }
  },

  'fastener-bolt': {
    id: 'fastener-bolt',
    title: 'Hex Machine Bolt (SS M10 × 50mm)',
    category: 'Fasteners & Hardware',
    subcategory: 'Hexagonal Head Machine Bolts',
    recommendedCode: 'CNMC-FAST-BOLT-SS316-M10-50',
    mappingVersion: 'v2.4-NMSB-2026',
    controlledDisclaimer: 'governed material identity workspace.',

    intakeSample: {
      org: 'CPCL',
      code: 'CPCL-FST-45891',
      description: 'SS HEX BOLT M10 X 50',
      uom: 'EA',
      sourceSystem: 'SAP S/4HANA MM (workspace)',
      plant: 'Manali Refinery Maintenance',
      poNumber: 'PO-2025-FST-11029',
      scanType: 'GS1-128 Barcode'
    },

    fingerprint: {
      category: 'Fasteners',
      type: 'Hex head machine bolt',
      material: 'Stainless steel (SS 304/316 A2-70)',
      nominalDiameter: 'M10 (10 mm thread)',
      pressureClass: 'N/A (Tensile 700 MPa)',
      endConnection: 'Threaded metric 1.5mm pitch',
      standardClue: 'ISO 4017 / DIN 933',
      uom: 'Each (EA)',
      attributes: [
        { id: 'cat', key: 'category', label: 'Category', rawValue: 'FASTENER', normalizedValue: 'Fasteners & Screws (HSN 7318)', standardRef: 'IS 1364', confidence: 99 },
        { id: 'type', key: 'type', label: 'Type', rawValue: 'HEX BOLT', normalizedValue: 'Hexagonal Head Machine Bolt', standardRef: 'ISO 4017', confidence: 99 },
        { id: 'mat', key: 'material', label: 'Material Metallurgy', rawValue: 'SS', normalizedValue: 'Austenitic Stainless Steel Grade A2-70', standardRef: 'ISO 3506-1', confidence: 97 },
        { id: 'dia', key: 'nominalDiameter', label: 'Nominal Thread', rawValue: 'M10', normalizedValue: 'M10 × 1.5 mm Coarse', standardRef: 'ISO 261', confidence: 100, isNormalized: true, normalizationNote: '10mm metric thread pitch confirmed' },
        { id: 'len', key: 'length', label: 'Shank Length', rawValue: '50', normalizedValue: '50 mm (Nominal Shank)', standardRef: 'DIN 933', confidence: 100 },
        { id: 'std', key: 'standardClue', label: 'Standard Clue', rawValue: 'DIN/ISO', normalizedValue: 'ISO 4017 / DIN 933 Fully Threaded', standardRef: 'ISO 4017', confidence: 96 },
        { id: 'uom', key: 'uom', label: 'Unit of Measure', rawValue: 'EA', normalizedValue: 'Each (EA)', standardRef: 'UNECE Rec 20', confidence: 100 }
      ]
    },

    candidates: [
      {
        id: 'cand-cpcl-bolt',
        org: 'CPCL',
        code: 'CPCL-FST-45891',
        name: 'SS HEX BOLT M10 X 50',
        plant: 'Manali Refinery',
        erpSystem: 'SAP S/4HANA MM (workspace)',
        relationship: 'Reference record',
        relationshipNote: 'Baseline intake record.',
        concordance: { composite: 99.1, lexical: 96.0, taxonomy: 100.0, technicalAttributes: 100.0, unit: 100.0, sourceLineage: 100.0 },
        rawAttributes: { 'Material': 'SS', 'Thread': 'M10', 'Length': '50mm' }
      },
      {
        id: 'cand-sail-bolt',
        org: 'SAIL',
        code: 'SAIL-BOLT-778',
        name: 'Stainless bolt 10mm x 50mm',
        plant: 'Bhilai Steel Plant',
        erpSystem: 'SAP ECC 6.0 (workspace)',
        relationship: 'Near-duplicate candidate',
        relationshipNote: 'Text "10mm x 50mm" normalizes cleanly to metric M10x50 standard fastener thread.',
        concordance: { composite: 95.8, lexical: 90.5, taxonomy: 98.0, technicalAttributes: 98.5, unit: 100.0, sourceLineage: 100.0 },
        rawAttributes: { 'Material': 'Stainless', 'Thread': '10mm', 'Length': '50mm' }
      },
      {
        id: 'cand-ntpc-bolt',
        org: 'NTPC',
        code: 'NTPC-FST-9912',
        name: 'BOLT SS M10-50 FINE PITCH 1.25',
        plant: 'Ramagundam STPS',
        erpSystem: 'Oracle SCM Cloud (workspace)',
        relationship: 'Conflict — do not merge',
        relationshipNote: 'Conflict detected: Fine thread pitch (1.25mm) vs standard coarse pitch (1.5mm). Direct replacement could strip threads.',
        isConflict: true,
        concordance: { composite: 58.4, lexical: 86.0, taxonomy: 95.0, technicalAttributes: 35.0, unit: 100.0, sourceLineage: 100.0 },
        rawAttributes: { 'Material': 'SS', 'Thread': 'M10x1.25 (FINE)', 'Length': '50mm' }
      }
    ],

    evidence: {
      compositeScore: 96.8,
      lexicalScore: 92.5,
      attributeScore: 98.8,
      taxonomyScore: 99.0,
      unitScore: 100.0,
      lineageScore: 100.0,
      reasons: [
        'Hex head fastener geometry verified across ISO 4017 and DIN 933 specifications.',
        'M10 thread pitch aligns across CPCL and SAIL records with zero dimensional mismatch.',
        'Austenitic stainless steel composition verified to Grade A2-70.',
        'Source Lineage Traceability: 100% verified native ERP records.',
        'Fine pitch variant at NTPC quarantined to prevent hazardous thread stripping.'
      ],
      conflictExplanation: 'THREAD SAFETY WARNING: NTPC-FST-9912 specifies M10×1.25 fine thread. Standard metric bolts are M10×1.5. KYNEX flags thread pitch conflict to protect maintenance technicians from cross-threading equipment.',
      lineageNotes: 'Legacy identifiers preserved in all respective CPSE inventories.',
      graphNodes: [
        { id: 'CPCL_B', label: 'CPCL-FST-45891 (Ref)', type: 'source', details: 'CPCL · SAP S/4HANA (Reference Record)' },
        { id: 'SAIL_B', label: 'SAIL-BOLT-778', type: 'source', details: 'SAIL · SAP ECC (Near-Duplicate)' },
        { id: 'NTPC_B', label: 'NTPC-FST-9912 (1.25 Pitch)', type: 'conflict', details: 'NTPC · Oracle SCM (Conflict — Do Not Merge)' },
        { id: 'CNMC_B', label: 'CNMC-FAST-BOLT-SS316-M10-50', type: 'target', details: 'Harmonized Common Code' },
        { id: 'ATTR_THRD', label: 'Thread: M10 × 1.5 Coarse', type: 'attribute', details: 'Standard metric pitch' },
        { id: 'ATTR_LGT', label: 'Length: 50mm', type: 'attribute', details: 'ISO 4017 standard length' }
      ],
      graphEdges: [
        { from: 'CPCL_B', to: 'CNMC_B', label: 'Reference Record (99.1%)', type: 'exact' },
        { from: 'SAIL_B', to: 'CNMC_B', label: 'Near-Duplicate (95.8%)', type: 'near' },
        { from: 'NTPC_B', to: 'CNMC_B', label: 'Conflict: Pitch 1.25 ≠ 1.5', type: 'conflict' },
        { from: 'CPCL_B', to: 'ATTR_THRD', label: 'Coarse 1.5mm', type: 'attribute' },
        { from: 'SAIL_B', to: 'ATTR_THRD', label: 'Coarse 1.5mm', type: 'attribute' }
      ]
    },

    governance: {
      recommendedCommonCode: 'CNMC-FAST-BOLT-SS316-M10-50',
      defaultStatus: 'pending',
      authority: 'controlled fastener governance reviewer',
      auditTimestamp: '2026-08-25T15:10:00Z',
      guardrailNote: 'AI recommends common mapping. Original SAP and Oracle item tables remain untouched.',
      retainedAliases: [
        { org: 'CPCL', code: 'CPCL-FST-45891', erp: 'SAP S/4HANA MM', status: 'Harmonized' },
        { org: 'SAIL', code: 'SAIL-BOLT-778', erp: 'SAP ECC 6.0', status: 'Harmonized' },
        { org: 'NTPC', code: 'NTPC-FST-9912', erp: 'Oracle SCM Cloud', status: 'Conflict Quarantined' }
      ]
    }
  },

  'pump-impeller': {
    id: 'pump-impeller',
    title: 'Centrifugal Pump Impeller (SS 316, 200mm)',
    category: 'Rotating Equipment & Spares',
    subcategory: 'Centrifugal Process Pump Impellers',
    recommendedCode: 'CNMC-PUMP-IMP-SS316-200',
    mappingVersion: 'v2.4-NMSB-2026',
    controlledDisclaimer: 'governed material identity workspace.',

    intakeSample: {
      org: 'IOCL',
      code: 'IOCL-PMP-88190',
      description: 'IMPELLER ENCLOSED SS316 DIA 200MM',
      uom: 'EA',
      sourceSystem: 'SAP MM (workspace)',
      plant: 'Mathura Refinery FCCU',
      poNumber: 'PO-2025-IOCL-44102',
      scanType: 'DataMatrix QR / RFID'
    },

    fingerprint: {
      category: 'Rotating Equipment',
      type: 'Centrifugal pump impeller',
      material: 'Stainless steel ASTM A351 CF8M (SS 316)',
      nominalDiameter: '200 mm Outer Diameter',
      pressureClass: 'Process Hydraulic (ANSI/API 610)',
      endConnection: 'Keyed Shaft Hub (32 mm bore)',
      standardClue: 'API 610 / ISO 5199',
      uom: 'Each (EA)',
      attributes: [
        { id: 'cat', key: 'category', label: 'Category', rawValue: 'PUMP SPARE', normalizedValue: 'Centrifugal Pump Components (HSN 8413)', standardRef: 'API 610', confidence: 98 },
        { id: 'type', key: 'type', label: 'Type', rawValue: 'IMPELLER ENCLOSED', normalizedValue: 'Closed Radial Vane Impeller', standardRef: 'ISO 5199', confidence: 97 },
        { id: 'mat', key: 'material', label: 'Material Metallurgy', rawValue: 'SS316', normalizedValue: 'Cast Stainless Steel CF8M', standardRef: 'ASTM A351', confidence: 99 },
        { id: 'dia', key: 'nominalDiameter', label: 'Outer Diameter', rawValue: 'DIA 200MM', normalizedValue: '200 mm OD (Bore 32mm)', standardRef: 'ISO 2858', confidence: 100, isNormalized: true, normalizationNote: '200mm outer trim diameter mapped' },
        { id: 'std', key: 'standardClue', label: 'Standard Clue', rawValue: 'API 610', normalizedValue: 'API 610 11th Edition Compliant', standardRef: 'API 610', confidence: 95 },
        { id: 'uom', key: 'uom', label: 'Unit of Measure', rawValue: 'EA', normalizedValue: 'Each (EA)', standardRef: 'UNECE Rec 20', confidence: 100 }
      ]
    },

    candidates: [
      {
        id: 'cand-iocl-pmp',
        org: 'IOCL',
        code: 'IOCL-PMP-88190',
        name: 'IMPELLER ENCLOSED SS316 DIA 200MM',
        plant: 'Mathura Refinery',
        erpSystem: 'SAP MM (workspace)',
        relationship: 'Reference record',
        relationshipNote: 'Baseline intake record.',
        concordance: { composite: 98.4, lexical: 95.0, taxonomy: 99.0, technicalAttributes: 99.2, unit: 100.0, sourceLineage: 100.0 },
        rawAttributes: { 'Material': 'SS316', 'Diameter': '200mm', 'Type': 'Enclosed' }
      },
      {
        id: 'cand-gail-pmp',
        org: 'GAIL',
        code: 'GAIL-PUMP-IMP-200',
        name: '200MM SS 316 CLOSED IMPELLER',
        plant: 'Vijaipur Gas Processing',
        erpSystem: 'SAP S/4HANA (workspace)',
        relationship: 'Near-duplicate candidate',
        relationshipNote: 'Functional equivalent; identical vane contour and hub geometry.',
        concordance: { composite: 96.1, lexical: 92.0, taxonomy: 98.0, technicalAttributes: 98.0, unit: 100.0, sourceLineage: 100.0 },
        rawAttributes: { 'Material': 'SS 316', 'Diameter': '200mm', 'Type': 'Closed' }
      },
      {
        id: 'cand-ongc-pmp',
        org: 'ONGC',
        code: 'ONGC-IMP-220-CF3M',
        name: 'IMPELLER SS 220MM CF3M',
        plant: 'Mumbai High Offshore',
        erpSystem: 'SAP ERP (workspace)',
        relationship: 'Conflict — do not merge',
        relationshipNote: 'Conflict detected: Impeller trim diameter is 220 mm (vs 200 mm target) and metallurgy is low-carbon CF3M (316L). Cannot merge without re-machining.',
        isConflict: true,
        concordance: { composite: 52.1, lexical: 78.0, taxonomy: 92.0, technicalAttributes: 28.0, unit: 100.0, sourceLineage: 100.0 },
        rawAttributes: { 'Material': 'CF3M (Low Carbon)', 'Diameter': '220MM (MISMATCH)', 'Type': 'Radial' }
      }
    ],

    evidence: {
      compositeScore: 97.2,
      lexicalScore: 93.5,
      attributeScore: 98.6,
      taxonomyScore: 98.5,
      unitScore: 100.0,
      lineageScore: 100.0,
      reasons: [
        'Radial closed impeller geometry conforms to ISO 2858 process pump casing dimensions.',
        'SS 316 casting specification aligns across IOCL and GAIL procurement specifications.',
        'Source Lineage Traceability: 100% immutable origin link verified.',
        'Shared emergency inventory potential verified for refinery turnaround operations.'
      ],
      conflictExplanation: 'DIMENSIONAL CONFLICT: ONGC-IMP-220-CF3M has a 220mm outer diameter. Installing a 220mm impeller in a 200mm casing causes severe hydraulic overload or physical clashing. Quarantined automatically.',
      lineageNotes: 'Lineage preserved across IOCL, GAIL, and ONGC with zero master data disruption.',
      graphNodes: [
        { id: 'IOCL_P', label: 'IOCL-PMP-88190 (Ref)', type: 'source', details: 'IOCL · SAP MM (Reference Record)' },
        { id: 'GAIL_P', label: 'GAIL-PUMP-IMP-200', type: 'source', details: 'GAIL · SAP S/4HANA (Near-Duplicate)' },
        { id: 'ONGC_P', label: 'ONGC-IMP-220 (220mm)', type: 'conflict', details: 'ONGC · SAP ERP (Conflict — Do Not Merge)' },
        { id: 'CNMC_P', label: 'CNMC-PUMP-IMP-SS316-200', type: 'target', details: 'Target Harmonized Code' },
        { id: 'ATTR_OD', label: 'Diameter: 200 mm OD', type: 'attribute', details: 'Trim diameter match' }
      ],
      graphEdges: [
        { from: 'IOCL_P', to: 'CNMC_P', label: 'Reference Record (98.4%)', type: 'exact' },
        { from: 'GAIL_P', to: 'CNMC_P', label: 'Near-Duplicate (96.1%)', type: 'near' },
        { from: 'ONGC_P', to: 'CNMC_P', label: 'Conflict: 220mm ≠ 200mm', type: 'conflict' }
      ]
    },

    governance: {
      recommendedCommonCode: 'CNMC-PUMP-IMP-SS316-200',
      defaultStatus: 'pending',
      authority: 'controlled rotating-equipment reviewer',
      auditTimestamp: '2026-08-25T16:00:00Z',
      guardrailNote: 'AI recommends common mapping. Domain rotating equipment engineer signs off.',
      retainedAliases: [
        { org: 'IOCL', code: 'IOCL-PMP-88190', erp: 'SAP MM', status: 'Harmonized' },
        { org: 'GAIL', code: 'GAIL-PUMP-IMP-200', erp: 'SAP S/4HANA', status: 'Harmonized' },
        { org: 'ONGC', code: 'ONGC-IMP-220-CF3M', erp: 'SAP ERP', status: 'Conflict Quarantined' }
      ]
    }
  }
}

// Sandbox scenario data
export interface SandboxScenario {
  id: string
  title: string
  legacyCodes: Array<{ org: string; code: string; desc: string; erp: string }>
  recommendedCNMC: string
  quarantinedConflict: { org: string; code: string; desc: string; reason: string }
  metrics: {
    consolidatedRatio: string
    retainedCount: number
    databaseChanges: number
    traceabilityScore: string
  }
}

export const SANDBOX_SCENARIOS: SandboxScenario[] = [
  {
    id: 'gate-valve',
    title: 'Process Valves · Gate Valve SS 50mm PN16',
    legacyCodes: [
      { org: 'CPCL', code: 'CPCL-VLV-04182', desc: 'SS GATE VALVE 2 IN PN16', erp: 'SAP S/4HANA' },
      { org: 'SAIL', code: 'SAIL-VALVE-G50-16', desc: 'GATE VLV SS316 DN50 PN16 FLANGED', erp: 'SAP ECC 6.0' }
    ],
    recommendedCNMC: 'CNMC-VALVE-GATE-SS-050-PN16',
    quarantinedConflict: {
      org: 'NTPC',
      code: 'NTPC-VLV-3307',
      desc: 'VALVE GATE 50MM SS PN25 FLG',
      reason: 'Pressure rating conflict (PN25 vs PN16 standard). Quarantined to prevent hazardous low-pressure substitution.'
    },
    metrics: {
      consolidatedRatio: '2:1 Harmonized',
      retainedCount: 3,
      databaseChanges: 0,
      traceabilityScore: '100% Proven'
    }
  },
  {
    id: 'fasteners',
    title: 'Fasteners · Metric Machine Bolt SS M10 × 50mm',
    legacyCodes: [
      { org: 'CPCL', code: 'CPCL-FST-45891', desc: 'SS HEX BOLT M10 X 50', erp: 'SAP S/4HANA' },
      { org: 'SAIL', code: 'SAIL-BOLT-778', desc: 'Stainless bolt 10mm x 50mm', erp: 'SAP ECC 6.0' }
    ],
    recommendedCNMC: 'CNMC-FAST-BOLT-SS316-M10-50',
    quarantinedConflict: {
      org: 'NTPC',
      code: 'NTPC-FST-9912',
      desc: 'BOLT SS M10-50 FINE PITCH 1.25',
      reason: 'Thread pitch mismatch (1.25mm fine vs 1.5mm standard coarse). Quarantined to avoid cross-threading.'
    },
    metrics: {
      consolidatedRatio: '2:1 Harmonized',
      retainedCount: 3,
      databaseChanges: 0,
      traceabilityScore: '100% Proven'
    }
  },
  {
    id: 'pump-impeller',
    title: 'Rotating Spares · Centrifugal Impeller SS 316 200mm',
    legacyCodes: [
      { org: 'IOCL', code: 'IOCL-PMP-88190', desc: 'IMPELLER ENCLOSED SS316 DIA 200MM', erp: 'SAP MM' },
      { org: 'GAIL', code: 'GAIL-PUMP-IMP-200', desc: '200MM SS 316 CLOSED IMPELLER', erp: 'SAP S/4HANA' }
    ],
    recommendedCNMC: 'CNMC-PUMP-IMP-SS316-200',
    quarantinedConflict: {
      org: 'ONGC',
      code: 'ONGC-IMP-220-CF3M',
      desc: 'IMPELLER SS 220MM CF3M',
      reason: 'Impeller diameter mismatch (220mm vs 200mm). Quarantined to prevent mechanical casing fouling.'
    },
    metrics: {
      consolidatedRatio: '2:1 Harmonized',
      retainedCount: 3,
      databaseChanges: 0,
      traceabilityScore: '100% Proven'
    }
  }
]
