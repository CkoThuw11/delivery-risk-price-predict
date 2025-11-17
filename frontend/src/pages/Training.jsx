import { useState, useEffect } from 'react';
import { apiFetch } from "../utils/apiFetch";
import { 
  Play,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save
} from 'lucide-react';


const ModelTraining = () => {
  const [modelConfig, setModelConfig] = useState({
    model_name: 'ExtraTrees',
    resampling_method: 'ROS',
    test_size: 0.2,
    random_state: 42
  });
  const [training, setTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState(null);
  const [error, setError] = useState('');

  const handleTrain = async () => {
    setTraining(true);
    setError('');
    setTrainingResult(null);

    try {

      const response = await apiFetch('http://localhost:8000/order/train-model/', {
        method: "POST",
        body: JSON.stringify(modelConfig)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTrainingResult(data);

      sessionStorage.setItem("trainedModelMetrics", JSON.stringify(data.metrics));
      sessionStorage.setItem("trainedModelConfig", JSON.stringify({
        model_name: data.model_name,
        resampling_method: data.resampling_method,
        random_state: data.random_state
      }));

      window.dispatchEvent(new Event("modelTrained"));

    } catch (err) {
      console.error("Training error:", err);
      setError(err.message || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="bg-[#DAFFFF] rounded-2xl shadow-lg p-6 border-2 border-teal-200">
      <div className="flex items-center gap-3 mb-6">
        <Play className="w-6 h-6 text-teal-600" />
        <h2 className="text-xl font-bold text-teal-700">Training Model</h2>
      </div>

      <div className="space-y-4 mb-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Model</label>
          <div className="flex gap-2">
            {['ExtraTrees', 'RandomForest', 'DecisionTree'].map(model => (
              <button
                key={model}
                onClick={() => setModelConfig({ ...modelConfig, model_name: model })}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  modelConfig.model_name === model
                    ? 'bg-[#5F9F9F] text-white'
                    : 'bg-white text-teal-700 border-2 border-teal-200 hover:bg-gray-100'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        {/* Resampling Method */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Resampling Method</label>
          <div className="flex flex-wrap gap-2">
            {['ROS', 'RUS', 'SMOTE', 'allKNN', 'SMOTETomek'].map(method => (
              <button
                key={method}
                onClick={() => setModelConfig({ ...modelConfig, resampling_method: method })}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  modelConfig.resampling_method === method
                    ? 'bg-[#5F9F9F] text-white'
                    : 'bg-white text-teal-700 border-2 border-teal-200 hover:bg-gray-100'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Random State Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Random State</label>
         <input
            type="number"
            value={modelConfig.random_state ?? ""}
            onChange={(e) =>
              setModelConfig({
                ...modelConfig,
                random_state: e.target.value === "" ? "" : parseInt(e.target.value, 10),
              })
            }
            min="0"
            className="w-full px-4 py-2.5 bg-white text-teal-700 border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            placeholder="Enter random state (e.g., 42)"
          />
          <p className="text-xs text-gray-600 mt-1">Use the same value to reproduce results</p>
        </div>

        {/* Test Size Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Test Size</label>
          <input
            type="number"
            value={modelConfig.test_size}
            onChange={(e) => setModelConfig({ 
              ...modelConfig, 
              test_size: parseFloat(e.target.value) || 0.2 
            })}
            min="0.1"
            max="0.9"
            step="0.1"
            className="w-full px-4 py-2.5 bg-white text-teal-700 border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-600 mt-1">Proportion of test data (0.1 - 0.9)</p>
        </div>
      </div>

      {/* Train Button */}
      <button
        onClick={handleTrain}
        disabled={training}
        className="w-full bg-[#5F9F9F] text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {training ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Training...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Train model
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Training Result */}
      {trainingResult && (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 font-semibold">Training Completed Successfully! ✓</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ModelEvaluation = () => {
  const [metrics, setMetrics] = useState({
    accuracy: "",
    precision: "",
    recall: "",
    f1_score: ""
  });

  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleTrainingFinished = () => {
      setMetrics({
        accuracy: "",
        precision: "",
        recall: "",
        f1_score: ""
      });
      setConfig(null);
      setError("");
    };

    window.addEventListener("modelTrained", handleTrainingFinished);
    return () => window.removeEventListener("modelTrained", handleTrainingFinished);
  }, []);

  const loadMetrics = () => {
    const storedMetrics = sessionStorage.getItem("trainedModelMetrics");
    const storedConfig = sessionStorage.getItem("trainedModelConfig");

    if (!storedMetrics) {
      setError("No metrics found. Train a model first.");
      setMetrics({
        accuracy: "",
        precision: "",
        recall: "",
        f1_score: ""
      });
      return;
    }

    setError("");
    setMetrics(JSON.parse(storedMetrics));
    if (storedConfig) setConfig(JSON.parse(storedConfig));
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-amber-700 " />
        <h2 className="text-xl font-bold text-amber-700">Model Evaluation</h2>
      </div>

      <div className="p-4 mb-4 bg-white rounded-xl shadow border border-blue-100">
        <p className="text-amber-700 font-bold text-sm">Model: {config?.model_name || "—"}</p>
        <p className="text-amber-700 font-bold text-sm">Resampling: {config?.resampling_method || "—"}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-sm font-bold text-amber-700 capitalize">
              {key.replace("_", " ")}
            </span>
            <input
              type="text"
              value={value === "" ? "" : Number(value).toFixed(4)}
              readOnly
              placeholder="—"
              className="w-32 px-3 py-2 bg-gray-50 border border-gray-300 text-amber-700 rounded text-right text-sm font-bold"
            />
          </div>
        ))} 
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-semibold">{error}</p>
        </div>
      )}

      <button
        onClick={loadMetrics}
        className="w-full mt-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <BarChart3 className="w-5 h-5" />
        Evaluate
      </button>
    </div>
  );
};

const ModelSaveLoad = ({ onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const handleTrainingFinished = () => {
      setMessage(null);
    };

    window.addEventListener("modelTrained", handleTrainingFinished);
    return () => window.removeEventListener("modelTrained", handleTrainingFinished);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      
      const response = await apiFetch("http://localhost:8000/order/save-model/", {
        method: "POST"
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessage({
        type: "success",
        title: "Model Saved Successfully! ✓",
        text: data.message,
        details: data.file_name
      });

      if (onSuccess) {
        onSuccess(data);
      }
      setTimeout(() => {
        setMessage(null);
      }, 5000);

    } catch (err) {
      console.error("Save model error:", err);
      setMessage({
        type: "error",
        title: "Save Failed",
        text: err.message || "Failed to save the model"
      });
      
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <Save className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-green-700">Save Model</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Save the currently trained model to persistent storage for future use.
      </p>
      
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving Model...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Current Trained Model
          </>
        )}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3 animate-in slide-in-from-top duration-300 ${
            message.type === "success"
              ? "bg-green-50 border-green-500"
              : "bg-red-50 border-red-500"
          }`}
        >
          <div className="flex-shrink-0 pt-0.5">
            {message.type === "success" ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>

          <div className="flex-1">
            <p
              className={`font-semibold ${
                message.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {message.title}
            </p>
            <p
              className={`text-sm mt-1 ${
                message.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message.text}
            </p>
            {message.details && (
              <p
                className={`text-xs mt-2 font-mono p-2 rounded ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                File: {message.details}
              </p>
            )}
          </div>

          <button
            onClick={() => setMessage(null)}
            className={`flex-shrink-0 pt-0.5 hover:opacity-70 transition-opacity ${
              message.type === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};


const MLManagementPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ML Operations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ModelTraining />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <ModelEvaluation />
          </div>
        </div>
             <ModelSaveLoad />
      </div>
    </div>
  );
};

export default MLManagementPage;