/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const TextInput = ({
  control,
  name,
  label,
  placeholder,
  type,
  error,
}: {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "password";
  error?: string;
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="flex flex-col gap-y-2">
              <Label>{label}</Label>
              <Input {...field} placeholder={placeholder} type={type} />
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default TextInput;
