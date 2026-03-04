import { ReactNode } from "react";
import { SheetProvider } from "./SheetProvider";
import { GMPanelProvider } from "./GMPanelProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GMPanelProvider>
      <SheetProvider>{children}</SheetProvider>
    </GMPanelProvider>
  );
}
