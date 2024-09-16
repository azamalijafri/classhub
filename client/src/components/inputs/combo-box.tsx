import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
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
  selectedValue: string;
  disabled?: boolean;
}

const ComboBox: React.FC<ComboBoxProps> = ({
  items,
  placeholder = "Select an item",
  label,
  onSelect,
  selectedValue,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    selectedValue
  );

  const handleSelect = (itemId: string) => {
    setSelectedItem(itemId);
    onSelect(itemId);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant={"outline"}
            className="w-full border border-gray-300 rounded p-2 text-left"
            role="combobox"
            aria-expanded={open}
            aria-controls="item-list"
          >
            {selectedItem &&
              (items.find((item) => item.id === selectedItem)?.label ??
                placeholder)}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 float-right" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full z-50">
          <Command>
            <CommandInput placeholder={`${placeholder}...`} />
            <CommandList id="item-list">
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ComboBox;
