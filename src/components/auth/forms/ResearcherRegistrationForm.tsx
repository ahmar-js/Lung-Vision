import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, GraduationCap, Building, FlaskConical, Upload, Shield, BookOpen, MapPin } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "../fields/FormField";
import { PasswordField } from "../fields/PasswordField";
import { SelectField } from "../fields/SelectField";
import { FileUploadField } from "../fields/FileUploadField";
import { CheckboxField } from "../fields/CheckboxField";
import { MultiStepForm } from "../MultiStepForm";
import { researcherRegistrationSchema } from "@/lib/validations";
import { popularCountryOptions } from "@/lib/countries";
import type { ResearcherRegistrationFormData } from "@/lib/validations";

interface ResearcherRegistrationFormProps {
  onSubmit: (data: ResearcherRegistrationFormData) => Promise<void>;
  isLoading: boolean;
}

const affiliationTypeOptions = [
  { value: "student", label: "Student (Undergraduate/Graduate)" },
  { value: "phd_student", label: "PhD Student" },
  { value: "postdoc", label: "Postdoctoral Researcher" },
  { value: "faculty", label: "Faculty Member" },
  { value: "research_scientist", label: "Research Scientist" },
  { value: "principal_investigator", label: "Principal Investigator" },
  { value: "industry_researcher", label: "Industry Researcher" },
  { value: "other", label: "Other" }
];

const purposeOfUseOptions = [
  { value: "academic_research", label: "Academic Research" },
  { value: "model_testing", label: "Model Testing & Validation" },
  { value: "algorithm_development", label: "Algorithm Development" },
  { value: "clinical_trial", label: "Clinical Trial Research" },
  { value: "thesis_project", label: "Thesis/Dissertation Project" },
  { value: "collaborative_study", label: "Collaborative Study" },
  { value: "educational_purpose", label: "Educational Purpose" },
  { value: "other", label: "Other" }
];

export function ResearcherRegistrationForm({ onSubmit, isLoading }: ResearcherRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const form = useForm<ResearcherRegistrationFormData>({
    resolver: zodResolver(researcherRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      researchInstitution: "",
      country: "",
      affiliationType: "",
      purposeOfUse: "",
      orcidId: "",
      institutionalId: null,
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

  const getFieldsForStep = (step: number): (keyof ResearcherRegistrationFormData)[] => {
    switch (step) {
      case 0:
        return ['fullName', 'email', 'password', 'confirmPassword'];
      case 1:
        return ['researchInstitution', 'country', 'affiliationType', 'purposeOfUse'];
      case 2:
        return ['institutionalId', 'agreeToTerms'];
      default:
        return [];
    }
  };

  const canProceedToNextStep = () => {
    const fields = getFieldsForStep(currentStep);
    return fields.every(field => {
      const value = watchAllFields[field];
      if (field === 'agreeToTerms') return value === true;
      if (field === 'orcidId') return true; // Optional field
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
          <Card className="p-6 bg-cyan-50/30 border-cyan-100">
            <CardContent className="p-0 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  label="Full Name"
                  placeholder="Dr. Jane Smith"
                  disabled={isLoading}
                  icon={User}
                />

                <FormField
                  control={form.control}
                  name="email"
                  label="Email Address"
                  placeholder="jane.smith@university.edu"
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
      id: 'research',
      title: 'Research Profile',
      description: 'Tell us about your research background and institutional affiliation.',
      content: (
        <Form {...form}>
          <div className="space-y-6">
            <Card className="p-6 bg-cyan-50/50 border-cyan-200">
              <CardContent className="p-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="researchInstitution"
                    label="Research Institution / University"
                    placeholder="Stanford University"
                    disabled={isLoading}
                    icon={Building}
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
                    name="affiliationType"
                    label="Affiliation Type"
                    placeholder="Select your affiliation"
                    options={affiliationTypeOptions}
                    disabled={isLoading}
                    icon={GraduationCap}
                  />

                  <SelectField
                    control={form.control}
                    name="purposeOfUse"
                    label="Research Purpose"
                    placeholder="Select your research purpose"
                    options={purposeOfUseOptions}
                    disabled={isLoading}
                    icon={FlaskConical}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <FormField
                        control={form.control}
                        name="orcidId"
                        label="ORCID ID (Optional)"
                        placeholder="0000-0000-0000-0000"
                        disabled={isLoading}
                        icon={GraduationCap}
                        hint="ORCID provides a persistent digital identifier for researchers. This helps us verify your research credentials."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Form>
      )
    },
    {
      id: 'verification',
      title: 'Verification & Agreement',
      description: 'Upload your institutional ID and review our terms.',
      content: (
        <Form {...form}>
          <div className="space-y-6">
            <Card className="p-6 bg-green-50/50 border-green-200">
              <CardContent className="p-0 space-y-6">
                <FileUploadField
                  control={form.control}
                  name="institutionalId"
                  label="Institutional ID Document"
                  placeholder="Click to upload your institutional ID"
                  acceptedFileTypes={".pdf,.jpg,.jpeg,.png"}
                  disabled={isLoading}
                  icon={Upload}
                  hint="Upload your Student ID, Faculty ID, or Employment Letter (PDF, JPG, JPEG, or PNG - max 5MB)"
                />
              </CardContent>
            </Card>

            <Card className="p-6 border-orange-200 bg-orange-50/50">
              <CardContent className="p-0">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-orange-900">Academic Use & Privacy</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Your research data is protected and used solely for academic purposes. 
                        We comply with institutional review board guidelines and research ethics standards.
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