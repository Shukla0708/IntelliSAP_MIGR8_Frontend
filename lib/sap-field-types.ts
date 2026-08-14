/** Official SAP CHAR/NUMC lengths. Digit-looking values are still CHAR, never INT.
 *  Generated from backend data/sap_ddic_catalog.json — do not hand-edit lengths.
 */
const SAP_CHAR_LENGTHS: Record<string, number> = {
  auart: 4,
  bankn: 18,
  belnr: 10,
  bukrs: 4,
  companycode: 4,
  distchannel: 2,
  distrchan: 2,
  distributionchannel: 2,
  division: 2,
  divisioncode: 2,
  doctype: 4,
  documenttype: 4,
  ebeln: 10,
  ebelp: 5,
  gjahr: 4,
  iban: 34,
  kostl: 10,
  kunnr: 10,
  land1: 3,
  lgort: 4,
  lifnr: 10,
  matnr: 40,
  mblnr: 10,
  plant: 4,
  plantcode: 4,
  posnr: 6,
  saknr: 10,
  salesorg: 4,
  smtpaddr: 241,
  spart: 2,
  spras: 1,
  storagelocation: 4,
  vbeln: 10,
  vkorg: 4,
  vtweg: 2,
  waerk: 5,
  waers: 5,
  werks: 4,
};

export function sapFieldKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function sapCharLength(fieldName: string): number | null {
  return SAP_CHAR_LENGTHS[sapFieldKey(fieldName)] ?? null;
}
