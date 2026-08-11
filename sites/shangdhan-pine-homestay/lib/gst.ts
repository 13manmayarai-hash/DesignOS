// Indian hospitality GST rules: accommodation is 5% up to Rs 7,500/night,
// 18% above that; food/activities are a flat 5%. Split as CGST+SGST when
// the guest's GST state matches the property's (West Bengal, code 19),
// otherwise charged as IGST. Ported from HomestayOS's compliance.ts.

export const PROPERTY_GST_STATE_CODE = "19"; // West Bengal

export type GstBreakdown = {
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};

export function calculateHospitalityGst({
  accommodationTotal,
  activitiesTotal,
  isGstCompliant,
  guestStateCode,
}: {
  accommodationTotal: number;
  activitiesTotal: number;
  isGstCompliant: boolean;
  guestStateCode: string;
}): GstBreakdown {
  const subtotal = accommodationTotal + activitiesTotal;
  if (!isGstCompliant) {
    return { cgst: 0, sgst: 0, igst: 0, total: subtotal };
  }

  const accommodationTaxRate = accommodationTotal > 7500 ? 0.18 : accommodationTotal > 0 ? 0.05 : 0;
  const grandTaxTotal = accommodationTotal * accommodationTaxRate + activitiesTotal * 0.05;

  const isIntraState = guestStateCode === PROPERTY_GST_STATE_CODE;
  const cgst = isIntraState ? grandTaxTotal / 2 : 0;
  const sgst = isIntraState ? grandTaxTotal / 2 : 0;
  const igst = isIntraState ? 0 : grandTaxTotal;

  return { cgst, sgst, igst, total: subtotal + grandTaxTotal };
}

// States guests commonly arrive from -- kept short since this is a single
// dropdown field, not a full state list. West Bengal first since it's the
// property's own state (intra-state CGST+SGST split).
export const GST_STATE_OPTIONS = [
  { label: "West Bengal", value: "19" },
  { label: "Sikkim", value: "11" },
  { label: "Bihar", value: "10" },
  { label: "Delhi", value: "07" },
  { label: "Maharashtra", value: "27" },
  { label: "Karnataka", value: "29" },
  { label: "Tamil Nadu", value: "33" },
  { label: "Other / not sure", value: "00" },
];
