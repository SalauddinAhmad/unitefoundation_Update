import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { useMemberApps } from "@/hooks/api/useDashboardData";
import { EXTRAS } from "@/lib/localExtras";

const Members = () => {
  const { data = [] } = useMemberApps();
  return (
    <ApplicationsTable
      title="সদস্যপদ"
      subtitle="আজীবন ও দাতা সদস্যপদের আবেদন ম্যানেজ করুন"
      data={data}
      extrasBucket={EXTRAS.members}
      idPrefix="MEM"
      typeOptions={[
        { value: "আজীবন সদস্য (৳৫০,০০০)", label: "আজীবন সদস্য (৳৫০,০০০)" },
        { value: "দাতা সদস্য (৳২৫,০০০)", label: "দাতা সদস্য (৳২৫,০০০)" },
        { value: "সম্মানিত সদস্য (৳১,০০,০০০)", label: "সম্মানিত সদস্য (৳১,০০,০০০)" },
        { value: "সাধারণ সদস্য", label: "সাধারণ সদস্য" },
      ]}
    />
  );
};

export default Members;
