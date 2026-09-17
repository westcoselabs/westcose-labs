import { SettingsRoute } from "@/components/apps/settings/SettingsRoute";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Settings",
  description: "Display and accessibility settings for WestCose Labs OS.",
  path: "/settings",
});

export default function SettingsPage() {
  return <SettingsRoute />;
}
