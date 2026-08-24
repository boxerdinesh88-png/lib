"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, apiErrorFields, apiErrorMessage } from "@/lib/api";
import type { Gender } from "@/lib/types";
import { AlertCircle, BadgeCheck, Camera, Eye, EyeOff, FileText, GraduationCap, Lock, Mail, Phone, School, User2, Wifi } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
// Smaller than a typical phone snapshot so the multipart POST stays light —
// a big upload over a mobile connection can get reset mid-flight, which the
// browser reports as ERR_NETWORK.
const MAX_IMAGE_DIMENSION = 1024;
const MAX_IMAGE_UPLOAD_BYTES = 1024 * 1024;
// Types the backend accepts after client-side re-encoding.
const FINAL_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Extra formats we accept at pick time because we can re-encode them (e.g.
// iPhone HEIC decodes fine on iOS Safari and gets converted to JPEG).
const PICKABLE_IMAGE_TYPES = [...FINAL_IMAGE_TYPES, "image/heic", "image/heif"];

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = url;
  });
}

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
    if (scale === 1 && file.size <= MAX_UPLOAD_BYTES && FINAL_IMAGE_TYPES.includes(file.type)) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.75)
    );
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "upload";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const JOIN_PURPOSES = [
  "Daily study",
  "Exam preparation",
  "Competitive exam",
  "Project work",
  "Reading & research",
  "Other",
];

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  aadhar_document?: string;
  photo?: string;
  purpose?: string;
  class_name?: string;
  wifi_device_name?: string;
  password?: string;
  confirm_password?: string;
}

