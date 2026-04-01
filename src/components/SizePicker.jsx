import { cn } from "@/lib/utils";

const SizePicker = ({ sizes, selectedSize, onSelectSize }) => (
  <div className="grid grid-cols-5 gap-2">
    {sizes.map((size) => (
      <button
        key={size}
        onClick={() => onSelectSize(size)}
        className={cn(
          "h-12 border font-mono text-sm tabular-nums transition-colors duration-150 rounded-[4px]",
          selectedSize === size
            ? "bg-primary text-primary-foreground border-primary"
            : "border-foreground/20 hover:border-foreground/40"
        )}
      >
        {size}
      </button>
    ))}
  </div>
);

export default SizePicker;
