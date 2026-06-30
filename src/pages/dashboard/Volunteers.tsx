import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { useVolunteerApps } from "@/hooks/api/useDashboardData";

const Volunteers = () => {
  const { data = [] } = useVolunteerApps();
  return (
    <ApplicationsTable
      title="স্বেচ্ছাসেবক"
      subtitle="স্বেচ্ছাসেবক আবেদন পর্যালোচনা ও অনুমোদন করুন"
      data={data}
    />
  );
};

export default Volunteers;
