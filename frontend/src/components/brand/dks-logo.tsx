export function DKSLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const h = sizes[size];
  return (
    <div className="flex items-center gap-2.5 font-[family-name:var(--font-nunito)]">
      <div
        className="flex items-center justify-center rounded-[10px] text-white font-black"
        style={{ width: h, height: h, background: "linear-gradient(135deg, #F16522 0%, #FFA200 100%)", fontSize: h * 0.45 }}
      >
        D
      </div>
      <div>
        <div className="font-black leading-none text-[#4A2306]" style={{ fontSize: h * 0.42 }}>DKS</div>
        <div className="font-semibold text-[#9B6B50] leading-none" style={{ fontSize: h * 0.26 }}>English Center</div>
      </div>
    </div>
  );
}
