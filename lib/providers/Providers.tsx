import { ReactNode } from "react";
import { SheetProvider } from "./SheetProvider";
import { GMPanelProvider } from "./GMPanelProvider";
import { CombatProvider } from "./CombatProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GMPanelProvider>
      <CombatProvider>
        <SheetProvider>{children}</SheetProvider>
      </CombatProvider>
    </GMPanelProvider>
  );
}
