import { permanentRedirect } from "next/navigation";

export default function NormalCompatibilityRedirect() {
  permanentRedirect("/?view=normal");
}
