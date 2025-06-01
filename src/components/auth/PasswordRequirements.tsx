import { passwordRequirements } from "@/lib/validations";

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-3">Password Requirements:</p>
      <ul className="text-sm text-gray-600 space-y-2">
        {passwordRequirements.map((requirement) => {
          const isValid = requirement.test(password);
          return (
            <li
              key={requirement.id}
              className={`flex items-center transition-colors duration-200 ${
                isValid ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              <span className={`mr-3 text-sm font-medium ${
                isValid ? 'text-green-500' : 'text-gray-400'
              }`}>
                {isValid ? '✓' : '•'}
              </span>
              <span className={isValid ? 'line-through opacity-75' : ''}>
                {requirement.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 