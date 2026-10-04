import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Stats from "./components/Stats";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

import SignUpForm from "./components/SignUpForm";
import Login from "./components/Login";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginRequired from "./components/LoginRequired";
import Wardrobe from "./components/Wardrobe";


function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </>
  );
}


export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Shown when user is not logged in */}
        <Route
          path="/login-required"
          element={<LoginRequired />}
        />
        <Route
    path="/wardrobe"
    element={
      <ProtectedRoute>
        <Wardrobe />
      </ProtectedRoute>
      }
    />
      </Routes>
    </BrowserRouter>
  );
}