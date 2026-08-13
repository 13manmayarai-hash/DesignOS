import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  getCinematicHero,
  getAllSightCards,
  getHeadlineSegments,
  HEADLINE_LAYER_OPTIONS,
} from "@/lib/data/cinematic";
import { publicImageUrl } from "@/lib/storage";
import { FONT_CHOICES, TEXT_CASE_OPTIONS } from "@/lib/fonts";
import { SubmitButton } from "../_components/SubmitButton";
import {
  uploadSkyImageAction,
  removeSkyImageAction,
  uploadSkyVideoAction,
  removeSkyVideoAction,
  uploadGlowImageAction,
  removeGlowImageAction,
  uploadMidgroundImageAction,
  removeMidgroundImageAction,
  uploadSplitframeLeftAction,
  removeSplitframeLeftAction,
  uploadSplitframeRightAction,
  removeSplitframeRightAction,
  uploadMainImageAction,
  removeMainImageAction,
  uploadMainVideoAction,
  removeMainVideoAction,
  uploadCloseupImageAction,
  removeCloseupImageAction,
  updateHeaderAction,
  updateHeroCopyAction,
  updatePanel1Action,
  updatePanel2Action,
  createSightCardAction,
  updateSightCardAction,
  deleteSightCardAction,
  moveSightCardAction,
  uploadSightCardPinAction,
  updateHeadlineThemeColorAction,
  setHeadlineSegmentCountAction,
  updateHeadlineSegmentAction,
  deleteHeadlineSegmentAction,
  moveHeadlineSegmentAction,
} from "./actions";

const inputClass =
  "mt-1.5 w-full max-w-md border border-border-default bg-warm-white px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-ink";
const labelClass = "block text-xs font-medium uppercase tracking-[0.1em] text-text-secondary";
const saveButtonClass =
  "bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-warm-white hover:bg-charcoal/90";
// Tailwind's file: variant styles the native "Choose File" pseudo-button
// (::file-selector-button) -- without it, that button is unstyled and the
// whole input looks like bare unstyled text with no visible control.
const fileInputClass =
  "block w-full max-w-xs text-xs text-text-secondary file:mr-3 file:cursor-pointer file:border file:border-border-default file:bg-warm-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:uppercase file:tracking-[0.08em] file:text-text-primary hover:file:bg-sand/50";

function NumberBadge({ n }: { n: number }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-charcoal text-[10px] font-medium text-warm-white">
      {n}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <polyline points="4 10 8 14 16 6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  );
}

function MediaField({
  n,
  label,
  hint,
  currentPath,
  uploadAction,
  removeAction,
  accept,
  isVideo = false,
}: {
  n: number;
  label: string;
  hint?: string;
  currentPath: string | null;
  uploadAction: (formData: FormData) => Promise<void>;
  removeAction: () => Promise<void>;
  accept: string;
  isVideo?: boolean;
}) {
  const url = currentPath ? publicImageUrl("cinematic-media", currentPath) : null;

  return (
    <div className="ledger-panel">
      <div className="flex items-center gap-2">
        <NumberBadge n={n} />
        <p className="text-sm font-medium text-text-primary">{label}</p>
      </div>
      {hint ? <p className="mt-1 text-xs text-text-secondary">{hint}</p> : null}

      {url ? (
        <div className="relative mt-3 inline-block">
          {isVideo ? (
            <video
              src={url}
              className="h-24 w-40 border border-border-default object-cover"
              muted
              playsInline
            />
          ) : (
            <Image
              src={url}
              alt=""
              width={160}
              height={96}
              className="h-24 w-40 border border-border-default object-cover"
            />
          )}
          <span
            title="Uploaded"
            aria-label="Uploaded"
            className="absolute -bottom-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-warm-white bg-forest text-warm-white shadow"
          >
            <CheckIcon />
          </span>
          <form action={removeAction} className="absolute -top-2 -right-2">
            <SubmitButton
              aria-label="Remove"
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-warm-white bg-stamp-red text-white shadow hover:opacity-90"
            >
              <XIcon />
            </SubmitButton>
          </form>
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border-default text-[9px]">
            !
          </span>
          Not uploaded yet.
        </p>
      )}

      <form action={uploadAction} className="mt-3 flex flex-wrap items-end gap-3">
        <input type="file" name="file" accept={accept} required className={fileInputClass} />
        <SubmitButton pendingLabel="Uploading..." className={saveButtonClass}>
          {url ? "Replace" : "Upload"}
        </SubmitButton>
      </form>
    </div>
  );
}

