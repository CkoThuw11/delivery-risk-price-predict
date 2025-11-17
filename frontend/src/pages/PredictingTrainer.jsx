import { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import { Truck, DollarSign, ClipboardCheck, Loader2, FileUp, FolderUp} from "lucide-react";
import FormRow from "../components/ui/FormRow";
import { cityCoordinates } from "../data/locationCoordinates";
import geoData from "../data/geographic_input_data.json";

export default function TrainerPredictingPage() {

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [loadedModel, setLoadedModel] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [predictionResult, setPredictionResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    payment_type: "",
    shipping_mode: "",
    customer_city: "",
    customer_state: "",
    order_region: "",
    order_country: "",
    order_city: "",
    order_state: "",
    order_status: "",
    category_name: "",
    department_name: "",
    days_for_shipment_scheduled: "",
    order_item_discount_rate: "",
    order_item_product_price: "",
    order_item_quantity: "",
    cost: "",
  });

  const paymentTypes = [
    { value: "DEBIT", label: "Debit" },
    { value: "CASH", label: "Cash" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "PAYMENT", label: "Payment" },
    { value: "CREDIT", label: "Credit" },
  ];

  const shippingModes = [
    { value: "Same Day", label: "Same Day" },
    { value: "First Class", label: "First Class" },
    { value: "Second Class", label: "Second Class" },
    { value: "Standard Class", label: "Standard Class" },
  ];

  const orderStatuses = [
    { value: "COMPLETE", label: "Complete" },
    { value: "PENDING", label: "Pending" },
    { value: "CLOSED", label: "Closed" },
    { value: "PENDING_PAYMENT", label: "Pending Payment" },
    { value: "CANCELED", label: "Canceled" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SUSPECTED_FRAUD", label: "Suspected Fraud" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "PAYMENT_REVIEW", label: "Payment Review" },
  ];

  const CategoryNames = [
    { value: "Accessories", label: "Accessories" },
    { value: "Baseball & Softball", label: "Baseball & Softball" },
    { value: "Books", label: "Books" },
    { value: "Cameras", label: "Cameras" },
    { value: "Children's Clothing", label: "Children's Clothing" },
    { value: "Computers", label: "Computers" },
    { value: "Garden", label: "Garden" },
    { value: "Music", label: "Music" },
  ];

  const departmentNames = [
    { value: "Fitness", label: "Fitness" },
    { value: "Apparel", label: "Apparel" },
    { value: "Golf", label: "Golf" },
    { value: "Footwear", label: "Footwear" },
    { value: "Outdoors", label: "Outdoors" },
    { value: "Fan Shop", label: "Fan Shop" },
    { value: "Technology", label: "Technology" },
    { value: "Book Shop", label: "Book Shop" },
    { value: "Discs Shop", label: "Discs Shop" },
    { value: "Pet Shop", label: "Pet Shop" },
    { value: "Health and Beauty", label: "Health and Beauty" },
  ];

  const cityOptions = Object.keys(cityCoordinates || {}).map((city) => ({
    value: city,
    label: city,
  }));

  const [coords, setCoords] = useState({
    latitude: null,
    longitude: null,
  });

  // Fetch saved models
  const fetchModels = async () => {
  try {
    const res = await apiFetch("http://localhost:8000/order/list-models/", {
      method: "GET",
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData?.error || `HTTP error! Status: ${res.status}`);
    }

      const data = await res.json();
      const modelList = Array.isArray(data.models) ? data.models : [];
      setModels(modelList);

    } catch (err) {
      console.error("fetchModels error:", err);
      setMessage({ type: "error", text: err.message || "Failed to fetch models" });
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

 const handleLoadModel = async () => {
  if (!selectedModel) {
    setMessage({ type: "error", text: "Select a model to load" });
    return;
  }

  try {
    const res = await apiFetch("http://localhost:8000/order/load-model/", {
      method: "POST",
      body: JSON.stringify({ filename: selectedModel }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData?.error || `HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    setLoadedModel(data.model_metadata);
    setMessage({ type: "success", text: data.message || "Model loaded" });

  } catch (err) {
    console.error("loadModel error:", err);
    setMessage({ type: "error", text: err.message || "Load failed" });
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;

    const newForm = { ...formData, [name]: value };
    setFormData(newForm);

    if (name === "customer_city" || name === "order_city") {
      const cityInfo = cityCoordinates[value];
      if (cityInfo) {
        setCoords({ latitude: cityInfo.lat ?? null, longitude: cityInfo.lon ?? null });
        const autoState = cityInfo.state || "";
        if (name === "customer_city") {
          setFormData((prev) => ({ ...prev, customer_state: autoState }));
        } else {
          setFormData((prev) => ({ ...prev, order_state: autoState }));
        }
      }
    }

    if (name === "order_region") {
      const regionCountries = Object.keys(geoData[value] || {});
      setCountries(regionCountries.map((c) => ({ value: c, label: c })));
      setCities([]);
      setStates([]);
      setFormData((prev) => ({
        ...prev,
        order_country: "",
        order_city: "",
        order_state: "",
      }));
    }

    if (name === "order_country") {
      const region = newForm.order_region;
      const cityList = region && geoData[region] && geoData[region][value] ? Object.keys(geoData[region][value]) : [];
      setCities(cityList.map((c) => ({ value: c, label: c })));
      setStates([]);
      setFormData((prev) => ({ ...prev, order_city: "", order_state: "" }));
    }
    if (name === "order_city") {
      const { order_region, order_country } = newForm;
      const stateList =
        order_region && order_country && geoData[order_region] && geoData[order_region][order_country]
          ? geoData[order_region][order_country][value] || []
          : [];
      setStates(stateList.map((s) => ({ value: s, label: s })));
      setFormData((prev) => ({ ...prev, order_state: "" }));
    }
  };

  const safeParseInt = (v, fallback = null) => {
    if (v === null || v === undefined || v === "") return fallback;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? fallback : n;
  };

  const safeParseFloat = (v, fallback = null) => {
    if (v === null || v === undefined || v === "") return fallback;
    const n = parseFloat(v);
    return Number.isNaN(n) ? fallback : n;
  };

  const handlePredict = async () => {
  if (!loadedModel) {
    setPredictionResult("Please load a model first.");
    return;
  }

  const payload = {
    payment_type: formData.payment_type || null,
    shipping_mode: formData.shipping_mode || null,
    customer_city: formData.customer_city || null,
    customer_state: formData.customer_state || null,
    order_region: formData.order_region || null,
    order_country: formData.order_country || null,
    order_city: formData.order_city || null,
    order_state: formData.order_state || null,
    order_status: formData.order_status || null,
    category_name: formData.category_name || null,
    department_name: formData.department_name || null,
    days_for_shipment_scheduled: safeParseInt(formData.days_for_shipment_scheduled, null),
    order_item_discount_rate: safeParseFloat(formData.order_item_discount_rate, null),
    order_item_product_price: safeParseFloat(formData.order_item_product_price, null),
    order_item_quantity: safeParseInt(formData.order_item_quantity, null),
    cost: safeParseFloat(formData.cost, null),
    latitude: coords.latitude,
    longitude: coords.longitude,
  };

  setIsLoading(true);
  setPredictionResult("");

  try {
    const res = await apiFetch("http://localhost:8000/order/predicting-trained/", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData?.error || `HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();

    const labelNum = data?.prediction;
    const probNum = data?.probability;

    const label = labelNum === 1 ? "Late" : labelNum === 0 ? "On Time" : "Unknown";
    const prob = typeof probNum === "number" ? (probNum * 100).toFixed(2) : null;

    setPredictionResult(prob ? `${label} (${prob}%)` : label);

  } catch (error) {
    console.error("prediction error:", error);
    setPredictionResult("Error predicting. Try again.");
    setMessage({ type: "error", text: "Prediction request failed." });
  } finally {
    setIsLoading(false);
  }
};
  const predictionColorClass = () => {
    if (!predictionResult) return "text-gray-400";
    if (predictionResult.startsWith("Late")) return "text-red-600";
    if (predictionResult.startsWith("On Time")) return "text-green-600";
    return "text-gray-600";
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto">
       {/* LOAD MODEL */}
        <div className="bg-secondary-4 rounded-2xl shadow-lg p-6 border-2 border-secondary-color-3 w-full mb-6">
          <div class ="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary-3 rounded-lg">
              <FolderUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold color-secondary-3">Load Model</h2>
          </div>
            <select
            className="w-full p-3 border-2 rounded-xl mb-4 bg-accent-4 color-secondary-3 "
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            >
            <option value="">Select a saved model</option>
            {models.map((m) => (
                <option
                key={typeof m === "string" ? m : m.filename}
                value={typeof m === "string" ? m : m.filename}
                >
                {typeof m === "string" ? m : m.filename}
                </option>
            ))}
            </select>
            
            <div class="flex justify-center">
                <button
                onClick={handleLoadModel}
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-12 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                < FileUp className="w-5 h-5"/>
                Load Selected Model
              </button>
            </div>
          
            {message.text && (
            <p
                className={`mt-2 text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
                } text-center`}
            >
                {message.text}
            </p>
            )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-[1200px] mx-auto mb-8">
        {/* Shipment Details */}
        <div className="flex-1 bg-secondary-4 rounded-3xl p-6 shadow-lg border-secondary-color-3">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-secondary-color-3-teal-300">
            <div className="p-2 bg-secondary-3 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold color-secondary-3">Shipment Details</h2>
          </div>

          <div className="space-y-4">
            {/* Payment Type */}
            <FormRow label="Payment Type" name="payment_type" select value={formData.payment_type} onChange={handleChange} options={paymentTypes} />

            {/* Shipping Mode */}
            <FormRow label="Shipping Mode" name="shipping_mode" select value={formData.shipping_mode} onChange={handleChange} options={shippingModes} />

            {/* Customer City */}
            <FormRow label="Customer City" name="customer_city" select value={formData.customer_city} onChange={handleChange} options={cityOptions} />

            {/* Order Region */}
            <FormRow label="Order Region" name="order_region" select value={formData.order_region} onChange={handleChange} options={Object.keys(geoData).map((r) => ({ value: r, label: r }))} />

            {/* Order Country */}
            <FormRow label="Order Country" name="order_country" select value={formData.order_country} onChange={handleChange} options={countries} />

            {/* Order City */}
            <FormRow label="Order City" name="order_city" select value={formData.order_city} onChange={handleChange} options={cities} />

            {/* Order State */}
            <FormRow label="Order State" name="order_state" select value={formData.order_state} onChange={handleChange} options={states} />

            {/* Order Status */}
            <FormRow label="Order Status" name="order_status" select value={formData.order_status} onChange={handleChange} options={orderStatuses} />
          </div>
        </div>

        {/*Products and Cost */}
        <div className="flex-1 bg-secondary-4 rounded-3xl p-6 shadow-lg border-secondary-color-3">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-secondary-color-3-teal-300">
            <div className="p-2 bg-secondary-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-teal-800">Products and Cost</h2>
          </div>

          <div className="space-y-4">
            {/* FormRow components */}
            <FormRow label="Category Name" name="category_name" select value={formData.category_name} onChange={handleChange} options={CategoryNames} />
            <FormRow label="Department Name" name="department_name" select value={formData.department_name} onChange={handleChange} options={departmentNames} />
            <FormRow label="Days for shipment (scheduled)" name="days_for_shipment_scheduled" value={formData.days_for_shipment_scheduled} onChange={handleChange} type="number" />
            <FormRow label="Order Item Discount Rate" name="order_item_discount_rate" value={formData.order_item_discount_rate} onChange={handleChange} type="number" step="0.01" />
            <FormRow label="Order Item Product Price" name="order_item_product_price" value={formData.order_item_product_price} onChange={handleChange} type="number" step="0.01" />
            <FormRow label="Order Item Quantity" name="order_item_quantity" value={formData.order_item_quantity} onChange={handleChange} type="number" />
            <FormRow label="Cost" name="cost" value={formData.cost} onChange={handleChange} type="number" step="0.01" />
          </div>

          {/* Predict Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePredict}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-12 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-5 h-5" />
                  Predict
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full Width Below */}
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-secondary-4 rounded-3xl p-6 shadow-lg border-secondary-color-3">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-secondary-color-3-teal-300">
            <div className="p-2 bg-secondary-3 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-teal-800">Prediction Result</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 h-[140px] flex items-center justify-center border-secondary-color-3">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <p className="text-gray-500 text-sm">Analyzing...</p>
              </div>
            ) : (
              <p className={`text-xl font-bold text-center ${predictionColorClass()}`}>
                {predictionResult || "Result will appear here"}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
