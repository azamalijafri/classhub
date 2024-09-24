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

interface ComboBoxProps {
  items: { id: string; label: string }[];
  placeholder?: string;
  label?: string;
  onSelect: (selectedId: string) => void;
  selectedValue: string | undefined;
  disabled?: boolean;
  pickMode?: boolean;
}

const ComboBox: React.FC<ComboBoxProps> = ({
  items,
  placeholder = "Select an item",
  label,
  onSelect,
  selectedValue,
  disabled,
  pickMode,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    selectedValue
  );

  const handleSelect = (itemId: string) => {
    if (selectedItem === itemId) {
      onSelect("");
      if (!pickMode) setSelectedItem(undefined);
    } else {
      if (!pickMode) setSelectedItem(itemId);
      onSelect(itemId);
    }

    setOpen(false);
  };

  return (
    <div className="space-y-2 relative">
      {label && <Label>{label}</Label>}
      <Button
        disabled={disabled}
        variant={"outline"}
        className="w-full border border-gray-300 rounded p-2 text-left overflow-hidden text-ellipsis"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)} // Toggle dropdown on button click
      >
        {selectedItem
          ? items.find((item) => item.id === selectedItem)?.label ?? placeholder
          : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 float-right" />
      </Button>
      {open && (
        <div className="absolute z-50 w-full border-[1px] rounded-md mb-4 bg-white">
          <Command className="z-50">
            <CommandInput placeholder={`${placeholder}...`} />
            <CommandList id="item-list">
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {items.map((item, index) => (
                  <CommandItem
                    key={index}
                    value={item.label}
                    onSelect={() => handleSelect(item.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        item.id === selectedItem ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default ComboBox;
