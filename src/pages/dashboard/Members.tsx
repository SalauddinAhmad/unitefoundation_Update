import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { useMemberApps } from "@/hooks/api/useDashboardData";

const Members = () => {
  const { data = [] } = useMemberApps();
  return (
    <ApplicationsTable
      title="সদস্যপদ"
      subtitle="আজীবন ও দাতা সদস্যপদের আবেদন ম্যানেজ করুন"
      data={data}
    />
  );
};

export default Members;
