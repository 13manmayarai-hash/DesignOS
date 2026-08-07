// Motion values mirrored from DesignOS Book 04 (Motion System). Referenced
// by name from components -- never hard-code a duration or easing locally.
// Tuned per the build brief: --motion subtle, so this build only draws on
// the `section` duration and `standard` easing for scroll reveals.

export const duration = {
  sectionMs: 720,
} as const;

export const ease = {
  standardCss: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;