function validate(values: {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  aadhar_document: File | null;
  photo: File | null;
  purpose: string;
  class_name: string;
  password: string;
  confirm_password: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 3) errors.name = "Please enter your full name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address";
  const phoneDigits = values.phone.replace(/\D/g, "");
  const localPhone = phoneDigits.length > 10 && phoneDigits.startsWith("91") ? phoneDigits.slice(2) : phoneDigits;
  if (!/^[6-9]\d{9}$/.test(localPhone)) errors.phone = "Enter a valid 10-digit mobile number";
  if (!values.aadhar_document) errors.aadhar_document = "Please upload your Aadhaar card";
  if (!values.purpose) errors.purpose = "Select your purpose to join";
  if (!values.class_name.trim()) errors.class_name = "Enter your class / standard";
  if (!values.photo) errors.photo = "Please upload a profile photo";
  if (values.password.length < 8) errors.password = "Password must be at least 8 characters";
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password))
    errors.password = "Use a mix of uppercase, lowercase and numbers";
  if (values.password !== values.confirm_password) errors.confirm_password = "Passwords do not match";
  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "female" as Gender,
    purpose: "",
    class_name: "",
    wifi_device_name: "",
    password: "",
    confirm_password: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aadharDoc, setAadharDoc] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const aadharRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // The free-tier backend sleeps after ~5 min idle and can take several
    // seconds to boot, dropping the first request's connection while it wakes.
    // Keep a quiet heartbeat going while the visitor fills the form so their
    // submit doesn't hit a cold boot — deliberately no visible status pill.
    const ping = () => api.get("/shifts/", { timeout: 30000 }).catch(() => {});
    ping();
    const id = window.setInterval(ping, 60000);
    return () => window.clearInterval(id);
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setFormError("");
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, photo: "Please choose a JPEG, PNG or WebP image." }));
      return;
    }
    const processed = await compressImage(file);
    if (!FINAL_IMAGE_TYPES.includes(processed.type)) {
      // e.g. HEIC on Android Chrome can't be decoded, so it was never re-encoded.
      setErrors((e) => ({ ...e, photo: "This photo format isn't supported. Please choose a JPEG, PNG or WebP image." }));
      return;
    }
    if (processed.size > MAX_IMAGE_UPLOAD_BYTES) {
      setErrors((e) => ({ ...e, photo: "Photo is too large for a phone upload. Choose a smaller photo." }));
      return;
    }
    setErrors((e) => ({ ...e, photo: undefined }));
    setPhoto(processed);
    setPhotoPreview(URL.createObjectURL(processed));
  }

  async function handleAadhar(file: File | undefined) {
    if (!file) return;
    setFormError("");
    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
      setErrors((e) => ({ ...e, aadhar_document: "Please choose a JPEG, PNG, WebP or PDF file." }));
      return;
    }
    if (file.type.includes("pdf") && file.size > MAX_UPLOAD_BYTES) {
      setErrors((e) => ({ ...e, aadhar_document: "File must be 5 MB or smaller." }));
      return;
    }
    const processed = file.type.startsWith("image/") ? await compressImage(file) : file;
    if (file.type.startsWith("image/") && !FINAL_IMAGE_TYPES.includes(processed.type)) {
      setErrors((e) => ({ ...e, aadhar_document: "This file format isn't supported. Please choose a JPEG, PNG, WebP or PDF." }));
      return;
    }
    const cap = file.type.startsWith("image/") ? MAX_IMAGE_UPLOAD_BYTES : MAX_UPLOAD_BYTES;
    if (processed.size > cap) {
      setErrors((e) => ({ ...e, aadhar_document: "File is too large for a phone upload. Choose a smaller file." }));
      return;
    }
    setErrors((e) => ({ ...e, aadhar_document: undefined }));
    setAadharDoc(processed);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const errs = validate({ ...form, photo, aadhar_document: aadharDoc });
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    try {
      await register({ ...form, photo, aadhar_document: aadharDoc });
      toast("Account created", "success", "We sent a verification code to your email.");
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
      router.refresh();
    } catch (err) {
      const fields = apiErrorFields(err);
      if (fields) {
        setErrors({
          name: fields.name?.[0],
          email: fields.email?.[0],
          phone: fields.phone?.[0],
          gender: fields.gender?.[0],
          aadhar_document: fields.aadhar_document?.[0],
          photo: fields.photo?.[0],
          purpose: fields.purpose?.[0],
          class_name: fields.class_name?.[0],
          wifi_device_name: fields.wifi_device_name?.[0],
          password: fields.password?.[0],
          confirm_password: fields.confirm_password?.[0],
        });
      } else {
        // Network / timeout / CORS / server errors belong to the whole form,
        // not under a single field like the email address.
        setFormError(apiErrorMessage(err, "Registration failed. Please try again."));
      }
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="h-display text-2xl font-bold text-secondary-900 dark:text-white">Create your account</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Sign up in under a minute and reserve your study seat.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0">{formError}</span>
          </div>
        )}

        {/* Profile photo */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-800 dark:text-slate-200">
            Profile photo
          </label>
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white/60 text-slate-400 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-white/15 dark:bg-white/5 sm:h-20 sm:w-20"
              aria-label={photo ? "Change profile photo" : "Upload profile photo"}
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an asset
                <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-6 w-6 sm:h-7 sm:w-7" />
              )}
            </button>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-secondary-900 dark:text-white">
                {photo ? photo.name : "Upload a recent photo"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                JPEG, PNG or WebP. This photo shows on your profile. Large photos are compressed.
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                {photo ? "Change photo" : "Choose photo"}
              </button>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={PICKABLE_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
          {errors.photo && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.photo}</p>}
        </div>

        <Input
          label="Full name"
          name="name"
          icon={<User2 className="h-4 w-4" />}
          placeholder="Aarav Sharma"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
          required
          autoComplete="name"
        />
        <Input
          label="Email address"
          type="email"
          name="email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="you@college.edu"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <Input
          label="Mobile number"
          type="tel"
          name="phone"
          icon={<Phone className="h-4 w-4" />}
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
          required
          autoComplete="tel"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-slate-300">Gender section</label>
          <div className="grid grid-cols-3 gap-2">
            {(["male", "female", "other"] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => update("gender", g)}
                className={`min-w-0 rounded-xl border px-2 py-2.5 text-center text-sm font-medium capitalize transition-colors sm:px-3 ${
                  form.gender === g
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/10 dark:text-slate-400"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && <p className="mt-1 text-xs font-medium text-rose-500">{errors.gender}</p>}
        </div>

        <Input
          label="Class / Standard"
          name="class_name"
          icon={<School className="h-4 w-4" />}
          placeholder="e.g. 12th, B.Sc 2nd year"
          value={form.class_name}
          onChange={(e) => update("class_name", e.target.value)}
          error={errors.class_name}
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-800 dark:text-slate-200">
            Aadhaar card upload
          </label>
          <button
            type="button"
            onClick={() => aadharRef.current?.click()}
            className={`flex w-full items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-left transition-colors ${
              aadharDoc
                ? "border-emerald-400 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                : "border-slate-300 bg-white/60 hover:border-primary-400 dark:border-white/15 dark:bg-white/5"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
              <FileText className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-sm">
              <span className="block font-medium text-secondary-900 dark:text-white">
                {aadharDoc ? aadharDoc.name : "Upload Aadhaar card photo / PDF"}
              </span>
              <span className="block truncate text-xs text-slate-400">
                {aadharDoc ? "Click to change" : "JPEG, PNG or PDF (max 5 MB)"}
              </span>
            </span>
          </button>
          <input
            ref={aadharRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleAadhar(e.target.files?.[0])}
          />
          {errors.aadhar_document && (
            <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.aadhar_document}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-slate-300">
            Purpose to join
          </label>
          <div className="grid grid-cols-2 gap-2">
            {JOIN_PURPOSES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => update("purpose", p)}
                className={`min-w-0 rounded-xl border px-2 py-2.5 text-center text-sm font-medium transition-colors sm:px-3 ${
                  form.purpose === p
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/10 dark:text-slate-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {errors.purpose && <p className="mt-1 text-xs font-medium text-rose-500">{errors.purpose}</p>}
        </div>

        <Input
          label="Wi-Fi device name"
          name="wifi_device_name"
          icon={<Wifi className="h-4 w-4" />}
          placeholder="e.g. Aarav-Laptop"
          value={form.wifi_device_name}
          onChange={(e) => update("wifi_device_name", e.target.value)}
          error={errors.wifi_device_name}
          required
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="8+ chars, A-Z, a-z, 0-9"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          required
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-slate-400 transition-colors hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          name="confirm_password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="Re-enter your password"
          value={form.confirm_password}
          onChange={(e) => update("confirm_password", e.target.value)}
          error={errors.confirm_password}
          required
          autoComplete="new-password"
        />

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          <GraduationCap className="h-5 w-5" /> Create account
        </Button>
      </form>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <BadgeCheck className="h-3.5 w-3.5 text-accent" />
        By signing up you agree to our Terms of Service & Privacy Policy.
      </p>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" prefetch className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
