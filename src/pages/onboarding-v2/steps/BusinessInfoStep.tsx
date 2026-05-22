import { useState, useRef, useEffect } from "react";
import ModusTextInput from "../../../components/ModusTextInput";

const ENTITY_TYPES = [
  "Sole Proprietorship",
  "LLC",
  "S-Corporation",
  "C-Corporation",
  "Partnership",
];

export default function BusinessInfoStep() {
  const [selected, setSelected] = useState("LLC");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-sm text-foreground-60 -mt-2">
        Tell us about your company.
      </div>

      <ModusTextInput
        label="Company name"
        value="Acme Construction LLC"
        readOnly
        inputId="demo-company-name"
      />

      <div className="flex flex-col gap-1" ref={containerRef}>
        <label className="modus-wc-input-label modus-wc-input-label-size-md" htmlFor="demo-company-type">Type of company</label>
        <div className="relative">
          <div
            role="button"
            tabIndex={0}
            className={`flex items-center justify-between px-3 py-[11px] rounded border bg-background cursor-pointer transition-colors ${open ? "border-primary" : "border-default hover:border-primary"}`}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }}}
          >
            <div className="text-sm text-foreground">{selected}</div>
            <i className={`modus-icons text-foreground-40 text-xl leading-none transition-transform ${open ? "rotate-180" : ""}`}>
              expand_more
            </i>
          </div>

          {open && (
            <div className="absolute z-10 w-full mt-1 rounded border border-default bg-background shadow-md overflow-hidden">
              {ENTITY_TYPES.map((type) => (
                <div
                  key={type}
                  role="option"
                  aria-selected={type === selected}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                    type === selected
                      ? "bg-primary-20 text-foreground font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => { setSelected(type); setOpen(false); }}
                >
                  {type}
                  {type === selected && (
                    <i className="modus-icons text-primary text-lg leading-none">check</i>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