// Reference sketch of where each numbered element sits on the public hero.
// Not a literal screenshot -- the headline, sight cards, and both story
// panels never appear on screen at the same time -- but a stable spatial
// map is more useful while editing than the numbers alone.
const WIREFRAME_STAGE_PINS = [
  { n: 13, x: 32, y: 26, label: "Header label" },
  { n: 1, x: 80, y: 60, label: "Sky" },
  { n: 2, x: 520, y: 70, label: "Glow" },
  { n: 4, x: 300, y: 118, label: "Headline" },
  { n: 5, x: 300, y: 196, label: "Intro + tags" },
  { n: 6, x: 150, y: 300, label: "Split left" },
  { n: 7, x: 450, y: 300, label: "Split right" },
  { n: 8, x: 300, y: 288, label: "Main image" },
  { n: 9, x: 360, y: 336, label: "Close-up" },
  { n: 3, x: 90, y: 350, label: "Mid-ground" },
  { n: 10, x: 300, y: 408, label: "Sight cards" },
];

function CinematicWireframe() {
  return (
    <div className="ledger-panel">
      <p className={labelClass}>Reference wireframe</p>
      <p className="mt-1 max-w-2xl text-xs text-text-secondary">
        Where each numbered field below actually appears on the hero. The headline, sight cards,
        and the two story panels are staggered across the scroll, not simultaneous -- they&apos;re
        placed together here just to keep every number in one map.
      </p>

      <svg
        viewBox="0 0 900 460"
        role="img"
        aria-label="Wireframe of the cinematic hero showing where each of the 13 numbered elements appears"
        className="mt-4 w-full max-w-3xl"
      >
        <rect x="0" y="0" width="600" height="460" className="fill-sand" />
        <circle cx="520" cy="70" r="46" className="fill-gold" opacity="0.35" />
        <polygon points="0,330 90,300 180,326 260,304 340,330 600,340 600,460 0,460" className="fill-sand-dark" opacity="0.7" />
        <text x="300" y="132" textAnchor="middle" className="fill-text-primary font-display" fontSize="34" fontWeight="600">
          HEADLINE
        </text>
        <text x="300" y="180" textAnchor="middle" className="fill-text-secondary" fontSize="10">
          Intro paragraph
        </text>
        <rect x="220" y="192" width="70" height="18" rx="9" className="fill-warm-white stroke-border-default" />
        <rect x="300" y="192" width="70" height="18" rx="9" className="fill-warm-white stroke-border-default" />
        <rect x="380" y="192" width="70" height="18" rx="9" className="fill-warm-white stroke-border-default" />
        <rect x="110" y="250" width="90" height="110" className="fill-forest" opacity="0.25" />
        <rect x="400" y="250" width="90" height="110" className="fill-forest" opacity="0.25" />
        <ellipse cx="300" cy="310" rx="70" ry="88" className="fill-gold-ink" opacity="0.3" />
        <circle cx="330" cy="345" r="46" className="fill-charcoal" opacity="0.18" />
        <rect x="130" y="392" width="90" height="46" rx="6" className="fill-warm-white stroke-border-default" />
        <rect x="230" y="392" width="90" height="46" rx="6" className="fill-warm-white stroke-border-default" />
        <rect x="330" y="392" width="90" height="46" rx="6" className="fill-warm-white stroke-border-default" />
        <rect x="430" y="392" width="90" height="46" rx="6" className="fill-warm-white stroke-border-default" opacity="0.6" />

        {WIREFRAME_STAGE_PINS.map((pin) => (
          <g key={pin.n}>
            <circle cx={pin.x} cy={pin.y} r="12" className="fill-charcoal" />
            <text x={pin.x} y={pin.y + 4} textAnchor="middle" className="fill-warm-white" fontSize="11" fontWeight="700">
              {pin.n}
            </text>
          </g>
        ))}

        <rect x="624" y="24" width="252" height="150" className="fill-warm-white stroke-border-default" />
        <circle cx="646" cy="46" r="12" className="fill-charcoal" />
        <text x="646" y="50" textAnchor="middle" className="fill-warm-white" fontSize="11" fontWeight="700">
          11
        </text>
        <text x="668" y="50" className="fill-text-primary" fontSize="11" fontWeight="600">
          Story panel 1
        </text>
        <text x="646" y="80" className="fill-text-secondary" fontSize="9">
          Heading, paragraph,
        </text>
        <text x="646" y="94" className="fill-text-secondary" fontSize="9">
          two stat facts
        </text>

        <rect x="624" y="196" width="252" height="150" className="fill-warm-white stroke-border-default" />
        <circle cx="646" cy="218" r="12" className="fill-charcoal" />
        <text x="646" y="222" textAnchor="middle" className="fill-warm-white" fontSize="11" fontWeight="700">
          12
        </text>
        <text x="668" y="222" className="fill-text-primary" fontSize="11" fontWeight="600">
          Story panel 2
        </text>
        <text x="646" y="252" className="fill-text-secondary" fontSize="9">
          Heading, paragraph,
        </text>
        <text x="646" y="266" className="fill-text-secondary" fontSize="9">
          CTA button label
        </text>
      </svg>
    </div>
  );
}

