
export type SimpleUnit = {
  id: string;
  name: string;
  abbreviation: string;
};

export type CompoundUnit = {
  id: string;
  firstUnit: SimpleUnit;
  conversion: number;
  secondUnit: SimpleUnit;
};

export const initialSimpleUnits: SimpleUnit[] = [
  { id: 'pcs', name: 'Pieces', abbreviation: 'pcs' },
  { id: 'box', name: 'Box', abbreviation: 'box' },
  { id: 'dz', name: 'Dozen', abbreviation: 'dz' },
  { id: 'kg', name: 'Kilogram', abbreviation: 'kg' },
  { id: 'g', name: 'Gram', abbreviation: 'g' },
  { id: 'mg', name: 'Milligram', abbreviation: 'mg' },
  { id: 'l', name: 'Liter', abbreviation: 'L' },
  { id: 'ml', name: 'Milliliter', abbreviation: 'ml' },
  { id: 'm', name: 'Meter', abbreviation: 'm' },
  { id: 'cm', name: 'Centimeter', abbreviation: 'cm' },
  { id: 'in', name: 'Inch', abbreviation: 'in' },
  { id: 'ft', name: 'Feet', abbreviation: 'ft' },
  { id: 'pr', name: 'Pair', abbreviation: 'pr' },
  { id: 'set', name: 'Set', abbreviation: 'set' },
  { id: 'pkt', name: 'Packet', abbreviation: 'pkt' },
  { id: 'roll', name: 'Roll', abbreviation: 'roll' },
  { id: 'btl', name: 'Bottle', abbreviation: 'btl' },
];

export const initialCompoundUnits: CompoundUnit[] = [
    { id: 'dz-pcs-12', firstUnit: {id: 'dz', name: 'Dozen', abbreviation: 'dz'}, conversion: 12, secondUnit: {id: 'pcs', name: 'Pieces', abbreviation: 'pcs'} },
    { id: 'box-pcs-10', firstUnit: {id: 'box', name: 'Box', abbreviation: 'box'}, conversion: 10, secondUnit: {id: 'pcs', name: 'Pieces', abbreviation: 'pcs'} },
    { id: 'kg-g-1000', firstUnit: {id: 'kg', name: 'Kilogram', abbreviation: 'kg'}, conversion: 1000, secondUnit: {id: 'g', name: 'Gram', abbreviation: 'g'} },
    { id: 'g-mg-1000', firstUnit: {id: 'g', name: 'Gram', abbreviation: 'g'}, conversion: 1000, secondUnit: {id: 'mg', name: 'Milligram', abbreviation: 'mg'} },
    { id: 'l-ml-1000', firstUnit: {id: 'l', name: 'Liter', abbreviation: 'L'}, conversion: 1000, secondUnit: {id: 'ml', name: 'Milliliter', abbreviation: 'ml'} },
    { id: 'm-cm-100', firstUnit: {id: 'm', name: 'Meter', abbreviation: 'm'}, conversion: 100, secondUnit: {id: 'cm', name: 'Centimeter', abbreviation: 'cm'} },
    { id: 'ft-in-12', firstUnit: {id: 'ft', name: 'Feet', abbreviation: 'ft'}, conversion: 12, secondUnit: {id: 'in', name: 'Inch', abbreviation: 'in'} },
    { id: 'pr-pcs-2', firstUnit: {id: 'pr', name: 'Pair', abbreviation: 'pr'}, conversion: 2, secondUnit: {id: 'pcs', name: 'Pieces', abbreviation: 'pcs'} },
];
