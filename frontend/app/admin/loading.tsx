import { Loader } from "@/components/Loader";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-24">
      <Loader />
    </div>
  );
}
