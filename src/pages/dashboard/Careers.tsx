import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { useCareerApps } from "@/hooks/api/useDashboardData";

const Careers = () => {
  const { data = [] } = useCareerApps();
  return (
    <ApplicationsTable
      title="ক্যারিয়ার আবেদন"
      subtitle="চাকরি প্রার্থীদের আবেদন পর্যালোচনা করুন"
      data={data}
    />
  );
};

export default Careers;
