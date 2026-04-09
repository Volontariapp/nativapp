import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "@/config/base-config";
import { logger } from "../src/utils/logger";

export default function RootLayout(): React.JSX.Element {
  logger.log("✅ [Config] Validated and loaded successfully!");

  return (
    <>
      <StatusBar style="auto" />
      <Slot />
    </>
  );
}
