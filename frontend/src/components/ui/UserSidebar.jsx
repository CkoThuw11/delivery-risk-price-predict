import { useNavigate } from "react-router-dom";
import { 
  TrendingUp,
  LogOut,
  User,
  Activity
} from "lucide-react";

function UserSidebar({ activeMenuItem, setActiveMenuItem, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-secondary-3 text-white text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-white-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold block">USER</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        
        {/* Predicting */}
        <button
          onClick={() => {
            setActiveMenuItem("predicting");
            navigate("/predicting");
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            (activeMenuItem === "overview" || activeMenuItem ==="predicting")
               ? "bg-secondary-3 color-primary-3 font-bold"
              : "text-white bg-secondary-3 font-bold hover:bg-teal-700"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">Predicting</span>
        </button>

        {/* Divider */}
        <div className="my-4 border-t border-white-700"></div>

        {/* Info Card */}
        <div className="bg-white rounded-lg p-4 border-2">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 color-secondary-3" />
            <span className="text-xs font-bold color-secondary-3">Welcome!</span>
          </div>
          <p className="text-xs color-secondary-3 leading-relaxed">
            Use the prediction tool to analyze and forecast delivery outcomes based on order data.
          </p>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-3"
          >
            <LogOut className="w-5 h-5 color-primary-3" />
            <span className="font-medium color-primary-3 font-bold">Logout</span>
          </button>
        </div>
      </div>
  );
}

export default UserSidebar;
