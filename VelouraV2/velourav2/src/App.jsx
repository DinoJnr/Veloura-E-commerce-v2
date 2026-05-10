import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VelouraHome from "./Components/VelouraHome";
import VelouraTopNavbar from "./Components/Velouratopnavbar ";
import VelouraAbout from "./Components/VelouraAbout";
import Velouracontact from "./Components/Velouracontact";
import VelouraStore from "./Components/VelouraStore";
import VelouraProductDetails from "./Components/VelouraProductDetails";
import VelouraCartDrawer from "./Components/VelouraCartDrawer";
import VelouraWishlist from "./Components/VelouraWishlist";
import VelouraCheckout from "./Components/VelouraCheckout";


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/nab"
            element={<VelouraTopNavbar></VelouraTopNavbar>}
          ></Route>
          <Route
            path="/veloura/aboutus"
            element={<VelouraAbout></VelouraAbout>}
          ></Route>
          <Route path="/" element={<VelouraHome></VelouraHome>}></Route>
          <Route
            path="/veloura/contactus"
            element={<Velouracontact></Velouracontact>}
          ></Route>
          <Route
            path="/veloura/store"
            element={<VelouraStore></VelouraStore>}
          ></Route>
          <Route
            path="/veloura/productdetails"
            element={<VelouraProductDetails></VelouraProductDetails>}
          ></Route>
          <Route
            path="/veloura/wishlist"
            element={<VelouraWishlist></VelouraWishlist>}
          ></Route>
          <Route
            path="/veloura/cart"
            element={<VelouraCartDrawer></VelouraCartDrawer>}
          ></Route>
          <Route path="/veloura/checkout" element={<VelouraCheckout></VelouraCheckout>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
