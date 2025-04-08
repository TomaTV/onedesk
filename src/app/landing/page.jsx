"use client";
import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
    </main>
  );
}
