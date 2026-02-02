import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function EnhancedBtn({
  onClick,
  disabled,
  children,
  loading,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "mt-auto w-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800"
      )}
      style={{
        padding: 0,
        background: "none",
        border: "none",
      }}
    >
      <span
        className="block w-full"
        style={{
          borderRadius: "9px",
          background: "linear-gradient(90deg, #18171C 0%, #212F37 100%)",
          boxShadow:
            "0px 4px 24px 0px #40410110, 0px 4px 8px 0px #4842BD1A, inset 0px 4px 4px 0px #FFFFFF26",
        }}
      >
        <span
          className="flex items-center justify-center w-full"
          style={{
            borderRadius: "9px",
            padding: "5px 0",
            color: "#FFF",
            fontWeight: 500,
            fontSize: "0.95rem",
            letterSpacing: 0,
            position: "relative",
            textShadow: "0 1px 4px #0002",
            border: "2px solid #18171C",
            boxShadow:
              "0px 2px 8px 0pxrgba(219, 219, 227, 0.19), 0px 4px 8px 0px #40410110",
            minWidth: 0,
            width: "100%",
            cursor: disabled ? "not-allowed" : "pointer",
            userSelect: "none",
            transition: "background 0.2s",
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 mr-1 animate-spin border-2 border-zinc-100 border-t-[#4842BD] rounded-full align-middle" />
              {children}
            </span>
          ) : (
            children
          )}
        </span>
      </span>
    </Button>
  );
}
