import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings";
import { publicImageUrl } from "@/lib/storage";
import { CUSTOM_FONT_FAMILY, fontFormatFromPath } from "@/lib/fonts";
import {
  updateGstSettingsAction,
  uploadPaymentQrAction,
  removePaymentQrAction,
  updateTypographySettingsAction,
  uploadCustomFontAction,
  removeCustomFontAction,
} from "./actions";
import { StampBadge } from "../_components/StampBadge";
import { SubmitButton } from "../_components/SubmitButton";
import { TypographySettingsForm } from "./_components/TypographySettingsForm";

const inputClass =
  "mt-1.5 w-full max-w-sm border border-border-default bg-warm-white px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-ink";
const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);
  const qrUrl = settings.payment_qr_storage_path
    ? publicImageUrl("payment-qr", settings.payment_qr_storage_path)
    : null;
  const customFontUrl = settings.display_font_custom_storage_path
    ? publicImageUrl("custom-fonts", settings.display_font_custom_storage_path)
    : null;

  return (
    <div className="space-y-10">
      {customFontUrl ? (
        <style>{`
          @font-face {
            font-family: '${CUSTOM_FONT_FAMILY}';
            src: url('${customFontUrl}') format('${fontFormatFromPath(settings.display_font_custom_storage_path!)}');
            font-display: swap;
          }
        `}</style>
      ) : null}

      <div>
        <h1 className="font-display text-3xl text-text-primary">Settings</h1>
        <p className="mt-2 text-sm text-text-secondary">
          GST registration, the UPI payment QR code, and the public site&apos;s display
          typography.
        </p>
      </div>

      <section className="ledger-panel">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl text-text-primary">GST</h2>
          <StampBadge tone={settings.gst_applicable ? "confirmed" : "muted"}>
            {settings.gst_applicable ? "Registered" : "Not registered"}
          </StampBadge>
        </div>
        <form action={updateGstSettingsAction} className="mt-5 space-y-4">
          <div>
            <label htmlFor="gstApplicable" className={labelClass}>
              GST applicable
            </label>
            <select
              id="gstApplicable"
              name="gstApplicable"
              defaultValue={settings.gst_applicable ? "yes" : "no"}
              className={inputClass}
            >
              <option value="no">No -- not GST-registered</option>
              <option value="yes">Yes -- GST-registered</option>
            </select>
          </div>
          <div>
            <label htmlFor="gstin" className={labelClass}>
              GSTIN
            </label>
            <input
              id="gstin"
              name="gstin"
              defaultValue={settings.gstin ?? ""}
              placeholder="15-character GSTIN"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-text-secondary">Only used when GST applicable is Yes.</p>
          </div>
          <SubmitButton
            pendingLabel="Saving..."
            className="bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-warm-white hover:bg-charcoal/90"
          >
            Save
          </SubmitButton>
        </form>
        <p className="mt-4 max-w-lg text-xs text-text-secondary">
          When applicable, checkout automatically applies 5% GST on accommodation (18% for nights
          over &#8377;7,500), plus 5% on activities -- split as CGST+SGST for West Bengal guests or
          IGST otherwise. When not applicable, no tax is added.
        </p>
      </section>

      <section className="ledger-panel">
        <h2 className="font-display text-xl text-text-primary">Payment QR code</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Upload a screenshot of your UPI QR code (from your bank or UPI app). Guests scan this at
          checkout instead of a generated code.
        </p>

        {qrUrl ? (
          <div className="mt-4 flex items-center gap-6">
            <Image
              src={qrUrl}
              alt="Current UPI payment QR code"
              width={160}
              height={160}
              className="border border-border-default object-contain"
            />
            <form action={removePaymentQrAction}>
              <SubmitButton
                pendingLabel="Removing..."
                className="text-xs font-medium text-stamp-red hover:underline"
              >
                Remove QR code
              </SubmitButton>
            </form>
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-secondary">No QR code uploaded yet.</p>
        )}

        <form action={uploadPaymentQrAction} className="mt-5 flex flex-wrap items-end gap-4">
          <div>
            <label className={labelClass}>{qrUrl ? "Replace QR code" : "Upload QR code"}</label>
            <input
              type="file"
              name="qrImage"
              accept="image/*"
              required
              className="mt-1.5 text-sm text-text-secondary"
            />
          </div>
          <SubmitButton
            pendingLabel="Uploading..."
            className="bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-warm-white hover:bg-charcoal/90"
          >
            Upload
          </SubmitButton>
        </form>
      </section>

      <section className="ledger-panel">
        <h2 className="font-display text-xl text-text-primary">Typography</h2>
        <p className="mt-2 text-sm text-text-secondary">
          The display font used for headings and the hero headline on the public site and booking
          flow -- pick one below, or upload your own. This doesn&apos;t change the admin
          dashboard, which stays on Roboto.
        </p>

        <TypographySettingsForm
          action={updateTypographySettingsAction}
          initialFontChoice={settings.display_font_choice}
          initialTextCase={settings.display_text_case}
          initialSmallCaps={settings.display_small_caps}
          initialLetterSpacing={settings.display_letter_spacing}
          customFontFamily={customFontUrl ? CUSTOM_FONT_FAMILY : null}
        />

        <div className="mt-6 border-t border-border-default pt-5">
          <p className={labelClass}>Custom font file</p>
          <p className="mt-1 text-xs text-text-secondary">
            .woff2, .woff, .ttf, or .otf. Uploading one adds it as a selectable option above.
          </p>
          {customFontUrl ? (
            <form action={removeCustomFontAction} className="mt-2">
              <SubmitButton
                pendingLabel="Removing..."
                className="text-xs font-medium text-stamp-red hover:underline"
              >
                Remove uploaded font
              </SubmitButton>
            </form>
          ) : null}
          <form action={uploadCustomFontAction} className="mt-3 flex flex-wrap items-end gap-4">
            <input
              type="file"
              name="fontFile"
              accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
              required
              className="text-sm text-text-secondary"
            />
            <SubmitButton
              pendingLabel="Uploading..."
              className="border border-charcoal px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-charcoal hover:bg-charcoal hover:text-warm-white"
            >
              {customFontUrl ? "Replace" : "Upload"}
            </SubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
