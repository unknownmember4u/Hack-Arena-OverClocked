"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ImageUpload } from "@/components/ui/image-upload";
import { TextSplit } from "@/components/ui/split-text";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  Briefcase,
  Phone,
  MapPin,
  Building2,
  Hash,
  FileText,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

const CITIES = [
  "Civil Lines",
  "Dharampeth",
  "Ramdaspeth",
  "Manish Nagar",
  "Others",
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

interface FormData {
  fullName: string;
  age: string;
  gender: string;
  occupation: string;
  mobile: string;
  city: string;
  customCity: string;
  state: string;
  pincode: string;
  address: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function VerificationForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    age: "",
    gender: "",
    occupation: "",
    mobile: "",
    city: "",
    customCity: "",
    state: "",
    pincode: "",
    address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().split(/\s+/).length < 2)
      newErrors.fullName = "Enter your full name (first & last)";

    const age = parseInt(formData.age, 10);
    if (!formData.age || isNaN(age) || age < 18)
      newErrors.age = "Must be 18 or older";
    if (age > 120) newErrors.age = "Please enter a valid age";

    if (!formData.gender) newErrors.gender = "Select your gender";
    if (!formData.occupation.trim()) newErrors.occupation = "Required";

    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Enter a valid 10-digit number";

    if (!formData.city) newErrors.city = "Select a city";
    if (formData.city === "Others" && !formData.customCity.trim())
      newErrors.customCity = "Enter your city name";

    if (!formData.state) newErrors.state = "Select your state";

    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Enter a valid 6-digit pincode";

    if (!formData.address.trim()) newErrors.address = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Simulate submission delay
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const inputBase =
    "w-full rounded-xl border border-black/10 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40 transition-all shadow-sm shadow-black/[0.02]";
  const selectBase =
    "w-full rounded-xl border border-black/10 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm text-[#1a1a1a] appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40 transition-all shadow-sm shadow-black/[0.02]";
  const labelBase = "text-xs font-bold text-black/50 uppercase tracking-widest mb-1.5 flex items-center gap-2";
  const errorBase = "text-[10px] text-red-500 font-semibold mt-1";

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {/* ── Personal Information ── */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/30 border-b border-black/5 pb-2">
            Personal Details
          </h3>

          {/* Full Name */}
          <div>
            <label className={labelBase}>
              <User className="h-3.5 w-3.5" /> Full Name
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className={inputBase}
            />
            {errors.fullName && <p className={errorBase}>{errors.fullName}</p>}
          </div>

          {/* Age + Gender row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>
                <Calendar className="h-3.5 w-3.5" /> Age
              </label>
              <input
                name="age"
                type="number"
                min={18}
                max={120}
                value={formData.age}
                onChange={handleChange}
                placeholder="18+"
                className={inputBase}
              />
              {errors.age && <p className={errorBase}>{errors.age}</p>}
            </div>
            <div>
              <label className={labelBase}>
                <User className="h-3.5 w-3.5" /> Gender
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={selectBase}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30 pointer-events-none" />
              </div>
              {errors.gender && <p className={errorBase}>{errors.gender}</p>}
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label className={labelBase}>
              <Briefcase className="h-3.5 w-3.5" /> Occupation
            </label>
            <input
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g. Tour Operator"
              className={inputBase}
            />
            {errors.occupation && <p className={errorBase}>{errors.occupation}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label className={labelBase}>
              <Phone className="h-3.5 w-3.5" /> Mobile No.
            </label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData((p) => ({ ...p, mobile: v }));
                if (errors.mobile) setErrors((p) => { const n = { ...p }; delete n.mobile; return n; });
              }}
              placeholder="10-digit number"
              className={inputBase}
              inputMode="numeric"
            />
            {errors.mobile && <p className={errorBase}>{errors.mobile}</p>}
          </div>
        </div>

        {/* ── Address Section ── */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/30 border-b border-black/5 pb-2">
            Address Details
          </h3>

          {/* City */}
          <div>
            <label className={labelBase}>
              <Building2 className="h-3.5 w-3.5" /> City
            </label>
            <div className="relative">
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={selectBase}
              >
                <option value="">Select City</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30 pointer-events-none" />
            </div>
            {errors.city && <p className={errorBase}>{errors.city}</p>}
          </div>

          {/* Custom city input */}
          {formData.city === "Others" && (
            <div>
              <label className={labelBase}>
                <MapPin className="h-3.5 w-3.5" /> Your City
              </label>
              <input
                name="customCity"
                value={formData.customCity}
                onChange={handleChange}
                placeholder="Enter your city"
                className={inputBase}
              />
              {errors.customCity && <p className={errorBase}>{errors.customCity}</p>}
            </div>
          )}

          {/* State + Pincode row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>
                <MapPin className="h-3.5 w-3.5" /> State
              </label>
              <div className="relative">
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={selectBase}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30 pointer-events-none" />
              </div>
              {errors.state && <p className={errorBase}>{errors.state}</p>}
            </div>
            <div>
              <label className={labelBase}>
                <Hash className="h-3.5 w-3.5" /> Pincode
              </label>
              <input
                name="pincode"
                value={formData.pincode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormData((p) => ({ ...p, pincode: v }));
                  if (errors.pincode) setErrors((p) => { const n = { ...p }; delete n.pincode; return n; });
                }}
                placeholder="6 digits"
                className={inputBase}
                inputMode="numeric"
              />
              {errors.pincode && <p className={errorBase}>{errors.pincode}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelBase}>
              <FileText className="h-3.5 w-3.5" /> Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full residential address"
              rows={3}
              className={`${inputBase} resize-none`}
            />
            {errors.address && <p className={errorBase}>{errors.address}</p>}
          </div>
        </div>

        {/* ── Document Upload ── */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/30 border-b border-black/5 pb-2">
            Document Upload
          </h3>
          <p className="text-[11px] text-black/40">Upload a government-issued ID (Aadhaar, PAN, etc.)</p>
          <ImageUpload />
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white text-sm font-bold uppercase tracking-widest hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit for Verification"
          )}
        </button>
      </form>

      {/* ── Success Popup Overlay (Portal to body) ── */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Backdrop */}
                <motion.div
                  className="absolute inset-0 bg-black/40 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSuccess(false)}
                />

                {/* Card */}
                <motion.div
                  className="relative z-10 max-w-lg w-full rounded-[2.5rem] p-10 md:p-14 text-center space-y-8"
                  style={{
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 25px 80px rgba(0, 0, 0, 0.08)",
                  }}
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Animated Green Tick */}
                  <motion.div
                    className="mx-auto w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4, duration: 0.4, type: "spring" }}
                    >
                      <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                    </motion.div>
                  </motion.div>

                  {/* TextSplit Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <TextSplit
                      className="text-2xl md:text-3xl font-bold text-[#1a1a1a] tracking-tight"
                      maxMove={120}
                      falloff={0.15}
                    >
                      Submitted Successfully
                    </TextSplit>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    className="text-black/50 text-sm md:text-base leading-relaxed max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.5 }}
                  >
                    Your information is sent to the Admin and is under process. It may take{" "}
                    <span className="font-bold text-black/70">2–3 working days</span>{" "}
                    to verify you.
                  </motion.p>

                  {/* Status Badge */}
                  <motion.div
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-bold uppercase tracking-widest text-amber-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Under Review
                  </motion.div>

                  {/* Close button */}
                  <motion.button
                    onClick={() => setShowSuccess(false)}
                    className="block mx-auto mt-4 text-xs font-semibold text-black/30 hover:text-black/60 transition-colors uppercase tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.4 }}
                  >
                    Close
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
