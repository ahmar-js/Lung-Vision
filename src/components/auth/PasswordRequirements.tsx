import { passwordRequirements } from "@/lib/validations";

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-md border">
      <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
      <ul className="text-xs text-gray-600 space-y-1">
        {passwordRequirements.map((requirement) => {
          const isValid = requirement.test(password);
          return (
            <li
              key={requirement.id}
              className={`flex items-center ${
                isValid ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <span className="mr-2">
                {isValid ? '✓' : '•'}
              </span>
              {requirement.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
} 