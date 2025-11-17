import { useNavigate } from "react-router-dom";
import { Brain, TrendingUp, Database, LogOut, Activity } from "lucide-react";

function TrainerSidebar({ activeMenuItem, setActiveMenuItem, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-secondary-3 text-white flex flex-col shadow-xl">
      
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold block">TRAINER</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

        {/* Data Management */}
        <button
          onClick={() => {
            setActiveMenuItem("overview");
            navigate("/tableview");
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeMenuItem === "overview"
              ? "bg-secondary-3 color-primary-3 font-bold"
              : "text-white bg-secondary-3 font-bold hover:bg-teal-700"
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="font-medium">Data Management</span>
        </button>

        {/* ML Training */}
        <button
          onClick={() => {
            setActiveMenuItem("training");
            navigate("/training");
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeMenuItem === "training"
              ? "bg-secondary-3 color-primary-3 font-bold"
              : "text-white bg-secondary-3  font-bold hover:bg-teal-700"
          }`}
        >
          <Brain className="w-5 h-5" />
          <span className="font-medium">ML Training</span>
        </button>

        {/* Model Testing */}
        <button
          onClick={() => {
            setActiveMenuItem("training-trainer");
            navigate("/training-trainer");
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeMenuItem === "training-trainer"
              ? "bg-secondary-3 color-primary-3 font-bold"
              : "text-white bg-secondary-3  font-bold hover:bg-teal-700"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">Model Testing</span>
        </button>

        {/* Divider */}
        <div className="my-4 border-t border-white"></div>

        {/* Info Card */}
        <div className="bg-white rounded-lg p-4 border border-2">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 color-secondary-3" />
            <span className="text-xs font-bold color-secondary-3">Quick Info</span>
          </div>
          <p className="text-xs color-secondary-3 leading-relaxed">
            Manage ML models, test predictions, and maintain training datasets.
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

export default TrainerSidebar;
