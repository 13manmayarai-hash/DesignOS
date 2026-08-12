import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { property } from "@/lib/property-config";
import { gstStateLabel } from "@/lib/gst";
import type { AdminBooking } from "@/lib/data/admin-bookings";
import type { Settings } from "@/lib/data/settings";

// SAC (Services Accounting Code) under India's GST: 996311 covers room
// accommodation, 996312 covers food and other ancillary services -- these
// are fixed codes, not configurable, so they live here rather than in
// property-config.ts.
const ACCOMMODATION_SAC = "996311";
const FOOD_SAC = "996312";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#2b2620", fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  propertyName: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  muted: { color: "#6b6355" },
  invoiceTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#6b6355",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  col: { flexDirection: "column" },
  table: { marginTop: 8, borderTop: "1pt solid #d8d0c0", borderBottom: "1pt solid #d8d0c0" },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottom: "1pt solid #d8d0c0",
    fontFamily: "Helvetica-Bold",
  },
  tableRow: { flexDirection: "row", paddingVertical: 6 },
  cellDescription: { flex: 3 },
  cellSac: { flex: 1, textAlign: "center" },
  cellAmount: { flex: 1, textAlign: "right" },
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 220, justifyContent: "space-between", marginBottom: 4 },
  grandTotalRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1pt solid #2b2620",
    fontFamily: "Helvetica-Bold",
  },
  footer: { marginTop: 32, fontSize: 8, color: "#6b6355", textAlign: "center" },
});

function formatInr(amount: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

export function InvoicePdf({
  booking,
  settings,
  invoiceNumber,
}: {
  booking: AdminBooking;
  settings: Settings;
  invoiceNumber: string;
}) {
  const issuedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const nights = Math.max(
    1,
    Math.round(
      (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  const gstApplicable = settings.gst_applicable;
  const isIntraState = booking.igst_amount === 0;

  return (
    <Document
      title={`${invoiceNumber} -- ${property.name}`}
      author={property.name}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.propertyName}>{property.name}</Text>
            <Text style={styles.muted}>{property.location}</Text>
            {gstApplicable && settings.gstin ? (
              <Text style={styles.muted}>GSTIN: {settings.gstin}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>
              {gstApplicable ? "TAX INVOICE" : "INVOICE"}
            </Text>
            <Text style={styles.muted}>{invoiceNumber}</Text>
            <Text style={styles.muted}>Issued {issuedDate}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Billed to</Text>
            <Text>{booking.guest_name}</Text>
            <Text style={styles.muted}>{booking.guest_phone}</Text>
            {booking.guest_email ? <Text style={styles.muted}>{booking.guest_email}</Text> : null}
            <Text style={styles.muted}>
              {booking.guest_nationality}
              {booking.guest_nationality === "Indian" && booking.guest_state_code
                ? ` -- ${gstStateLabel(booking.guest_state_code)}`
                : ""}
            </Text>
          </View>
          <View style={[styles.col, { alignItems: "flex-end" }]}>
            <Text style={styles.sectionLabel}>Stay</Text>
            <Text>
              {booking.check_in} to {booking.check_out}
            </Text>
            <Text style={styles.muted}>
              {nights} night{nights > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.cellDescription}>Description</Text>
            <Text style={styles.cellSac}>SAC</Text>
            <Text style={styles.cellAmount}>Amount</Text>
          </View>
          {booking.booking_items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.cellDescription}>
                {item.quantity}x {item.room_name}
              </Text>
              <Text style={styles.cellSac}>{ACCOMMODATION_SAC}</Text>
              <Text style={styles.cellAmount}>{formatInr(item.price_at_booking)}</Text>
            </View>
          ))}
          {booking.booking_activities.map((activity) => (
            <View key={activity.id} style={styles.tableRow}>
              <Text style={styles.cellDescription}>{activity.activity_title}</Text>
              <Text style={styles.cellSac}>{FOOD_SAC}</Text>
              <Text style={styles.cellAmount}>{formatInr(activity.price_at_booking)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text>Subtotal</Text>
            <Text>{formatInr(booking.accommodation_total + booking.activities_total)}</Text>
          </View>
          {gstApplicable ? (
            isIntraState ? (
              <>
                <View style={styles.totalsRow}>
                  <Text>CGST</Text>
                  <Text>{formatInr(booking.cgst_amount)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text>SGST</Text>
                  <Text>{formatInr(booking.sgst_amount)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.totalsRow}>
                <Text>IGST</Text>
                <Text>{formatInr(booking.igst_amount)}</Text>
              </View>
            )
          ) : null}
          <View style={styles.grandTotalRow}>
            <Text>Total</Text>
            <Text>{formatInr(booking.total_amount)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          {gstApplicable
            ? "Computer-generated invoice -- no signature required."
            : "This property is not GST-registered -- no tax has been charged on this invoice."}
        </Text>
      </Page>
    </Document>
  );
}
