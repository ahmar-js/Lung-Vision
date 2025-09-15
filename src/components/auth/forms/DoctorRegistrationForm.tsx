import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, Stethoscope, Building2, Phone, MapPin, Upload, Shield } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "../fields/FormField";
import { PasswordField } from "../fields/PasswordField";
import { SelectField } from "../fields/SelectField";
import { FileUploadField } from "../fields/FileUploadField";
import { CheckboxField } from "../fields/CheckboxField";
import { MultiStepForm } from "../MultiStepForm";
import { doctorRegistrationSchema } from "@/lib/validations";
import { popularCountryOptions } from "@/lib/countries";
import type { DoctorRegistrationFormData } from "@/lib/validations";

interface DoctorRegistrationFormProps {
  onSubmit: (data: DoctorRegistrationFormData) => Promise<void>;
  isLoading: boolean;
}

const specializationOptions = [
  { value: "pulmonologist", label: "Pulmonologist" },
  { value: "radiologist", label: "Radiologist" },
  { value: "internist", label: "Internal Medicine" },
  { value: "emergency", label: "Emergency Medicine" },
  { value: "family", label: "Family Medicine" },
  { value: "thoracic_surgeon", label: "Thoracic Surgeon" },
  { value: "respiratory_therapist", label: "Respiratory Therapist" },
  { value: "other", label: "Other" }
];

// Using comprehensive country list from countries.ts

export function DoctorRegistrationForm({ onSubmit, isLoading }: DoctorRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const form = useForm<DoctorRegistrationFormData>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      medicalLicenseNumber: "",
      country: "",
      specialization: "",
      hospitalAffiliation: "",
      phoneNumber: "",
      medicalLicense: null,
      agreeToTerms: false,
    },
  });

  const watchedPassword = form.watch("password");
  const watchAllFields = form.watch();

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      try {
        await onSubmit(form.getValues());
        form.reset();
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
  };

  const validateCurrentStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    return await form.trigger(fieldsToValidate);
  };

  const getFieldsForStep = (step: number): (keyof DoctorRegistrationFormData)[] => {
    switch (step) {
      case 0:
        return ['fullName', 'email', 'password', 'confirmPassword'];
      case 1:
        return ['medicalLicenseNumber', 'country', 'specialization', 'hospitalAffiliation'];
      case 2:
        return ['medicalLicense', 'agreeToTerms'];
      default:
        return [];
    }
  };

  const canProceedToNextStep = () => {
    const fields = getFieldsForStep(currentStep);
    return fields.every(field => {
      const value = watchAllFields[field];
      if (field === 'agreeToTerms') return value === true;
      return value && value !== '';
    });
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && canProceedToNextStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Let\'s start with your basic information and account credentials.',
      content: (
        <Form {...form}>
          <Card className="p-6 bg-blue-50/30 border-blue-100">
            <CardContent className="p-0 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  label="Full Name"
                  placeholder="Dr. John Doe"
                  disabled={isLoading}
                  icon={User}
                />

                <FormField
                  control={form.control}
                  name="email"
                  label="Email Address"
                  placeholder="john.doe@hospital.com"
                  type="email"
                  disabled={isLoading}
                  icon={Mail}
                />
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <PasswordField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  showRequirements={true}
                  currentValue={watchedPassword}
                />

                <PasswordField
                  control={form.control}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </Form>
      )
    },
    {
      id: 'professional',
      title: 'Professional Details',
      description: 'Tell us about your medical practice and professional background.',
      content: (
        <Form {...form}>
          <div className="space-y-6">
            <Card className="p-6 bg-blue-50/50 border-blue-200">
              <CardContent className="p-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="medicalLicenseNumber"
                    label="Medical License Number"
                    placeholder="ML123456789"
                    disabled={isLoading}
                    icon={Stethoscope}
                  />

                  <SelectField
                    control={form.control}
                    name="country"
                    label="Country / Region"
                    placeholder="Select your country"
                    options={popularCountryOptions}
                    disabled={isLoading}
                    icon={MapPin}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <SelectField
                    control={form.control}
                    name="specialization"
                    label="Medical Specialization"
                    placeholder="Select your specialization"
                    options={specializationOptions}
                    disabled={isLoading}
                    icon={Stethoscope}
                  />

                  <FormField
                    control={form.control}
                    name="hospitalAffiliation"
                    label="Hospital / Clinic"
                    placeholder="General Hospital"
                    disabled={isLoading}
                    icon={Building2}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  label="Phone Number (Optional)"
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  disabled={isLoading}
                  icon={Phone}
                />
              </CardContent>
            </Card>
          </div>
        </Form>
      )
    },
    {
      id: 'verification',
      title: 'Verification & Agreement',
      description: 'Upload your medical license and review our terms.',
      content: (
        <Form {...form}>
          <div className="space-y-6">
            <Card className="p-6 bg-green-50/50 border-green-200">
              <CardContent className="p-0 space-y-6">
                <FileUploadField
                  control={form.control}
                  name="medicalLicense"
                  label="Medical License Document"
                  placeholder="Click to upload your medical license"
                  acceptedFileTypes={".pdf,.jpg,.jpeg,.png"}
                  disabled={isLoading}
                  icon={Upload}
                  hint="Upload a clear copy of your medical license (PDF, JPG, JPEG, or PNG - max 5MB)"
                />
              </CardContent>
            </Card>

            <Card className="p-6 border-orange-200 bg-orange-50/50">
              <CardContent className="p-0">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-orange-900">Privacy & Security</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Your information is encrypted and securely stored. We comply with HIPAA regulations 
                        and never share your data without consent.
                      </p>
                    </div>
                    
                    <CheckboxField
                      control={form.control}
                      name="agreeToTerms"
                      label="I agree to the Terms & Conditions and Privacy Policy"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Form>
      )
    }
  ];

  return (
    <MultiStepForm
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      canProceed={canProceedToNextStep()}
      className="max-w-4xl"
    />
  );
}