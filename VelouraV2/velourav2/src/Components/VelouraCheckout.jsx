import React, { useState, useEffect, useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { PaystackButton } from "react-paystack";
import { ChevronDown, CreditCard, ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Velouraheader from "./Velouratopnavbar ";
import VelourabuttonNavbar from "./VelourabuttonNavbar";

const VelouraCheckout = () => {
  const navigate = useNavigate();

const [randomID, setRandomID] = useState(
  () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`
);


const refreshOrderId = () => {
  setRandomID(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
};

  const [cartItems, setCartItems] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "Nigeria",
    countryCode: "NG",
    state: "Lagos",
    stateCode: "LA",
    city: "",
    address: "",
  });

  const allCountries = Country.getAllCountries();
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    const states = State.getStatesOfCountry(formData.countryCode);
    setAvailableStates(states);
    if (!states.find((s) => s.isoCode === formData.stateCode)) {
      const initial = states.find((s) => s.name === "Lagos") || states[0];
      if (initial) {
        setFormData((prev) => ({
          ...prev,
          state: initial.name,
          stateCode: initial.isoCode,
        }));
      }
    }
  }, [formData.countryCode]);

  useEffect(() => {
    const cities = City.getCitiesOfState(
      formData.countryCode,
      formData.stateCode,
    );
    setAvailableCities(cities);
    if (cities.length > 0 && !cities.find((c) => c.name === formData.city)) {
      setFormData((prev) => ({ ...prev, city: cities[0].name }));
    }
  }, [formData.stateCode, formData.countryCode]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedCart = JSON.parse(localStorage.getItem("veloura_cart")) || [];
    const validItems = savedCart.filter((item) => {
      const stock = parseInt(item.stock || item.maxStock || 0);
      return stock > 0;
    });
    setCartItems(validItems);
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * (item.quantity || item.qty || 1),
    0,
  );

  const handleFinalOrder = async (paystackResponse) => {
    console.log(" handleFinalOrder CALLED:", paystackResponse.reference);
    console.log(" handleFinalOrder CALLED:", paystackResponse.status);
    try {
      const orderPayload = {
        reference: paystackResponse.reference,

        formData: formData,
        cartItems: cartItems.map((item) => ({
          orderId: randomID,
          productId: item._id,
          name: item.name,
          price: Number(item.price),
          qty: item.quantity || item.qty || 1,
          size: item.selectedSize || item.size || "Unique",
          color: item.selectedColor || item.color || "Standard",
          image: item.images?.[0] || item.image,
        })),
        totalAmount: subtotal,
        paymentStatus: "SUCCESS",
      };

      const response = await axios.post(
        "http://localhost:5200/order/verifyorder",
        orderPayload,
      );

      if (response.data.success) {
        console.log("Data to save", orderPayload);
        // console.error();

        alert(response.data.message);

        localStorage.removeItem("veloura_cart");
        navigate("/veloura/store");
      }
    } catch (error) {
      console.error();
      console.log("i no see ");
      console.error("BACKEND ERROR:", error.response?.data || error.message);
      alert(
        "We recorded your payment, but there was an issue creating your order dossier. Please keep your reference: " +
          paystackRef.reference,
      );
    }
  };

  const isFormComplete =
    formData.email &&
    formData.fullName &&
    formData.address &&
    formData.phone &&
    cartItems.length > 0;


  const paystackConfig = {
    reference: "VEL-" + new Date().getTime().toString(),
    email: formData.email,
    amount: subtotal * 100,

  
    key: "pk_test_85146938a69f012b0b557560fe071c3bc90073b0",

    metadata: {
      custom_fields: [
        {
          display_name: "Order ID",
          variable_name: "order_id",
          value: randomID,
        },
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: formData.fullName,
        },
        {
          display_name: "Phone",
          variable_name: "phone",
          value: formData.phone,
        },
        {
          display_name: "Items",
          variable_name: "items",
          value: cartItems.map((i) => i.name).join(", "),
        },
      ],
    },

    
    callback: function (response) {
      console.log(" PAYSTACK CALLBACK FIRED:", response);

      if (response && response.reference) {
        handleFinalOrder({
          reference: response.reference,
          status: response.status,
        });
      } else {
        console.error("No reference returned");
      }
    },

    onClose: function () {
      console.log(" PAYSTACK WINDOW CLOSED BY USER");
    },
  };

  const payNow = () => {
    const handler = window.PaystackPop.setup(paystackConfig);
    handler.openIframe();
  };

  return (
    <div className="bg-[#FBFBFB] min-h-screen">
      <Velouraheader />

      <main className="pt-40 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            <header className="space-y-2">
              <button
                onClick={() => navigate("/veloura/cart")}
                className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#7A8DAE] hover:text-[#1A2533] mb-4"
              >
                <ArrowLeft size={12} /> Return to Bag
              </button>
              <h1 className="text-4xl font-serif italic text-[#1A2533]">
                Shipping Dossier
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#7A8DAE]">
                Reference: {randomID}
              </p>
            </header>

            <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] font-bold">
                    Client Name
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInput}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-3 outline-none focus:border-[#1A2533] text-sm transition-all"
                    placeholder="Enter Full Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] font-bold">
                    Email for Digital Receipt
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInput}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-3 outline-none focus:border-[#1A2533] text-sm transition-all"
                    placeholder="client@veloura.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="relative space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] font-bold">
                    Country
                  </label>
                  <select
                    value={formData.countryCode}
                    onChange={(e) => {
                      const country = allCountries.find(
                        (c) => c.isoCode === e.target.value,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        country: country.name,
                        countryCode: e.target.value,
                      }));
                    }}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-3 outline-none appearance-none text-sm"
                  >
                    {allCountries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-0 bottom-3 opacity-30 pointer-events-none"
                    size={14}
                  />
                </div>

                <div className="relative space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] font-bold">
                    State / Region
                  </label>
                  <select
                    value={formData.stateCode}
                    onChange={(e) => {
                      const state = availableStates.find(
                        (s) => s.isoCode === e.target.value,
                      );
                      if (state) {
                        setFormData((prev) => ({
                          ...prev,
                          state: state.name,
                          stateCode: e.target.value,
                        }));
                      }
                    }}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-3 outline-none appearance-none text-sm"
                  >
                    {availableStates.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-0 bottom-3 opacity-30 pointer-events-none"
                    size={14}
                  />
                </div>

                <div className="relative space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#1A2533] font-bold">
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInput}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-3 outline-none appearance-none text-sm"
                  >
                    {availableCities.map((ct) => (
                      <option key={ct.name} value={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-0 bottom-3 opacity-30 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] font-bold">
                    Dispatch Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInput}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-3 outline-none focus:border-[#1A2533] text-sm transition-all"
                    placeholder="House/Apt Number & Street"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] font-bold">
                    Contact Number
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInput}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-3 outline-none focus:border-[#1A2533] text-sm transition-all"
                    placeholder="+234..."
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E0E7FF] p-10 rounded-sm sticky top-32">
              <h2 className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#1A2533] mb-8 border-b border-[#F0F4F8] pb-4">
                Atelier Manifest
              </h2>

              <div className="space-y-6 mb-10 max-h-72 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-18 bg-[#F0F4F8] rounded-sm overflow-hidden flex-shrink-0">
                        <img
                          src={item.images?.[0] || item.image}
                          className="w-full h-full object-cover mix-blend-multiply"
                          alt="item"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#1A2533] uppercase tracking-widest line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[9px] text-[#7A8DAE] uppercase mt-1">
                          Qty: {item.quantity || item.qty || 1} •{" "}
                          {item.selectedSize || item.size || "OS"} •{" "}
                          {item.selectedColor || item.color}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-serif italic text-[#1A2533]">
                      ₦
                      {(
                        Number(item.price) * (item.quantity || item.qty || 1)
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-[#E0E7FF]">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#7A8DAE]">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#7A8DAE]">
                  <span>Logistics</span>
                  <span className="text-[#27AE60] font-bold">
                    Complimentary
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#1A2533]">
                    Total Checkout
                  </span>
                  <span className="text-2xl font-serif italic text-[#1A2533]">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-10">
                {isFormComplete ? (
                  // <PaystackButton
                  //   {...paystackConfig}
                  //   className="w-full py-6 bg-[#1A2533] text-white flex items-center justify-center gap-4 hover:bg-[#7A8DAE] transition-all duration-700 shadow-xl shadow-[#1A2533]/10 cursor-pointer"
                  // >
                  //   <CreditCard size={18} />
                  //   <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                  //     Pay with Paystack
                  //   </span>
                  // </PaystackButton>
                  <button onClick={payNow}  className="w-full py-6 bg-[#1A2533] text-white flex items-center justify-center gap-4 hover:bg-[#7A8DAE] transition-all duration-700 shadow-xl shadow-[#1A2533]/10 cursor-pointer">Pay Now</button>
                ) : (
                  <button
                    onClick={() =>
                      alert(
                        "Please complete all fields in the shipping dossier.",
                      )
                    }
                    className="w-full py-6 bg-[#7A8DAE]/40 text-white flex items-center justify-center gap-4 cursor-not-allowed"
                  >
                    <CreditCard size={18} />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                      Complete Form to Pay
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[#BDC3C7]">
                <ShieldCheck size={14} />
                <p className="text-[8px] uppercase tracking-[0.2em]">
                  End-to-End Secure Transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <VelourabuttonNavbar />
    </div>
  );
};

export default VelouraCheckout;
