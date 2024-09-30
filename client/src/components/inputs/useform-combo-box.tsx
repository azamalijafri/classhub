/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "../ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Control, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

interface ComboBoxProps {
  items: { id: string; label: string }[];
  control: Control<any>;
  name: string;
  placeholder?: string;
  label?: string;
  isAbsolute?: boolean;
}

const ComboBox = ({
  items,
  control,
  name,
  placeholder = "Select an item",
  label,
  isAbsolute,
}: ComboBoxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <div className="space-y-2">
          <Label className="text-base">{label}</Label>

          <Button
            variant={"outline"}
            className="w-full border border-gray-300 rounded p-2 text-left"
            role="combobox"
            aria-expanded={open}
            aria-controls="item-list"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {value
              ? items.find((item) => item.id === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 float-right" />
          </Button>
          <AnimatePresence>
            {open && (
              <motion.div
                className={cn(
                  isAbsolute && "absolute",
                  "z-50 w-full mt-1 border-[1px] rounded-md mb-4 bg-white shadow-md"
                )}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Command className="h-40">
                  <CommandInput placeholder={`Search ${placeholder}...`} />
                  <CommandList id="item-list">
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.label}
                          onSelect={() => {
                            onChange(item.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              item.id === value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    />
  );
};

export default ComboBox;
