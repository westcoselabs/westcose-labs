"use client";
import dynamic from "next/dynamic";
import { GameExit } from "../GameHost";
const Game = dynamic(() => import("./LowTideLootMount"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "grid",
        placeContent: "center",
        gap: 20,
      }}
    >
      <p role="status">Heading to the coast…</p>
      <GameExit />
    </div>
  ),
});
export function LowTideLootLauncher() {
  return <Game />;
}
