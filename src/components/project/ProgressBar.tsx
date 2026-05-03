import { toBnNum } from "@/data/projects";

export const ProgressBar = ({
  raised,
  target,
  size = "md",
}: {
  raised: number;
  target: number;
  size?: "sm" | "md";
}) => {
  const pct = Math.min(100, Math.round((raised / target) * 100));
  return (
    <div className="w-full">
      <div className={`w-full bg-muted rounded-full overflow-hidden ${size === "sm" ? "h-1.5" : "h-2"}`}>
        <div
          className="h-full gradient-donate-bg transition-[width] duration-700"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>সংগৃহীত {toBnNum(pct)}%</span>
        <span className="font-medium text-foreground">লক্ষ্য ৳{toBnNum(new Intl.NumberFormat("en-IN").format(target))}</span>
      </div>
    </div>
  );
};
