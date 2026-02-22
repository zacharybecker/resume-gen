interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextInput({ value, onChange }: TextInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Additional Information
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Paste any additional information about your experience, skills, projects, or anything else you'd like included in your resume..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-dark placeholder-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
      />
    </div>
  );
}
