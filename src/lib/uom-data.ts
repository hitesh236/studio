
export type SimpleUnit = {
  id: string;
  name: string;
  abbreviation: string;
  status?: 'active' | 'disabled';
};

export type CompoundUnit = {
  id: string;
  firstUnit: SimpleUnit;
  conversion: number;
  secondUnit: SimpleUnit;
};

export const initialSimpleUnits: SimpleUnit[] = [
  { id: 'pcs', name: 'Pieces', abbreviation: 'pcs', status: 'active' },
  { id: 'box', name: 'Box', abbreviation: 'box', status: 'active' },
  { id: 'dz', name: 'Dozen', abbreviation: 'dz', status: 'active' },
  { id: 'kg', name: 'Kilogram', abbreviation: 'kg', status: 'active' },
  { id: 'g', name: 'Gram', abbreviation: 'g', status: 'active' },
  { id: 'l', name: 'Liter', abbreviation: 'L', status: 'active' },
  { id: 'ml', name: 'Milliliter', abbreviation: 'ml', status: 'active' },
  { id: 'm', name: 'Meter', abbreviation: 'm', status: 'active' },
  { id: 'cm', name: 'Centimeter', abbreviation: 'cm', status: 'active' },
  { id: 'in', name: 'Inch', abbreviation: 'in', status: 'active' },
  { id: 'ft', name: 'Feet', abbreviation: 'ft', status: 'active' },
  { id: 'pr', name: 'Pair', abbreviation: 'pr', status: 'active' },
  { id: 'set', name: 'Set', abbreviation: 'set', status: 'active' },
  { id: 'pkt', name: 'Packet', abbreviation: 'pkt', status: 'active' },
  { id: 'roll', name: 'Roll', abbreviation: 'roll', status: 'active' },
  { id: 'btl', name: 'Bottle', abbreviation: 'btl', status: 'active' },
  { id: 'bag', name: 'Bag', abbreviation: 'bag', status: 'active' },
  { id: 'can', name: 'Can', abbreviation: 'can', status: 'active' },
  { id: 'ctn', name: 'Carton', abbreviation: 'ctn', status: 'active' },
  { id: 'nos', name: 'Numbers', abbreviation: 'nos', status: 'active' },
  { id: 'sqft', name: 'Square Feet', abbreviation: 'sq.ft.', status: 'active' },
  { id: 'unit', name: 'Unit', abbreviation: 'unit', status: 'disabled' },
];

const simpleUnitMap = new Map(initialSimpleUnits.map(u => [u.id, u]));

export const initialCompoundUnits: CompoundUnit[] = [
    { id: 'dz-pcs-12', firstUnit: simpleUnitMap.get('dz')!, conversion: 12, secondUnit: simpleUnitMap.get('pcs')! },
    { id: 'box-pcs-10', firstUnit: simpleUnitMap.get('box')!, conversion: 10, secondUnit: simpleUnitMap.get('pcs')! },
    { id: 'kg-g-1000', firstUnit: simpleUnitMap.get('kg')!, conversion: 1000, secondUnit: simpleUnitMap.get('g')! },
    { id: 'l-ml-1000', firstUnit: simpleUnitMap.get('l')!, conversion: 1000, secondUnit: simpleUnitMap.get('ml')! },
    { id: 'm-cm-100', firstUnit: simpleUnitMap.get('m')!, conversion: 100, secondUnit: simpleUnitMap.get('cm')! },
    { id: 'ft-in-12', firstUnit: simpleUnitMap.get('ft')!, conversion: 12, secondUnit: simpleUnitMap.get('in')! },
    { id: 'pr-pcs-2', firstUnit: simpleUnitMap.get('pr')!, conversion: 2, secondUnit: simpleUnitMap.get('pcs')! },
    { id: 'ctn-box-10', firstUnit: simpleUnitMap.get('ctn')!, conversion: 10, secondUnit: simpleUnitMap.get('box')! },
];
