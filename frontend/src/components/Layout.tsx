import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from './AuthProvider';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate({ to: '/login' });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">BudgetMaster</h1>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4 mr-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 [&.active]:text-blue-600 [&.active]:font-semibold">Dashboard</Link>
            <Link to="/transactions" className="text-gray-600 hover:text-blue-600 [&.active]:text-blue-600 [&.active]:font-semibold">Transactions</Link>
            <Link to="/assets" className="text-gray-600 hover:text-blue-600 [&.active]:text-blue-600 [&.active]:font-semibold">Assets</Link>
            <Link to="/history" className="text-gray-600 hover:text-blue-600 [&.active]:text-blue-600 [&.active]:font-semibold">History</Link>
          </nav>
          <span className="text-sm text-gray-500">{user.email}</span>
          <button onClick={() => logout()} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Logout</button>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
