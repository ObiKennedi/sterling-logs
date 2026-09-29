import { Loader } from "@/components/Loader";

export default function Loading() {
  return (
    <Loader
      fullScreen
      variant="orbital"
      size="lg"
      showBrand
      showEscrowBadge
      text="Loading Sterling Logs..."
      subtext="Establishing encrypted connection to verified logs inventory..."
    />
  );
}