export default async function AdminCinematicPage() {
  const supabase = await createClient();
  const [hero, sightCards, headlineSegments] = await Promise.all([
    getCinematicHero(supabase),
    getAllSightCards(supabase),
    getHeadlineSegments(supabase),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-text-primary">Cinematic hero</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Every layer of the scroll-driven homepage hero, numbered to match the wireframe. Text
          and images/video saved here feed the public homepage once it&apos;s built against this
          content -- nothing here goes live on its own yet.
        </p>
      </div>

      <CinematicWireframe />

      <section className="space-y-4">
        <h2 className="font-display text-xl text-text-primary">Header</h2>
        <div className="ledger-panel">
          <div className="flex items-center gap-2">
            <NumberBadge n={13} />
            <p className="text-sm font-medium text-text-primary">Header logo label</p>
          </div>
          <form action={updateHeaderAction} className="mt-3">
            <label htmlFor="headerLogoLabel" className={labelClass}>
              Text shown top-left of the hero
            </label>
            <input
              id="headerLogoLabel"
              name="headerLogoLabel"
              defaultValue={hero.header_logo_label ?? ""}
              placeholder="Shangdhan Pine Homestay"
              className={inputClass}
            />
            <SubmitButton pendingLabel="Saving..." className={`${saveButtonClass} mt-3`}>
              Save
            </SubmitButton>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-text-primary">Background layers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField
            n={1}
            label="Sky / farthest background -- image"
            hint="Full-bleed backdrop behind everything else."
            currentPath={hero.sky_image_path}
            uploadAction={uploadSkyImageAction}
            removeAction={removeSkyImageAction}
            accept="image/*"
          />
          <MediaField
            n={1}
            label="Sky / farthest background -- video (optional)"
            hint="If set, this plays instead of the sky image."
            currentPath={hero.sky_video_path}
            uploadAction={uploadSkyVideoAction}
            removeAction={removeSkyVideoAction}
            accept="video/mp4"
            isVideo
          />
          <MediaField
            n={2}
            label="Atmospheric glow layer"
            hint="Soft decorative layer blended over the sky."
            currentPath={hero.glow_image_path}
            uploadAction={uploadGlowImageAction}
            removeAction={removeGlowImageAction}
            accept="image/*"
          />
          <MediaField
            n={3}
            label="Mid-ground scene layer"
            hint="e.g. garden, valley, or tree line behind the main subject."
            currentPath={hero.midground_image_path}
            uploadAction={uploadMidgroundImageAction}
            removeAction={removeMidgroundImageAction}
            accept="image/*"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-text-primary">Headline &amp; intro</h2>
        <div className="ledger-panel">
          <div className="flex items-center gap-2">
            <NumberBadge n={4} />
            <p className="text-sm font-medium text-text-primary">
              Hero headline + intro paragraph + highlight tags
            </p>
          </div>
          <form action={updateHeroCopyAction} className="mt-3 space-y-4">
            <div>
              <label htmlFor="heroHeadline" className={labelClass}>
                Headline (short -- this renders very large)
              </label>
              <input
                id="heroHeadline"
                name="heroHeadline"
                defaultValue={hero.hero_headline ?? ""}
                placeholder="KAFFER"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <NumberBadge n={5} />
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-text-secondary">
                Intro paragraph + highlight tags
              </p>
            </div>
            <div>
              <label htmlFor="introParagraph" className={labelClass}>
                Intro paragraph
              </label>
              <textarea
                id="introParagraph"
                name="introParagraph"
                defaultValue={hero.intro_paragraph ?? ""}
                rows={3}
                className={`${inputClass} max-w-xl`}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="heroTag1" className={labelClass}>
                  Tag 1
                </label>
                <input
                  id="heroTag1"
                  name="heroTag1"
                  defaultValue={hero.hero_tag_1 ?? ""}
                  placeholder="Pine forest views"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="heroTag2" className={labelClass}>
                  Tag 2
                </label>
                <input
                  id="heroTag2"
                  name="heroTag2"
                  defaultValue={hero.hero_tag_2 ?? ""}
                  placeholder="Kalimpong homestay"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="heroTag3" className={labelClass}>
                  Tag 3
                </label>
                <input
                  id="heroTag3"
                  name="heroTag3"
                  defaultValue={hero.hero_tag_3 ?? ""}
                  placeholder="Sunrise over Kanchenjunga"
                  className={inputClass}
                />
              </div>
            </div>
            <SubmitButton pendingLabel="Saving..." className={saveButtonClass}>
              Save
            </SubmitButton>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-text-primary">Headline word-by-word styling</h2>
        <p className="text-sm text-text-secondary">
          Optional: style the headline one word (or one letter, if you type the headline with a
          space between each letter) at a time -- its own font, size, case, color, and a position
          nudge with a front/behind layer. Leave this empty and the plain headline above is used
          as-is.
        </p>

        <div className="ledger-panel">
          <p className={labelClass}>Theme color</p>
          <p className="mt-1 text-xs text-text-secondary">
            The default color every word uses unless it sets its own color below.
          </p>
          <form action={updateHeadlineThemeColorAction} className="mt-3 flex items-center gap-3">
            <input
              type="color"
              name="headlineThemeColor"
              defaultValue={hero.headline_theme_color ?? "#fdf1e1"}
              className="h-10 w-16 cursor-pointer border border-border-default bg-warm-white"
            />
            <SubmitButton pendingLabel="Saving..." className={saveButtonClass}>
              Save theme color
            </SubmitButton>
          </form>
        </div>

        <div className="ledger-panel">
          <p className={labelClass}>Number of words</p>
          <form action={setHeadlineSegmentCountAction} className="mt-3 flex items-end gap-3">
            <div>
              <label htmlFor="wordCount" className="sr-only">
                Number of words
              </label>
              <input
                id="wordCount"
                type="number"
                name="wordCount"
                min={0}
                max={50}
                defaultValue={headlineSegments.length}
                className={`${inputClass} max-w-[8rem]`}
              />
            </div>
            <SubmitButton pendingLabel="Updating..." className={saveButtonClass}>
              Update word count
            </SubmitButton>
          </form>
          <p className="mt-2 text-xs text-text-secondary">
            Raising this adds blank words at the end; lowering it removes the last ones. Currently{" "}
            {headlineSegments.length} word{headlineSegments.length === 1 ? "" : "s"}.
          </p>
        </div>

        {headlineSegments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {headlineSegments.map((segment, i) => (
              <div key={segment.id} className="ledger-panel">
                <form
                  action={updateHeadlineSegmentAction.bind(null, segment.id)}
                  className="space-y-3"
                >
                  <div>
                    <label htmlFor={`text-${segment.id}`} className={labelClass}>
                      Word {i + 1}
                    </label>
                    <input
                      id={`text-${segment.id}`}
                      name="text"
                      defaultValue={segment.text}
                      placeholder="e.g. KAFFER"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor={`font-${segment.id}`} className={labelClass}>
                      Font
                    </label>
                    <select
                      id={`font-${segment.id}`}
                      name="fontChoice"
                      defaultValue={segment.font_choice ?? ""}
                      className={inputClass}
                    >
                      <option value="">Use site font</option>
                      {FONT_CHOICES.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`case-${segment.id}`} className={labelClass}>
                        Letter case
                      </label>
                      <select
                        id={`case-${segment.id}`}
                        name="textCase"
                        defaultValue={segment.text_case}
                        className={inputClass}
                      >
                        {TEXT_CASE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`size-${segment.id}`} className={labelClass}>
                        Size (&times; headline size)
                      </label>
                      <input
                        id={`size-${segment.id}`}
                        type="number"
                        name="sizeMultiplier"
                        min={0.2}
                        max={3}
                        step={0.05}
                        defaultValue={segment.size_multiplier}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-text-secondary">
                      <input
                        type="checkbox"
                        name="useThemeColor"
                        defaultChecked={!segment.color}
                        className="h-4 w-4"
                      />
                      Use theme color
                    </label>
                    <input
                      type="color"
                      name="color"
                      defaultValue={segment.color ?? "#fdf1e1"}
                      className="mt-2 h-10 w-16 cursor-pointer border border-border-default bg-warm-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`offset-x-${segment.id}`} className={labelClass}>
                        Left / right
                      </label>
                      <input
                        id={`offset-x-${segment.id}`}
                        type="number"
                        name="offsetX"
                        min={-10}
                        max={10}
                        step={0.1}
                        defaultValue={segment.offset_x}
                        placeholder="-left / +right"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`offset-y-${segment.id}`} className={labelClass}>
                        Up / down
                      </label>
                      <input
                        id={`offset-y-${segment.id}`}
                        type="number"
                        name="offsetY"
                        min={-10}
                        max={10}
                        step={0.1}
                        defaultValue={segment.offset_y}
                        placeholder="-up / +down"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Both are in font-size units, not pixels -- 1 is roughly one letter-width, and
                    they scale down with the headline on smaller screens automatically.
                  </p>

                  <div>
                    <label htmlFor={`layer-${segment.id}`} className={labelClass}>
                      Layer
                    </label>
                    <select
                      id={`layer-${segment.id}`}
                      name="layer"
                      defaultValue={segment.layer}
                      className={inputClass}
                    >
                      {HEADLINE_LAYER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <SubmitButton pendingLabel="Saving..." className={`${saveButtonClass} w-full`}>
                    Save word {i + 1}
                  </SubmitButton>
                </form>

                <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3 text-xs text-text-secondary">
                  <div className="flex gap-3">
                    <form action={moveHeadlineSegmentAction.bind(null, segment.id, "up")}>
                      <SubmitButton disabled={i === 0} className="disabled:opacity-30">
                        &uarr; Move up
                      </SubmitButton>
                    </form>
                    <form action={moveHeadlineSegmentAction.bind(null, segment.id, "down")}>
                      <SubmitButton
                        disabled={i === headlineSegments.length - 1}
                        className="disabled:opacity-30"
                      >
                        Move down &darr;
                      </SubmitButton>
                    </form>
                  </div>
                  <form action={deleteHeadlineSegmentAction.bind(null, segment.id)}>
                    <SubmitButton
                      pendingLabel="Deleting..."
                      className="font-medium text-stamp-red hover:underline"
                    >
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-text-primary">Split-frame &amp; foreground</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField
            n={6}
            label="Split-frame -- left half"
            currentPath={hero.splitframe_left_path}
            uploadAction={uploadSplitframeLeftAction}
            removeAction={removeSplitframeLeftAction}
            accept="image/*"
          />
          <MediaField
            n={7}
            label="Split-frame -- right half"
            currentPath={hero.splitframe_right_path}
            uploadAction={uploadSplitframeRightAction}
            removeAction={removeSplitframeRightAction}
            accept="image/*"
          />
          <MediaField
            n={8}
            label="Main foreground hero -- image"
            hint="The centerpiece subject, e.g. the homestay building."
            currentPath={hero.main_image_path}
            uploadAction={uploadMainImageAction}
            removeAction={removeMainImageAction}
            accept="image/*"
          />
          <MediaField
            n={8}
            label="Main foreground hero -- video (optional)"
            hint="If set, this plays instead of the main image."
            currentPath={hero.main_video_path}
            uploadAction={uploadMainVideoAction}
            removeAction={removeMainVideoAction}
            accept="video/mp4"
            isVideo
          />
          <MediaField
            n={9}
            label="Close-up reveal image"
            hint="Second scene revealed later in the scroll, e.g. a room interior."
            currentPath={hero.closeup_image_path}
            uploadAction={uploadCloseupImageAction}
            removeAction={removeCloseupImageAction}
            accept="image/*"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <NumberBadge n={10} />
          <h2 className="font-display text-xl text-text-primary">
            Sight cards (designed for up to 5)
          </h2>
        </div>
        <p className="text-sm text-text-secondary">
          The slider of nearby highlights. Each card has an icon, a short kicker, a title, and a
          one-line description.
        </p>

        <div className="ledger-panel">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-text-secondary">
            Add a card
          </p>
          <form action={createSightCardAction} className="mt-3 grid gap-3 sm:grid-cols-3">
            <input name="kicker" placeholder="Kicker (e.g. Viewpoint)" className={inputClass} />
            <input name="title" placeholder="Title" className={inputClass} />
            <input name="description" placeholder="Description" className={inputClass} />
            <SubmitButton
              pendingLabel="Adding..."
              className={`${saveButtonClass} sm:col-span-3 sm:w-fit`}
            >
              Add card
            </SubmitButton>
          </form>
        </div>

        {sightCards.length === 0 ? (
          <p className="text-sm text-text-secondary">No sight cards yet -- add the first above.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sightCards.map((card, i) => {
              const pinUrl = card.pin_icon_path
                ? publicImageUrl("cinematic-media", card.pin_icon_path)
                : null;
              return (
                <div key={card.id} className="ledger-panel">
                  <div className="flex items-center gap-3">
                    {pinUrl ? (
                      <div className="relative shrink-0">
                        <Image
                          src={pinUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 border border-border-default object-contain"
                        />
                        <span
                          title="Uploaded"
                          aria-label="Uploaded"
                          className="absolute -bottom-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-warm-white bg-forest text-warm-white"
                        >
                          <CheckIcon />
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-dashed border-sand-dark text-[10px] text-text-secondary">
                        icon
                      </div>
                    )}
                    <form
                      action={uploadSightCardPinAction.bind(null, card.id)}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input type="file" name="pin" accept="image/*" required className={fileInputClass} />
                      <SubmitButton
                        pendingLabel="Uploading..."
                        className="text-xs font-medium text-gold-ink hover:text-text-primary"
                      >
                        {pinUrl ? "Replace icon" : "Upload icon"}
                      </SubmitButton>
                    </form>
                  </div>

                  <form
                    action={updateSightCardAction.bind(null, card.id)}
                    className="mt-4 space-y-2"
                  >
                    <input
                      name="kicker"
                      defaultValue={card.kicker ?? ""}
                      placeholder="Kicker"
                      className={inputClass}
                    />
                    <input
                      name="title"
                      defaultValue={card.title ?? ""}
                      placeholder="Title"
                      className={inputClass}
                    />
                    <input
                      name="description"
                      defaultValue={card.description ?? ""}
                      placeholder="Description"
                      className={inputClass}
                    />
                    <label className="flex items-center gap-2 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        name="published"
                        defaultChecked={card.published}
                        className="h-4 w-4"
                      />
                      Published
                    </label>
                    <SubmitButton
                      pendingLabel="Saving..."
                      className="w-full border border-charcoal px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-charcoal hover:bg-charcoal hover:text-warm-white"
                    >
                      Save
                    </SubmitButton>
                  </form>

                  <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex gap-3">
                      <form action={moveSightCardAction.bind(null, card.id, "up")}>
                        <SubmitButton disabled={i === 0} className="disabled:opacity-30">
                          &uarr; Move up
                        </SubmitButton>
                      </form>
                      <form action={moveSightCardAction.bind(null, card.id, "down")}>
                        <SubmitButton
                          disabled={i === sightCards.length - 1}
                          className="disabled:opacity-30"
                        >
                          Move down &darr;
                        </SubmitButton>
                      </form>
                    </div>
                    <form action={deleteSightCardAction.bind(null, card.id)}>
                      <SubmitButton pendingLabel="Deleting..." className="font-medium text-stamp-red hover:underline">
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <NumberBadge n={11} />
          <h2 className="font-display text-xl text-text-primary">Story panel 1</h2>
        </div>
        <div className="ledger-panel">
          <form action={updatePanel1Action} className="space-y-4">
            <div>
              <label htmlFor="panel1Heading" className={labelClass}>
                Heading
              </label>
              <input
                id="panel1Heading"
                name="panel1Heading"
                defaultValue={hero.panel1_heading ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="panel1Paragraph" className={labelClass}>
                Paragraph
              </label>
              <textarea
                id="panel1Paragraph"
                name="panel1Paragraph"
                defaultValue={hero.panel1_paragraph ?? ""}
                rows={3}
                className={`${inputClass} max-w-xl`}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="panel1Fact1Value" className={labelClass}>
                    Fact 1 value
                  </label>
                  <input
                    id="panel1Fact1Value"
                    name="panel1Fact1Value"
                    defaultValue={hero.panel1_fact1_value ?? ""}
                    placeholder="2019"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="panel1Fact1Label" className={labelClass}>
                    Fact 1 label
                  </label>
                  <input
                    id="panel1Fact1Label"
                    name="panel1Fact1Label"
                    defaultValue={hero.panel1_fact1_label ?? ""}
                    placeholder="Homestay opened"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="panel1Fact2Value" className={labelClass}>
                    Fact 2 value
                  </label>
                  <input
                    id="panel1Fact2Value"
                    name="panel1Fact2Value"
                    defaultValue={hero.panel1_fact2_value ?? ""}
                    placeholder="6,200 ft"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="panel1Fact2Label" className={labelClass}>
                    Fact 2 label
                  </label>
                  <input
                    id="panel1Fact2Label"
                    name="panel1Fact2Label"
                    defaultValue={hero.panel1_fact2_label ?? ""}
                    placeholder="Elevation"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
            <SubmitButton pendingLabel="Saving..." className={saveButtonClass}>
              Save
            </SubmitButton>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <NumberBadge n={12} />
          <h2 className="font-display text-xl text-text-primary">Story panel 2</h2>
        </div>
        <div className="ledger-panel">
          <form action={updatePanel2Action} className="space-y-4">
            <div>
              <label htmlFor="panel2Heading" className={labelClass}>
                Heading
              </label>
              <input
                id="panel2Heading"
                name="panel2Heading"
                defaultValue={hero.panel2_heading ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="panel2Paragraph" className={labelClass}>
                Paragraph
              </label>
              <textarea
                id="panel2Paragraph"
                name="panel2Paragraph"
                defaultValue={hero.panel2_paragraph ?? ""}
                rows={3}
                className={`${inputClass} max-w-xl`}
              />
            </div>
            <div>
              <label htmlFor="panel2CtaLabel" className={labelClass}>
                Button label
              </label>
              <input
                id="panel2CtaLabel"
                name="panel2CtaLabel"
                defaultValue={hero.panel2_cta_label ?? ""}
                placeholder="Open the garden notes"
                className={inputClass}
              />
            </div>
            <SubmitButton pendingLabel="Saving..." className={saveButtonClass}>
              Save
            </SubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
