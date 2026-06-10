import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router";

interface PermissionRouteProps {
  requiredPermission: string | string[];
}

function hasPermission(permissions: string[], requiredPermission: string | string[]) {
  return Array.isArray(requiredPermission)
    ? requiredPermission.some((permission) => permissions.includes(permission))
    : permissions.includes(requiredPermission);
}

export default function PermissionRoute({
  requiredPermission,
}: PermissionRouteProps) {
  const { permissions, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!hasPermission(permissions, requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
