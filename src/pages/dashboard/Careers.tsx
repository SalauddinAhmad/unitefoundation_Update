import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { useCareerApps } from "@/hooks/api/useDashboardData";
import { EXTRAS } from "@/lib/localExtras";

// Divisions of Bangladesh — used as type filter for district-rep applications
const DIVISIONS = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

const DistrictReps = () => {
  const { data = [] } = useCareerApps();
  return (
    <ApplicationsTable
      title="জেলা প্রতিনিধি আবেদন"
      subtitle="জেলা প্রতিনিধি প্রার্থীদের আবেদন পর্যালোচনা ও অনুমোদন করুন"
      data={data}
      extrasBucket={EXTRAS.careers}
      idPrefix="DR"
      typeOptions={DIVISIONS.map((d) => ({ value: d, label: d }))}
    />
  );
};

export default DistrictReps;
