import React, { useState } from "react";
import {TabButton} from "../components/ui/TabButton";
import FormRow from "../components/ui/FormRow";
export default function PredictingPage() {
  // const [formData, setFormData] = useState({});
  // const [result, setResult] = useState("");
  // const [recommendation, setRecommendation] = useState("");
   const [activeTab, setActiveTab] = useState("predicting");
  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

  // const handlePredict = () => {
  //   setResult("Predicted: Success");
  //   setRecommendation("Recommendation: Optimize delivery route and discount rate.");
  // };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col p-0">
      {/* Header Tabs */}
      <div className="flex items-center justify-center space-x-10 h-16 bg-secondary-1">
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


      {/* Main Container */}
      <div className= "overflow-hidden mt-2">
        {/* Title */}
        <div className="bg-secondary-1 text-white font-semibold w-full h-9 flex items-center justify-center">
          Predicting and Recommendation
        </div>
         {/* Form Items */}
        <div className=" bg-white text-black font-semibold w-full p-5 min-h-50">
          <div className="flex flex-row mb-5">
            <div className="w-1/2 bg-white space-y-2 p-4 mr-5">
              <FormRow label="Type" select />
              <FormRow label="Shipping Mode" select />
              <FormRow label="Customer City" select />
              <FormRow label="Customer State" select />
              <FormRow label="Order Region" select />
              <FormRow label="Order Country" select />
              <FormRow label="Order City" select />
              <FormRow label="Order Status" select />
              <FormRow label="Category Name" select />
              <FormRow label="Department Name" select />
            </div>

            <div className="w-1/2 bg-white space-y-2 p-4">
              <FormRow label="Days for shipment (scheduled)" />
              <FormRow label="Benefit per order" />
              <FormRow label="Sales per customer" />
              <FormRow label="Latitude" />
              <FormRow label="Longitude" />
              <FormRow label="Order Item Discount Rate" />
              <FormRow label="Order Item Product Price" />
              <FormRow label="Order Item Profit Ratio" />
              <FormRow label="Order Item Quantity" />
            </div>
          </div>

          <div className="flex flex-row">
            <div className="w-1/2 flex flex-col items-center justify-center bg-white p-4 mr-5 relative">
              <button className="bg-primary-1 w-30 h-13 rounded-sm text-white mb-5">
                Predict
              </button>

              <lable className="pb-2">
                Result:
              </lable>

              <output id="result" class="border rounded-lg p-2 bg-white w-120 text-center">
                
              </output>
              


            </div>


  


            <div className="w-1/2 flex flex-col  items-center justify-center bg-white space-y-2 p-4">
              <lable className="">
                  Recommendation
              </lable>

              <output id="result" class="border rounded-lg p-2 bg-white w-full min-h-28">
                  
              </output>

            
            </div>
            

          </div>

        </div>
       
       
      </div>
    </div>
  );
}
