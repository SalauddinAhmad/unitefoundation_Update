import { Navigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Permission } from "@/lib/permissions";

interface Props {
  children: React.ReactNode;
  permission?: Permission;
}

export const RequireAuth = ({ children, permission }: Props) => {
  const { isAuthenticated, can, role } = useAuth();
  const loc = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (permission && !can(permission)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-bold text-lg">অ্যাক্সেস নেই</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            এই সেকশনটি দেখার অনুমতি আপনার রোলে ({role || "—"}) নেই। প্রয়োজন হলে Super Admin-এর সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
