// src/app/(dashboard)/settings/page.tsx
import { getUserProfile } from "@/actions/profile";
import { PrivacyToggle } from "./privacy-toggle";

const INK = "#17233C";
const CREAM = "#F5EEDA";
const CARD = "#FBF7EC";
const LINE = "#C9BC98";
const MUTED = "#5B5638";

export default async function SettingsPage() {
  const result = await getUserProfile();

  if (!result.success || !result.data) {
    return (
      <div
        className="rounded-sm border px-6 py-8 text-center"
        style={{ borderColor: LINE, backgroundColor: CARD }}
      >
        <p className="text-sm" style={{ color: "#8A2A1E" }}>
          {result.error ??
            "We couldn't load your settings. Please refresh the page."}
        </p>
      </div>
    );
  }

  const profile = result.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: INK }}>
          Settings
        </h1>
        <p className="text-sm" style={{ color: MUTED }}>
          Manage how {profile.displayName} appears to the community.
        </p>
      </div>

      <div
        className="max-w-lg overflow-hidden rounded-sm"
        style={{ border: `1px solid ${LINE}`, backgroundColor: CARD }}
      >
        <div className="px-5 py-3" style={{ backgroundColor: INK }}>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: CREAM }}
          >
            Privacy
          </p>
        </div>
        <div className="px-5 py-5">
          <PrivacyToggle initialOptIn={profile.privacyOptIn} />
        </div>
      </div>
    </div>
  );
}
