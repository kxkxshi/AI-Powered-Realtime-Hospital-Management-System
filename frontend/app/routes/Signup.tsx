import type { Route } from "../+types/root";
import {
  Activity,
  Lock,
  Mail,
  ChevronRight,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";
import { CustomInput } from "@/components/global/CustomInput";
import { CustomSelect } from "@/components/global/CustomSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useNavigate, Navigate, Link } from "react-router";
import { signupSchema } from "@/components/auth/signup.schema";
import Loader from "@/components/global/Loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up" },
    { name: "description", content: "Create your MedFlow account" },
  ];
}

type SignupFormValues = z.infer<typeof signupSchema>;

const roleOptions = [
  { label: "Patient", value: "patient" },
  { label: "Doctor", value: "doctor" },
  { label: "Nurse", value: "nurse" },
  { label: "Pharmacist", value: "pharmacist" },
  { label: "Lab Technician", value: "lab_tech" },
  { label: "Admin", value: "admin" },
];

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const departmentOptions = [
  { label: "Cardiology", value: "Cardiology" },
  { label: "Neurology", value: "Neurology" },
  { label: "Orthopedics", value: "Orthopedics" },
  { label: "Pediatrics", value: "Pediatrics" },
  { label: "General Medicine", value: "General Medicine" },
  { label: "Surgery", value: "Surgery" },
  { label: "Emergency", value: "Emergency" },
];

const Signup = () => {
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "patient",
      gender: undefined,
      age: "",
      department: "",
      specialization: "",
      agreeToTerms: false,
    },
  });

  if (isPending) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader label="Loading..." />
      </div>
    );
  }

  // Redirect if logged in
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: SignupFormValues) => {
    setGlobalError("");
    setIsLoading(true);

    try {
      // Create sign-up data object with only non-undefined fields
      const signupData: Record<string, any> = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      // Add role and optional fields
      if (data.role) {
        // better-auth uses a separate role assignment, we'll store role info in metadata
        signupData.role = data.role;
      }

      if (data.gender) {
        signupData.gender = data.gender;
      }

      if (data.age) {
        signupData.age = data.age;
      }

      if (data.department) {
        signupData.department = data.department;
      }

      if (data.specialization && (data.role === "doctor" || data.role === "specialist")) {
        signupData.specialization = data.specialization;
      }

      await authClient.signUp.email(
        {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: async () => {
            // After signup, set the role
            if (data.role && data.role !== "patient") {
              try {
                // Set the user role
                // Note: Make sure the user is authenticated first
                await authClient.admin.setRole(
                  {
                    userId: (await authClient.getSession()).data?.user.id || "",
                    role: data.role,
                  },
                  {
                    onError: (ctx) => {
                      console.warn("Could not set role:", ctx.error.message);
                    },
                  }
                );
              } catch (error) {
                console.warn("Role setting failed, user created but role not set");
              }
            }

            toast.success("Account created successfully! Redirecting...");
            navigate("/dashboard");
          },
          onError: (ctx) => {
            setGlobalError(
              ctx.error.message || "Failed to create account. Please try again."
            );
          },
        }
      );
    } catch (error) {
      setGlobalError("An unexpected error occurred. Please try again.");
      console.error("Signup error:", error);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-10">
      <Card className="rounded-lg shadow-2xl card backdrop-blur-xl">
        <CardContent className="p-10 min-w-100 md:min-w-140.5 max-h-[90vh] overflow-y-auto">
          {/* logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-linear-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
              <Activity className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              MedFlow AI
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
              Create Your Account
            </p>
          </div>

          {/* global error */}
          {globalError && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/50 animate-in slide-in-from-top-2 fade-in">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-medium">{globalError}</span>
            </div>
          )}

          {/* form */}
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Name */}
            <CustomInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              type="text"
              startIcon={<User size={18} />}
            />

            {/* Email */}
            <CustomInput
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="name@hospital.com"
              type="email"
              startIcon={<Mail size={18} />}
            />

            {/* Role */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Role
              </label>
              <CustomSelect
                control={form.control}
                name="role"
                options={roleOptions}
                placeholder="Select your role"
                onValueChange={setSelectedRole}
              />
            </div>

            {/* Password */}
            <CustomInput
              control={form.control}
              name="password"
              label="Password"
              placeholder="••••••••"
              type="password"
              startIcon={<Lock size={18} />}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              • At least 8 characters • 1 uppercase letter • 1 number
            </p>

            {/* Confirm Password */}
            <CustomInput
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              type="password"
              startIcon={<Lock size={18} />}
            />

            {/* Optional Fields */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-wide">
                Optional Information
              </p>

              {/* Gender */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Gender
                </label>
                <CustomSelect
                  control={form.control}
                  name="gender"
                  options={genderOptions}
                  placeholder="Select gender"
                />
              </div>

              {/* Age */}
              <CustomInput
                control={form.control}
                name="age"
                label="Age"
                placeholder="25"
                type="text"
                startIcon={<Calendar size={18} />}
              />

              {/* Department */}
              {(selectedRole === "doctor" ||
                selectedRole === "nurse" ||
                selectedRole === "lab_tech") && (
                <div className="mb-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Department
                  </label>
                  <CustomSelect
                    control={form.control}
                    name="department"
                    options={departmentOptions}
                    placeholder="Select department"
                  />
                </div>
              )}

              {/* Specialization (for doctors) */}
              {selectedRole === "doctor" && (
                <CustomInput
                  control={form.control}
                  name="specialization"
                  label="Specialization"
                  placeholder="e.g., Cardiology, Neurology"
                  type="text"
                />
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2 py-3">
              <Checkbox
                id="terms"
                onCheckedChange={(checked) =>
                  form.setValue("agreeToTerms", checked as boolean)
                }
                className="mt-1 border-slate-200 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label
                htmlFor="terms"
                className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                I agree to the terms and conditions and privacy policy
              </label>
            </div>
            {form.formState.errors.agreeToTerms && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {form.formState.errors.agreeToTerms.message}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-2xl py-6 font-bold text-base shadow-xl shadow-slate-200 dark:shadow-blue-900/20 transition-all active:scale-[0.98] group mt-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create Account
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              )}
            </Button>

            {/* Sign In Link */}
            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
