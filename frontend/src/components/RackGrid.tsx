const racks = [
  ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1"],
  ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "I2"],
  ["A3", "",   "C3", "D3", "E3", "F3", "G3", "H3", "I3"],
  ["",   "",   "C4", "D4", "E4", "F4", "G4", "H4", "I4"],
  ["",   "",   "",   "",   "",   "",   "",   "",   "I5"],
];

export default function RackGrid({ onSelect }: { onSelect: (rack: string) => void }) {
  return (
    <div className="flex flex-col gap-2 max-w-6xl mx-auto my-8">
      {racks.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-x-1">
          {row.map((rack, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const spacing =
              colIndex === 1 || colIndex === 3 || colIndex === 5 || colIndex === 7 ||colIndex === 8 ? "ml-8" : "";

            return (
              <div key={key} className={`min-w-[80px] ${spacing}`}>
                {rack ? (
                  <button
                    onClick={() => onSelect(rack)}
                    className="w-full bg-white border rounded shadow hover:bg-blue-100 text-center p-4 font-semibold"
                  >
                    {rack}
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
