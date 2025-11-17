import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import { 
  Truck, 
  DollarSign, 
  ClipboardCheck, 
  Lightbulb,
  Loader2
} from "lucide-react";
import FormRow from "../components/ui/FormRow";
import { cityCoordinates } from "../data/locationCoordinates";
import geoData from "../data/geographic_input_data.json";


const FormattedRecommendation = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n').filter(line => line.trim());
  const elements = [];
  let currentParagraph = [];
  let bulletPoints = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {

      if (currentParagraph.length > 0) {
        elements.push({
          type: 'paragraph',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
      
      const content = trimmed.substring(1).trim();
      bulletPoints.push(content);
    } else {
      if (bulletPoints.length > 0) {
        elements.push({
          type: 'bullets',
          items: [...bulletPoints]
        });
        bulletPoints = [];
      }
      if (trimmed) {
        currentParagraph.push(trimmed);
      } else if (currentParagraph.length > 0) {
        elements.push({
          type: 'paragraph',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
    }
  });

  if (currentParagraph.length > 0) {
    elements.push({
      type: 'paragraph',
      content: currentParagraph.join(' ')
    });
  }
  if (bulletPoints.length > 0) {
    elements.push({
      type: 'bullets',
      items: bulletPoints
    });
  }

  const renderTextWithBold = (text) => {
    const parts = text.split('**');
    return parts.map((part, i) => 
      i % 2 === 1 ? (
        <strong key={i} className="font-bold text-teal-800">{part}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="space-y-4 text-left">
      {elements.map((element, index) => {
        if (element.type === 'paragraph') {
          return (
            <div key={index} className="text-gray-700 leading-relaxed text-sm">
              {renderTextWithBold(element.content)}
            </div>
          );
        }
        
        if (element.type === 'bullets') {
          return (
            <ul key={index} className="space-y-3 ml-2">
              {element.items.map((item, bIndex) => (
                <li key={bIndex} className="flex items-start gap-3">
                  <div className="mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                  </div>
                  <span className="flex-1 text-gray-700 text-sm leading-relaxed">
                    {renderTextWithBold(item)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        
        return null;
      })}
    </div>
  );
};


export default function PredictingPage() {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [predictionResult, setPredictionResult] = useState("");
  const [recommendation, setRecommendation] = useState("");
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
    { value: "PRCESSING", label: "Processing" },
    { value: "SUSPECTED_FRAUDE", label: "Suspected Fraude" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "PAYMENT_REVIEW", label: "Payment Review" },
  ];

  const CategoryNames = [
    { value: "Accessories", label: "Accessories" },
    { value: "Baseball & Softball", label: "Baseball & Softball" },
    { value: "Books ", label: "Books " },
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

  const cityOptions = Object.keys(cityCoordinates).map((city) => ({
    value: city,
    label: city,
  }));

  const [coords, setCoords] = useState({
    latitude: null,
    longitude: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "customer_city" || name === "order_city") {
      const cityInfo = cityCoordinates[value];
      if (cityInfo) {
        setCoords({ latitude: cityInfo.lat, longitude: cityInfo.lon });

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
      const region = formData.order_region;
      const cityList = Object.keys(geoData[region][value] || {});
      setCities(cityList.map((c) => ({ value: c, label: c })));
      setStates([]);
      setFormData((prev) => ({
        ...prev,
        order_city: "",
        order_state: "",
      }));
    }

    if (name === "order_city") {
      const { order_region, order_country } = formData;
      const stateList = geoData[order_region][order_country][value] || [];
      setStates(stateList.map((s) => ({ value: s, label: s })));
      setFormData((prev) => ({ ...prev, order_state: "" }));
    }
  };

  const handlePredict = async () => {
    const payload = {
      payment_type: formData.payment_type,
      shipping_mode: formData.shipping_mode,
      customer_city: formData.customer_city,
      customer_state: formData.customer_state,
      order_region: formData.order_region,
      order_country: formData.order_country,
      order_city: formData.order_city,
      order_state: formData.order_state,
      order_status: formData.order_status,
      category_name: formData.category_name,
      department_name: formData.department_name,
      days_for_shipment_scheduled: parseInt(formData.days_for_shipment_scheduled),
      order_item_discount_rate: parseFloat(formData.order_item_discount_rate),
      order_item_product_price: parseFloat(formData.order_item_product_price),
      order_item_quantity: parseInt(formData.order_item_quantity),
      cost: parseFloat(formData.cost),
      latitude: coords.latitude,
      longitude: coords.longitude
    };

    console.log(payload);
    setIsLoading(true);

    try {
      const res = await apiFetch("http://localhost:8000/order/predicting/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      console.log("Response:", data);
      
      const label = data?.prediction?.label === 1 ? "Late" : "On Time";
      const prob = data?.prediction?.probability
        ? (data.prediction.probability * 100).toFixed(2)
        : null;

      setPredictionResult(`${label} (${prob}%)`);
      setRecommendation(data?.llm_response || "No suggestion provided.");
    } catch (error) {
      console.error(error);
      setPredictionResult("Error predicting. Try again.");
      setRecommendation("No recommendation due to error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex-1 overflow-y-auto">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* Left Column - Shipment Details */}
        <div className="lg:col-span-4 bg-secondary-4 rounded-3xl p-6 shadow-lg border-secondary-color-3">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-secondary-color-3-teal-300">
            <div className="p-2 bg-secondary-3 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold color-secondary-3">Shipment details</h2>
          </div>

          <div className="space-y-4">
            <FormRow
              label="Payment Type"
              name="payment_type"
              select
              value={formData.payment_type}
              onChange={handleChange}
              options={paymentTypes}
            />

            <FormRow
              label="Shipping Mode"
              name="shipping_mode"
              select
              value={formData.shipping_mode}
              onChange={handleChange}
              options={shippingModes}
            />

            <FormRow
              label="Customer City"
              name="customer_city"
              select
              value={formData.customer_city}
              onChange={handleChange}
              options={cityOptions}
            />

            <FormRow
              label="Order Region"
              name="order_region"
              select
              value={formData.order_region}
              onChange={handleChange}
              options={Object.keys(geoData).map((r) => ({
                value: r,
                label: r,
              }))}
            />

            <FormRow
              label="Order Country"
              name="order_country"
              select
              value={formData.order_country}
              onChange={handleChange}
              options={countries}
            />

            <FormRow
              label="Order City"
              name="order_city"
              select
              value={formData.order_city}
              onChange={handleChange}
              options={cities}
            />

            <FormRow
              label="Order State"
              name="order_state"
              select
              value={formData.order_state}
              onChange={handleChange}
              options={states}
            />

            <FormRow
              label="Order Status"
              name="order_status"
              select
              value={formData.order_status}
              onChange={handleChange}
              options={orderStatuses}
            />
          </div>
        </div>

        {/* Products and Cost */}
        <div className="lg:col-span-4 bg-secondary-4 rounded-3xl p-6 shadow-lg border-secondary-color-3">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-secondary-color-3-teal-300">
            <div className="p-2 bg-secondary-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold color-secondary-3">Products and cost</h2>
          </div>

          <div className="space-y-4">
            <FormRow
              label="Category Name"
              name="category_name"
              select
              value={formData.category_name}
              onChange={handleChange}
              options={CategoryNames}
            />

            <FormRow
              label="Department Name"
              name="department_name"
              select
              value={formData.department_name}
              onChange={handleChange}
              options={departmentNames}
            />

            <FormRow
              label="Days For Shipment (Scheduled)"
              name="days_for_shipment_scheduled"
              value={formData.days_for_shipment_scheduled}
              onChange={handleChange}
              type="number"
            />

            <FormRow
              label="Order Item Discount Rate"
              name="order_item_discount_rate"
              value={formData.order_item_discount_rate}
              onChange={handleChange}
              type="number"
              step="0.01"
            />

            <FormRow
              label="Order Item Product Price"
              name="order_item_product_price"
              value={formData.order_item_product_price}
              onChange={handleChange}
              type="number"
              step="0.01"
            />

            <FormRow
              label="Order Item Quantity"
              name="order_item_quantity"
              value={formData.order_item_quantity}
              onChange={handleChange}
              type="number"
            />

            <FormRow
              label="Cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              type="number"
              step="0.01"
            />
          </div>

          {/* Predict Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePredict}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-12 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Results */}
        <div className="lg:col-span-4 space-y-6">
          {/* Prediction Result */}
          <div className="bg-secondary-4 rounded-3xl p-6 shadow-lg border-secondary-color-3">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-secondary-color-3-teal-300">
              <div className="p-2 bg-secondary-3 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold color-secondary-3">Prediction Result</h2>
            </div>

            <div className="bg-white rounded-2xl p-6 h-[140px] flex items-center justify-center border-secondary-color-3">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                  <p className="text-gray-500 text-sm">Analyzing...</p>
                </div>
              ) : (
                <p className={`text-xl font-bold text-center ${
                  predictionResult.includes("Late") 
                    ? "text-red-600" 
                    : predictionResult.includes("On Time") 
                    ? "text-green-600" 
                    : "text-gray-400"
                }`}>
                  {predictionResult || "Result will appear here"}
                </p>
              )}
            </div>
          </div>

          {/* Recommendation*/}
          <div className="bg-secondary-4 rounded-3xl p-6 shadow-lg border-secondary-color-3 h-[520px]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-secondary-color-3-teal-300">
              <div className="p-2 bg-secondary-3 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold color-secondary-3">Recommendation</h2>
            </div>

            <div className="bg-white rounded-2xl p-6 h-[380px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                </div>
              ) : recommendation ? (
                <FormattedRecommendation text={recommendation} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Lightbulb className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-center text-sm">Recommendations will appear here after prediction</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}