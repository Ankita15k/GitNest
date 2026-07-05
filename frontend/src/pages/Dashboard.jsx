import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchGlobalActivities } from "../api/activityApi";
import ActivityCard from "../components/activity/ActivityCard";

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: () => fetchGlobalActivities(1, 5),
  });

  const activities = data?.activities || [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user?.username ?? "User"}!</p>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>

          <Link to="/activities" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {isLoading ? (
          <p>Loading activities...</p>
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} />
            ))}
          </div>
        ) : (
          <p>No recent activity found.</p>
        )}
      </div>

      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
