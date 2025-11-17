import { useState, useEffect } from 'react';
import { apiFetch } from "../utils/apiFetch";
import { cityCoordinates } from '../data/locationCoordinates';
import geoData from '../data/geographic_input_data.json';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Eye,
  TrendingUp,
  Package,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

const SuccessNotification = ({message, onClose}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer)
  }, [onClose])
  return (
    <div className="fixed top-6 right-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-lg flex items-start gap-3 animate-in slide-in-from-top z-40">
      <div className="flex-shrink-0 pt-0.5">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-green-700">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-green-600 hover:opacity-70 transition-opacity"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
const API_BASE = 'http://localhost:8000/order';


const StatusBadge = ({ status }) => {
  const statusStyles = {
    'COMPLETE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
    'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200',
    'CANCELED': 'bg-red-100 text-red-700 border-red-200'
  };
  
  const statusIcons = {
    'COMPLETE': <CheckCircle className="w-3 h-3" />,
    'PENDING': <Clock className="w-3 h-3" />,
    'CLOSED': <XCircle className="w-3 h-3" />
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] || statusStyles.CLOSED}`}>
      {statusIcons[status]}
      {status}
    </span>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in duration-300">
        <div className="bg-secondary-3 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Order Details - #{order.id}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-secondary-3 hover:bg-white/20 rounded-lg transition-colors color-primary-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Order Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-semibold text-gray-900">{order.department_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold text-gray-900">{order.category_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <StatusBadge status={order.order_status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-semibold text-gray-900">{order.payment_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Mode:</span>
                  <span className="font-semibold text-gray-900">{order.shipping_mode}</span>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Location Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer City:</span>
                  <span className="font-semibold text-gray-900">{order.customer_city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer State:</span>
                  <span className="font-semibold text-gray-900">{order.customer_state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order City:</span>
                  <span className="font-semibold text-gray-900">{order.order_city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Region:</span>
                  <span className="font-semibold text-gray-900">{order.order_region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Country:</span>
                  <span className="font-semibold text-gray-900">{order.order_country}</span>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Financial Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Price:</span>
                  <span className="font-bold text-gray-900">${parseFloat(order.order_item_product_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold text-gray-900">{order.order_item_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount Rate:</span>
                  <span className="font-semibold text-gray-900">{(order.order_item_discount_rate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Ratio:</span>
                  <span className="font-semibold text-gray-900">{(order.order_item_profit_ratio * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Benefit per Order:</span>
                  <span className="font-bold text-green-600">${parseFloat(order.benefit_per_order).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipment Information */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Shipment Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Days for Shipment:</span>
                  <span className="font-semibold text-gray-900">{order.days_for_shipment_scheduled} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Late Delivery Risk:</span>
                  <span className={`font-semibold ${order.late_delivery_risk ? 'text-red-600' : 'text-green-600'}`}>
                    {order.late_delivery_risk ? 'Yes ⚠︎' : 'No ✓'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-semibold text-gray-900">{parseFloat(order.latitude).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-semibold text-gray-900">{parseFloat(order.longitude).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sales per Customer:</span>
                  <span className="font-bold text-gray-900">${parseFloat(order.sales_per_customer).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Form Modal
const OrderFormModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [formData, setFormData] = useState({
    department_name: '',
    category_name: '',
    customer_state: '',
    order_status: '',
    order_country: '',
    order_region: '',
    order_state: '',
    payment_type: '',
    customer_city: '',
    order_city: '',
    shipping_mode: '',
    days_for_shipment_scheduled: 0,
    cost: 0,
    latitude: 0,
    longitude: 0,
    order_item_discount_rate: 0,
    order_item_product_price: 0,
    order_item_quantity: 1,
    late_delivery_risk: false,
    sales_per_customer: 0,
    benefit_per_order: 0,
    order_item_profit_ratio: 0
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);

  const departmentNames = [
    'Fitness', 'Apparel', 'Golf', 'Footwear', 'Outdoors', 
    'Fan Shop', 'Technology', 'Book Shop', 'Discs Shop', 'Pet Shop', 'Health and Beauty'
  ];

  const categoryNames = [
    'Accessories', 'Baseball & Softball', 'Books', 'Cameras', 
    'Children\'s Clothing', 'Computers', 'Garden', 'Music'
  ];

  const orderStatuses = [
    'COMPLETE', 'PENDING', 'CLOSED', 'CANCELED', 'PROCESSING', 
    'PENDING_PAYMENT', 'SUSPECTED_FRAUD', 'ON_HOLD', 'PAYMENT_REVIEW'
  ];

  const paymentTypes = ['DEBIT', 'CASH', 'TRANSFER', 'PAYMENT'];
  const shippingModes = ['Same Day', 'First Class', 'Standard', 'Second Class'];
  const regions = Object.keys(geoData);


  useEffect(() => {
    if (isOpen && order) {
      try {
        console.log("Loading order for edit:", order);
        const initialData = {
          department_name: order.department_name || '',
          category_name: order.category_name || '',
          customer_state: order.customer_state || '',
          order_status: order.order_status || '',
          order_country: order.order_country || '',
          order_region: order.order_region || '',
          order_state: order.order_state || '',
          payment_type: order.payment_type || '',
          customer_city: order.customer_city || '',
          order_city: order.order_city || '',
          shipping_mode: order.shipping_mode || '',
          days_for_shipment_scheduled: Number(order.days_for_shipment_scheduled) || 0,
          cost: Number(order.cost) || 0,
          latitude: Number(order.latitude) || 0,
          longitude: Number(order.longitude) || 0,
          order_item_discount_rate: Number(order.order_item_discount_rate) || 0,
          order_item_product_price: Number(order.order_item_product_price) || 0,
          order_item_quantity: Number(order.order_item_quantity) || 1,
          late_delivery_risk: Boolean(order.late_delivery_risk),
          sales_per_customer: Number(order.sales_per_customer) || 0,
          benefit_per_order: Number(order.benefit_per_order) || 0,
          order_item_profit_ratio: Number(order.order_item_profit_ratio) || 0
        };
        
        console.log("Initialized form data:", initialData);
        setFormData(initialData);
        setCountries([]);
        setCities([]);
        setStates([]);
        
        if (order.order_region && geoData[order.order_region]) {
          const regionCountries = Object.keys(geoData[order.order_region]);
          setCountries(regionCountries);
          
          if (order.order_country && geoData[order.order_region][order.order_country]) {
            const cityList = Object.keys(geoData[order.order_region][order.order_country]);
            setCities(cityList);
            
            if (order.order_city && geoData[order.order_region][order.order_country][order.order_city]) {
              const stateList = geoData[order.order_region][order.order_country][order.order_city];
              setStates(stateList);
            }
          }
        }
      } catch (err) {
        console.error("Error initializing form:", err);
        setFormData({
          department_name: '',
          category_name: '',
          customer_state: '',
          order_status: '',
          order_country: '',
          order_region: '',
          order_state: '',
          payment_type: '',
          customer_city: '',
          order_city: '',
          shipping_mode: '',
          days_for_shipment_scheduled: 0,
          cost: 0,
          latitude: 0,
          longitude: 0,
          order_item_discount_rate: 0,
          order_item_product_price: 0,
          order_item_quantity: 1,
          late_delivery_risk: false,
          sales_per_customer: 0,
          benefit_per_order: 0,
          order_item_profit_ratio: 0
        });
      }
    } else if (isOpen && !order) {
      setFormData({
        department_name: '',
        category_name: '',
        customer_state: '',
        order_status: '',
        order_country: '',
        order_region: '',
        order_state: '',
        payment_type: '',
        customer_city: '',
        order_city: '',
        shipping_mode: '',
        days_for_shipment_scheduled: 0,
        cost: 0,
        latitude: 0,
        longitude: 0,
        order_item_discount_rate: 0,
        order_item_product_price: 0,
        order_item_quantity: 1,
        late_delivery_risk: false,
        sales_per_customer: 0,
        benefit_per_order: 0,
        order_item_profit_ratio: 0
      });
      setCountries([]);
      setCities([]);
      setStates([]);
    }
  }, [isOpen, order]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox'
       ? checked
        : type === "number"
          ? value === "" 
            ? "" 
            : parseFloat(value)
          : value,
    };

    // Calculate financial metrics
    if (['order_item_product_price', 'order_item_quantity', 'order_item_discount_rate', 'cost'].includes(name)) {
      const price = parseFloat(newFormData.order_item_product_price) || 0;
      const quantity = parseFloat(newFormData.order_item_quantity) || 0;
      const discount = parseFloat(newFormData.order_item_discount_rate) || 0;
      const cost = parseFloat(newFormData.cost) || 0;

      const salesPerCustomer = price * quantity * (1 - discount);
      const benefitPerOrder = salesPerCustomer - cost;
      const profitRatio = salesPerCustomer !== 0 ? benefitPerOrder / salesPerCustomer : 0;

      newFormData.sales_per_customer = salesPerCustomer;
      newFormData.benefit_per_order = benefitPerOrder;
      newFormData.order_item_profit_ratio = profitRatio;
    }

    // Handle city coordinates
    if (name === 'customer_city' && value) {
      const cityInfo = cityCoordinates[value];
      if (cityInfo) {
        newFormData.latitude = cityInfo.lat || 0;
        newFormData.longitude = cityInfo.lon || 0;
        newFormData.customer_state = cityInfo.state || '';
      } else {
        console.warn(`City "${value}" not found in cityCoordinates`);
      }
    }

    // hierarchical selection
    if (name === 'order_region' && value) {
      const regionCountries = Object.keys(geoData[value] || {});
      setCountries(regionCountries);
      setCities([]);
      setStates([]);
      newFormData.order_country = '';
      newFormData.order_city = '';
      newFormData.order_state = '';
    }

    if (name === 'order_country' && value) {
      const region = newFormData.order_region;
      const cityList = Object.keys(geoData[region]?.[value] || {});
      setCities(cityList);
      setStates([]);
      newFormData.order_city = '';
      newFormData.order_state = '';
    }

    if (name === 'order_city' && value) {
      const stateList = geoData[newFormData.order_region]?.[newFormData.order_country]?.[value] || [];
      setStates(stateList);
      newFormData.order_state = '';
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem("authToken");
      const url = order
        ? `${API_BASE}/orders/${order.id}/`
        : `${API_BASE}/orders/`;

      const method = order ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData);
        return;
      }

      onSuccess(order ? 'Order updated successfully!' : 'Order created successfully!');
      onClose();

    } catch (err) {
      console.error("Form submit error:", err);
      setErrors({ error: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in fade-in duration-300">
        <div className="bg-secondary-3 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {order ? '✏️ Edit Order' : '➕ Create New Order'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-secondary-3 hover:bg-white/20 rounded-lg transition-colors color-primary-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Basic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <select
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Department...</option>
                  {departmentNames.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Category...</option>
                  {categoryNames.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order Status</label>
                <select
                  name="order_status"
                  value={formData.order_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Status...</option>
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Location Details</h3>
            
            <div className="mb-6 pb-6 border-b border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Customer Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer City</label>
                  <select
                    name="customer_city"
                    value={formData.customer_city}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select City...</option>
                    {Object.keys(cityCoordinates).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer State</label>
                  <input
                    type="text"
                    name="customer_state"
                    value={formData.customer_state}
                    readOnly
                    className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Order Location</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Region *</label>
                <select
                  name="order_region"
                  value={formData.order_region}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Region...</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                <select
                  name="order_country"
                  value={formData.order_country}
                  onChange={handleChange}
                  disabled={!formData.order_region}
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Country...</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <select
                  name="order_city"
                  value={formData.order_city}
                  onChange={handleChange}
                  disabled={!formData.order_country}
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select City...</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <select
                    name="order_state"
                    value={formData.order_state}
                    onChange={handleChange}
                    disabled={!formData.order_city}
                    className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select State...</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Shipping */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment & Shipping</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Type</label>
                <select
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Payment...</option>
                  {paymentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Mode</label>
                <select
                  name="shipping_mode"
                  value={formData.shipping_mode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Shipping...</option>
                  {shippingModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Days for Shipment</label>
                <input
                  type="number"
                  name="days_for_shipment_scheduled"
                  value={formData.days_for_shipment_scheduled}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-3 flex items-center">
                <input
                  type="checkbox"
                  name="late_delivery_risk"
                  checked={formData.late_delivery_risk}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 border-2 color-secondary-3 bg-white rounded focus:ring-2 focus:ring-purple-500"
                />
                <label className="ml-3 text-sm font-semibold text-gray-700">Late Delivery Risk</label>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Details</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 font-semibold">💡 Auto-calculated fields:</p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                <li>• Sales per Customer = Product Price × Quantity × (1 - Discount Rate)</li>
                <li>• Benefit per Order = Sales per Customer - Cost</li>
                <li>• Profit Ratio = Benefit per Order / Sales per Customer</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Price ($)</label>
                <input
                  type="number"
                  name="order_item_product_price"
                  value={formData.order_item_product_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="order_item_quantity"
                  value={formData.order_item_quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Rate (0-1)</label>
                <input
                  type="number"
                  name="order_item_discount_rate"
                  value={formData.order_item_discount_rate}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="1"
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="0.0 to 1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cost ($)</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border-2 color-secondary-3 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter cost"
                />
              </div>
            </div>

            {/* Calculated Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sales per Customer ($)</label>
                <div className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-bold">
                  ${Number(formData.sales_per_customer || 0).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Benefit per Order ($)</label>
                <div className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg font-bold ${Number(formData.benefit_per_order || 0) >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  ${Number(formData.benefit_per_order || 0).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profit Ratio</label>
                <div className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg font-bold ${Number(formData.order_item_profit_ratio || 0) >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {(Number(formData.order_item_profit_ratio || 0) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm font-bold mb-2">Validation Errors:</p>
              <ul className="mt-2 text-xs text-red-700 space-y-1">
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span><strong>{key}:</strong> {JSON.stringify(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end border-t-2 pt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 text-white bg-primary-3  font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold disabled:opacity-50 flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {order ? 'Update Order' : 'Create Order'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main CRUD Page
const CRUDPage = () => {
  const [orders, setOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchOrders = async (search = searchTerm, page = currentPage) => {
    setLoading(true);

    try {

      const response = await apiFetch(`${API_BASE}/orders/?page=${page}&page_size=10&search=${search}`, {
        method: "GET",
      });

      const data = await response.json();

      setOrders(data.data);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);

      return data;

    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleRefresh = () => {
    setSearchTerm("");
    fetchOrders(""); 
  };


  const handleEdit = (order) => {
    console.log("Editing order:", order);
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleView = (order) => {
    setDetailOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/orders/${deleteId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error || `HTTP error: ${response.status}`);
      }

      const updated = await fetchOrders();

      if (updated.pagination && currentPage > updated.pagination.total_pages) {
        setCurrentPage(updated.pagination.total_pages);
      }

      setNotification('Order deleted successfully!');

    } catch (error) {
      console.error("Error deleting:", error);
    }

    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Sucess Notification*/}
      {notification &&(
      <SuccessNotification
        message ={notification}
        onClose={() => setNotification(null)}
      />
      )}
      <div className="max-w-[1600px] mx-auto">
        {showDeleteModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/0 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-2xl w-[350px] scale-100 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800">Delete Order?</h2>
              <p className="text-gray-500 mt-2">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-white bg-gradient-to-br from-blue-500 to-blue-700"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white rounded-xl bg-gradient-to-br from-red-500 to-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-secondary-3 rounded-xl px-6 py-6 flex items-center justify-between shadow-xl mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              <Package className="w-12 h-12" />
              Order Management System
            </h1>
            <p className="text-blue-100 mt-1 text-sm">Manage and track all your orders efficiently</p>
          </div>
          <button
            onClick={() => {
              setSelectedOrder(null);
              setIsModalOpen(true);
            }}
            className="bg-white color-secondary-3 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            ADD NEW ORDER
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold">Current Page</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{currentPage}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold">Page Size</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pageSize}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Filter className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold">Total Pages</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalPages}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <ChevronRight className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by department, category, city, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 color-secondary-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-secondary-3 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
            <button 
              onClick={handleRefresh}
              className="px-8 py-3 bg-secondary-3 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-semibold">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-semibold text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer City</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order City</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Shipping</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Discount</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Benefit</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Region</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Country</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr 
                        key={order.id} 
                        className={`border-b transition-colors ${
                          idx % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'
                        }`}
                      >
                        <td className="px-4 py-4 text-sm font-bold color-secondary-3">#{order.id}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{order.department_name}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{order.category_name}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{order.customer_city}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{order.order_city}</td>
                        <td className="px-4 py-4 text-sm">
                          <StatusBadge status={order.order_status} />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{order.payment_type}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{order.shipping_mode}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">{order.order_item_quantity}</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">${parseFloat(order.order_item_product_price).toFixed(2)}</td>
                        <td className="px-4 py-4 text-sm text-orange-600 font-semibold">{(order.order_item_discount_rate * 100).toFixed(1)}%</td>
                        <td className="px-4 py-4 text-sm font-bold text-purple-600">${parseFloat(order.benefit_per_order).toFixed(2)}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{order.order_region}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{order.order_country}</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleView(order)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all transform hover:scale-110"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(order)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all transform hover:scale-110"
                              title="Edit Order"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(order.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all transform hover:scale-110"
                              title="Delete Order"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold color-secondary-3">Items per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 border-2 border-gray-300 color-secondary-3 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>5</option>
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold color-secondary-3">
                      Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border-2 color-secondary-3 border-gray-300 rounded-lg disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-semibold text-sm"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border-2 color-secondary-3 border-gray-300 rounded-lg disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="px-4 py-2 bg-secondary-3 text-white rounded-lg font-bold">
                        {currentPage}
                      </div>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border-2 color-secondary-3 border-gray-300 rounded-lg disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border-2 color-secondary-3 border-gray-300 rounded-lg disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-semibold text-sm"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onSuccess={(message) => {
          fetchOrders();
          setNotification(message);
        }}
      />

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={detailOrder}
      />
    </div>
  );
};

export default CRUDPage;