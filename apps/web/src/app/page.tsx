"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";

function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none">
      <motion.div
        className="absolute top-1/4 left-1/4 h-125 w-125 rounded-full bg-primary/5 blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 h-100 w-100 rounded-full bg-primary/5 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 h-75 w-75 rounded-full bg-primary/3 blur-2xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function SearchCard() {
  const [arrival, setArrival] = useState("");
  const [destination, setDestination] = useState("");
  const [arrivalFocused, setArrivalFocused] = useState(false);
  const [destinationFocused, setDestinationFocused] = useState(false);

  const isDisabled = !arrival.trim() || !destination.trim();

  return (
    <motion.div
      className="relative z-10 mx-auto w-full max-w-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-sm">
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <motion.h2
              className="text-2xl font-semibold tracking-tight text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Find the cheapest way to get there
            </motion.h2>
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Compare rides, buses, trains & more
            </motion.p>
          </div>

          <motion.div
            className="space-y-0 rounded-xl border border-border bg-background/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div
              className={`relative flex items-center gap-3 p-4 transition-all duration-300 ${
                arrivalFocused ? "bg-primary/5" : ""
              }`}
            >
              <motion.div
                animate={{
                  color: arrivalFocused ? "oklch(0.67 0.16 58)" : undefined,
                }}
                transition={{ duration: 0.2 }}
              >
                <MapPin size={20} />
              </motion.div>
              <Input
                type="text"
                placeholder="From: Enter arrival point"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                onFocus={() => setArrivalFocused(true)}
                onBlur={() => setArrivalFocused(false)}
                className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
              />
              {arrival && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setArrival("")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </motion.button>
              )}
            </div>

            <Separator className="bg-border" />

            <div
              className={`relative flex items-center gap-3 p-4 transition-all duration-300 ${
                destinationFocused ? "bg-primary/5" : ""
              }`}
            >
              <motion.div
                animate={{
                  color: destinationFocused ? "oklch(0.67 0.16 58)" : undefined,
                }}
                transition={{ duration: 0.2 }}
              >
                <MapPin size={20} />
              </motion.div>
              <Input
                type="text"
                placeholder="To: Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setDestinationFocused(true)}
                onBlur={() => setDestinationFocused(false)}
                className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
              />
              {destination && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setDestination("")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </motion.button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              className="w-full rounded-xl py-6 text-sm font-semibold transition-all duration-300"
              disabled={isDisabled}
            >
              <span>Confirm Trip</span>
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        />
      </div>
    </motion.div>
  );
}

function WhatSection() {
  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What is Fairfare?
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Your all-in-one transportation search engine that compares prices
            across Uber, Lyft, taxis, public transit, and more. All in one
            place. Find the cheapest way to get to your destination instantly.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function WhySection() {
  const benefits = [
    {
      icon: "💰",
      title: "Save Money",
      description: "Find the cheapest transportation option for your trip",
    },
    {
      icon: "⏱️",
      title: "Save Time",
      description:
        "Compare all providers in one place. No more switching apps",
    },
    {
      icon: "🔍",
      title: "Transparent Pricing",
      description:
        "No hidden fees or surprise charges. What you see is what you get",
    },
  ];

  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why Choose Fairfare?
        </motion.h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="mb-4 text-4xl">{benefit.icon}</div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
              <motion.div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <ParticleBackground />

      <motion.header
        className="relative z-20 flex items-center justify-center py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Fairfare
        </h1>
      </motion.header>

      <div className="flex flex-1 flex-col items-center justify-start px-4">
        <SearchCard />
        <WhatSection />
        <WhySection />
      </div>

      <footer className="relative z-10 border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 Fairfare. All rights reserved.</p>
      </footer>
    </main>
  );
}
