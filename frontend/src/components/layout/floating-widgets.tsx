export function FloatingWidgets() {
  const widgets = [
    { icon: "💬", label: "Zalo", color: "#0068FF", bg: "#E8F0FF" },
    { icon: "📘", label: "Facebook", color: "#1877F2", bg: "#E8F0FF" },
    { icon: "📞", label: "Gọi ngay", color: "#F16522", bg: "#FFF4EC" },
  ];
  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3">
      {widgets.map((w) => (
        <button
          key={w.label}
          title={w.label}
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform duration-200 active:scale-95"
          style={{ background: w.color }}
        >
          {w.icon}
        </button>
      ))}
    </div>
  );
}
