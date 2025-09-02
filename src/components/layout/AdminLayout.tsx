import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';

const AdminLayout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
