import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormRow from "../components/ui/FormRow";
import { cityCoordinates } from "../data/locationCoordinates";
import geoData from "../data/geographic_input_data.json";

export default function PredictingPage() {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [predictionResult, setPredictionResult] = useState("");
  const [recommendation, setRecommendation] = useState("");

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

    // When selecting Country
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

    // When selecting City
    if (name === "order_city") {
      const { order_region, order_country } = formData;
      const stateList = geoData[order_region][order_country][value] || [];

      setStates(stateList.map((s) => ({ value: s, label: s })));

      setFormData((prev) => ({ ...prev, order_state: "" }));
    }
  };

  const handlePredict = async () => {
    const payload = {
      input_data: {
        ...formData,
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    };

    try {
      const res = await fetch("http://localhost:8000/order/predicting/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response:", data);

      const label = data?.prediction?.label === "1" ? "Likely Late" : "On Time";
      const prob = data?.prediction?.probability
        ? (data.prediction.probability * 100).toFixed(2)
        : null;

      setPredictionResult(`${label} (${prob}%)`);
      setRecommendation(data?.llm_suggestion || "No suggestion provided.");
    } catch (error) {
      console.error(error);
      setPredictionResult("Error predicting. Try again.");
      setRecommendation("No recommendation due to error.");
    }
  };
  return (
    <>
      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left section: Shipment Info */}
          <div className="bg-white shadow-sm rounded-lg p-5 space-y-4 border">
            <h2 className="font-bold text-lg text-gray-700 border-b pb-2">
              Shipment Details
            </h2>

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
          {/* Right Section: Product Info */}
          <div className="bg-white shadow-sm rounded-lg p-5 space-y-4 border">
            <h2 className="font-bold text-lg text-gray-700 border-b pb-2">
              Product & Cost
            </h2>

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
              label="Days for shipment (scheduled)"
              name="days_for_shipment_scheduled"
              value={formData.days_for_shipment_scheduled}
              onChange={handleChange}
            />

            <FormRow
              label="Order Item Discount Rate"
              name="order_item_discount_rate"
              value={formData.order_item_discount_rate}
              onChange={handleChange}
            />

            <FormRow
              label="Order Item Product Price"
              name="order_item_product_price"
              value={formData.order_item_product_price}
              onChange={handleChange}
            />

            <FormRow
              label="Order Item Quantity"
              name="order_item_quantity"
              value={formData.order_item_quantity}
              onChange={handleChange}
            />

            <FormRow
              label="Cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Predict Button */}
        <div className="flex justify-center">
          <button
            className="bg-secondary-1 hover:bg-green-700 text-white px-10 py-3 rounded-md shadow transition"
            onClick={handlePredict}
          >
            Predict
          </button>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Result */}
          <div className="bg-white shadow rounded-lg p-5 border text-center">
            <h3 className="text-lg font-semibold text-black mb-2">
              Prediction Result
            </h3>
            <div
              id="result"
              className="border border-black rounded-md bg-gray-50 p-5 text-gray-500 break-all"
            >
              {predictionResult || "Awaiting prediction..."}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-white shadow rounded-lg p-5 border text-center">
            <h3 className="text-lg text-black mb-2 font-semibold">
              Recommendation
            </h3>
            <div
              id="recommendation"
              className="border border-black rounded-md bg-gray-50 p-5 min-h-[110px] text-gray-500 break-all"
            >
              {recommendation || "No recommendation yet..."}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
