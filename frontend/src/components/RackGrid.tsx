import { useEffect, useState } from "react";

const racks = [
  ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1"],
  ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "I2"],
  ["A3", "",   "C3", "D3", "E3", "F3", "G3", "H3", "I3"],
  ["",   "",   "C4", "D4", "E4", "F4", "G4", "H4", "I4"],
  ["",   "",   "",   "",   "",   "",   "",   "",   "I5"],
];

const brandLogos: Record<string, string> = {
  "Hackett": "/logos/hackett.png",
  "PJL": "/logos/pepejeans.jpg",
};

export default function RackGrid({ onSelect }: { onSelect: (rack: string) => void }) {
  const [rackBrands, setRackBrands] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("http://127.0.0.1:5000/rack/brand-logos")
      .then((res) => res.json())
      .then((data) => setRackBrands(data))
      .catch((err) => console.error("Failed to fetch rack logos", err));
  }, []);

  return (
    <div className="flex flex-col gap-2 max-w-6xl mx-auto my-8">
      {racks.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-x-1">
          {row.map((rack, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const spacing =
              colIndex === 1 || colIndex === 3 || colIndex === 5 || colIndex === 7 || colIndex === 8 ? "ml-8" : "";
            const brand = rackBrands[rack || ""];
            const logoUrl = brandLogos[brand];

            return (
              <div key={key} className={`min-w-[80px] ${spacing}`}>
                {rack ? (
                  <button
                  onClick={() => onSelect(rack)}
                  className="relative w-full bg-white border rounded shadow text-center p-4 font-semibold overflow-hidden group hover:bg-blue-600"
                >
                  {/* Hover logo */}
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={`${brand} logo`}
                      className="absolute inset-0 m-auto w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    />
                  )}
                
                  {/* Rack label */}
                  <span className="relative z-10 group-hover:text-white">{rack}</span>
                </button>                
                ) : (
                  <div className="invisible p-4">--</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
