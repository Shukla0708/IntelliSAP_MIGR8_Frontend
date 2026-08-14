/** Official SAP CHAR/NUMC lengths. Digit-looking values are still CHAR, never INT. */
const SAP_CHAR_LENGTHS: Record<string, number> = {
  vbeln: 10,
  belnr: 10,
  kunnr: 10,
  lifnr: 10,
  matnr: 40,
  vkorg: 4,
  salesorg: 4,
  vtweg: 2,
  distrchan: 2,
  distchannel: 2,
  distributionchannel: 2,
  spart: 2,
  division: 2,
  divisioncode: 2,
  auart: 4,
  doctype: 4,
  documenttype: 4,
  bukrs: 4,
  companycode: 4,
  werks: 4,
  plant: 4,
  plantcode: 4,
  gjahr: 4,
  posnr: 6,
  waers: 5,
  waerk: 5,
  land1: 3,
  spras: 2,
};

export function sapFieldKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function sapCharLength(fieldName: string): number | null {
  return SAP_CHAR_LENGTHS[sapFieldKey(fieldName)] ?? null;
}
