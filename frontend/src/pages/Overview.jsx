import React, { useState, useEffect } from "react";
import axios from 'axios';
import {TabButton, TabStatistics} from "../components/ui/TabButton";
import LineChart from "../components/Charts/LineChart";
import HBarChart from "../components/Charts/HBarChart";
import AreaChart from "../components/Charts/AreaChart";
import Table from "../components/Charts/Table";
import KPICard from "../components/Charts/KPICard";
import PieChart from "../components/Charts/PieChart";
import EPieChart from "../components/Charts/EPieChart";
import BarChart from "../components/Charts/BarChart";




function Overview() {
  const [activeTab, setActiveTab] = useState("statistics");
  const [activeTabStatistic, setActiveTabStatistic] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  
  
  const [loading, setLoading] = useState(true); // ✅ Thêm state loading
  const [error, setError] = useState(null);     // ✅ Thêm state error

   useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // ✅ Bắt đầu tải dữ liệu, đặt loading = true
        setError(null);   // ✅ Reset lỗi cũ

        const FAKE_API_URL = "https://41fb4659-98bc-4d14-845d-81d470ab634d.mock.pstmn.io/test";
        const response = await axios.get(FAKE_API_URL);
        console.log("Phản hồi axios nhận được:", response);
        console.log("Dữ liệu dashboard nhận được:", response.data);


        const dashboardData = response.data;
        console.log(dashboardData);
        console.log("Start Date:", dashboardData.start);
        setDashboard(response.data);
        
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại."); // ✅ Cập nhật state lỗi
      } finally {
        setLoading(false); // ✅ Dù thành công hay thất bại, đặt loading = false
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Đang tải dữ liệu dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Lỗi: {error}</div>;
  }

  if (!dashboard) {
    return <div>Không có dữ liệu dashboard.</div>;
  }

  const {
    kpi_cards,
    revenue_over_time,
    sales_by_customer_group,
    top_10_products,
    late_risk_over_time,
    top_10_sales_region,
    department_delivery_status,
  } = dashboard;

 return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col p-0">
      {/* --- Header Tabs --- */}
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

      <div className="flex items-center justify-center space-x-10 h-full bg-secondary-1 mt-2">
        <TabStatistics
          label="Overview"
          isActive={activeTabStatistic === "overview"}
          onClick={() => setActiveTabStatistic("overview")}
        />

        <TabStatistics
          label="Detail"
          isActive={activeTabStatistic === "detail"}
          onClick={() => setActiveTabStatistic("detail")}
        />


      </div>


      {/* --- Main layout --- */}
      <div className="flex flex-1 overflow-hidden mt-2">


        {/* ---Content Area --- */}
        <div className="flex-1 flex flex-col bg-transparent">
       
            

            {/* Tags */}

            <div className="flex flex-row space-x-6 items-center justify-center bg- w-full h-1/4 p-4">
              
              {Object.entries(kpi_cards).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-transparent h-full w-1/6 shadow-2xl"
                  >
                    <KPICard label={key} data={value} />
                  </div>
                ))}

            </div>

            {/* Charts */}


            <div className="grid grid-cols-3 grid-rows-2 gap-5 p-6 pt-0 h-full ml-5 mr-6">
              {/* Sales through time */}
              <div className="col-span-1 row-span-1 bg-white p-4 border-2 border-red-500 flex justify-center items-center ">
                <LineChart
                  name= "Sales through time shown"

                  chartData={revenue_over_time}
                
                />
                
              </div>

              {/* Sales by Segment */}

             
                {/*Late Risk*/}

              <div className="col-span-1 row-span-1 bg-white p-4 border-2 border-red-500 flex justify-center items-center ">

                <AreaChart 

                  chartData={late_risk_over_time}

                  name = "Late risk through time"
                />

              </div>

              {/*Sales by Category*/}
                 <div className="col-span-1 row-span-2 bg-transparent overflow-y-auto text-black flex justify-center items-center ml-5                                         ">
                   <Table 
                     chartData={top_10_products}

                />
              
                


              
            </div>

               {/*Sales by Region*/}
              <div className="col-span-1 row-span-1 bg-white p-4 border-2 border-red-500 flex justify-center items-center  ">
                <HBarChart 
                
                  chartData={top_10_sales_region}
                />
              </div>
              {/*Sales by Region*/}
              {/* <div className="col-span-1 row-span-1 bg-white p-4 border-2 border-red-500 flex justify-center items-center  ">
              <BarChart name={"Top 10 products"} chartData={department_delivery_status} />
              </div>
 */}
               <div className="col-span-1 row-span-1 bg-white p-4 border-2 border-red-500">
                <PieChart
                  name = "Distribution of Sales by customer segment"

                  chartData={sales_by_customer_group}
                
                />
              </div>

              </div>
              
              

                 
        </div>
      </div>
    </div>
  );
}

export default Overview;

