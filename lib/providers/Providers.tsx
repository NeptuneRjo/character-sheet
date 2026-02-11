import { ReactNode } from "react";
import { SheetProvider } from "./SheetProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return <SheetProvider>{children}</SheetProvider>;
}
