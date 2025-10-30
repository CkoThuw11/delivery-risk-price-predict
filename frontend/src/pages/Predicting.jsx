import React, { useState } from "react";
import {TabButton} from "../components/ui/TabButton";
import FormRow from "../components/ui/FormRow";
import {cityCoordinates} from "../data/locationCoordinates"

export default function PredictingPage() {
  const [activeTab, setActiveTab] = useState("predicting");

  const [formData, setFormData] = useState({
    payment_type: "",
    shipping_mode: "",
    customer_city: "",
    customer_state: "",
    order_region: "",
    order_country: "",
    order_city: "",
    order_status: "",
    category_name: "",
    department_name: "",
    days_for_shipment_scheduled: "",
    order_item_discount_rate: "",
    order_item_product_price: "",
    order_item_quantity: "",
    cost: ""
  });
  const paymentTypes = [
  { value: "DEBIT", label: "Debit" },
  { value: "CASH", label: "Cash" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "PAYMENT", label: "Payment" }
];

  const shippingModes = [
    { value: "Same Day", label: "Same Day" },
    { value: "First Class", label: "First Class" },
    { value: "Second Class", label: "Second Class" },
    { value: "Standard Class", label: "Standard Class" }
  ];

  const orderStatuses = [
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "canceled", label: "Canceled" }
  ];

// You can use cityCoordinates keys as dropdown values
const cityOptions = Object.keys(cityCoordinates).map(city => ({
  value: city,
  label: city
}));
  const [coords, setCoords] = useState({
    latitude: null,
    longitude: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "customer_city" || name === "order_city") {
      const found = cityCoordinates[value];
      if (found) {
        setCoords({ latitude: found.lat, longitude: found.lon });
      }
    }
  };

  const handlePredict = async () => {
    const payload = {
      input_data: {
        ...formData,
        latitude: coords.latitude,
        longitude: coords.longitude
      }
    };

    console.log("Request Payload:", payload);

    const res = await fetch("http://localhost:8000/api/predict/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    alert("Prediction: " + JSON.stringify(data));
  };
  return (
     <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Tabs */}
      <div className="flex items-center justify-center space-x-10 h-16 bg-primary-1 text-white shadow-sm">
        <TabButton
          label="Statistics"
          isActive={activeTab === "statistics"}
          onClick={() => setActiveTab("statistics")}
        />
        <TabButton
          label="Predicting"
          isActive={activeTab === "predicting"}
          onClick={() => setActiveTab("predicting")}
        />
      </div>

      {/* Title */}
      <div className="bg-primary-1 text-white text-center py-2 font-semibold">
        Delivery Delay Predictor
      </div>

      <div className="p-6 space-y-6">

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left section: Shipment Info */}
          <div className="bg-white shadow-sm rounded-lg p-5 space-y-4 border">
            <h2 className="font-bold text-lg text-gray-700 border-b pb-2">Shipment Details</h2>
            
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
              label="Customer State"
              name="customer_state"
              value={formData.customer_state}
              onChange={handleChange}
            />

            <FormRow
              label="Order Country"
              name="order_country"
              select
              value={formData.order_country}
              onChange={handleChange}
              options={[ { value: "USA", label: "USA" }, { value: "VNM", label: "Vietnam" } ]}
            />

            <FormRow
              label="Order Region"
              name="order_region"
              value={formData.order_region}
              onChange={handleChange}
            />

            <FormRow
              label="Order City"
              name="order_city"
              select
              value={formData.order_city}
              onChange={handleChange}
              options={cityOptions}
            />

            <FormRow
              label="Order State"
              name="order_state"
              value={formData.order_state}
              onChange={handleChange}
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
            <h2 className="font-bold text-lg text-gray-700 border-b pb-2">Product & Cost</h2>

            <FormRow
              label="Category Name"
              name="category_name"
              select
              value={formData.category_name}
              onChange={handleChange}
              options={[
                { value: "Electronics", label: "Electronics" },
                { value: "Clothing", label: "Clothing" },
                { value: "Sports", label: "Sports" }
              ]}
            />

            <FormRow
              label="Department Name"
              name="department_name"
              select
              value={formData.department_name}
              onChange={handleChange}
              options={[
                { value: "Home", label: "Home" },
                { value: "Fashion", label: "Fashion" },
                { value: "Tech", label: "Tech" }
              ]}
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
          <button className="bg-primary-2 hover:bg-green-700 text-black font-bold px-10 py-3 rounded-md border border-black-500 shadow transition" onClick={handlePredict}>
            Predict
          </button>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          
          {/* Result */}
          <div className="bg-white shadow rounded-lg p-5 border text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Prediction Result</h3>
            <div id="result" className="border rounded-md bg-gray-50 p-5 text-lg font-medium text-gray-800">
              HUHU
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-white shadow rounded-lg p-5 border">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Recommendation</h3>
            <div id="recommendation" className="border rounded-md bg-gray-50 p-5 min-h-[110px] text-gray-800">
              HUHU
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}