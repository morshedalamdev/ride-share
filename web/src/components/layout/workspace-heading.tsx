import { MapPin } from "lucide-react";

export function WorkspaceHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 lg:mb-7">
      <div>
        <h1 className="text-[2.1rem] leading-[1.1] font-semibold tracking-[-0.065em] sm:text-[2.65rem]">
          {title}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted sm:text-[14px]">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-medium">
        <MapPin size={15} className="text-accent" />
        San Francisco, CA
      </div>
    </div>
  );
}
