import { useState } from "react";
import SearchBar from "./components/SearchBar";
import ItemResult from "./components/ItemResult";
import RackGrid from "./components/RackGrid";
import FilterSearch from "./components/FilterSearch";

function App() {
  const [item, setItem] = useState<any>(null);
  const [rackItems, setRackItems] = useState<any[]>([]);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState("all");

  const handleSearch = async (ean: string) => {
    const res = await fetch(`http://127.0.0.1:5000/search?barcode=${ean}`);
    const data = await res.json();
    setItem(data || null);
    setRackItems([]);
    setSelectedRack(null);
  };

  const fetchRackItems = async (rack: string, level: string = "all") => {
    setRackItems([]); // 🔧 Fix the rack filter bug
    const res = await fetch(`http://127.0.0.1:5000/rack?rack=${rack}&level=${level}`);
    const data = await res.json();
    setRackItems(data);
  };

  const handleRackSelect = async (rack: string) => {
    setSelectedRack(rack);
    setLevelFilter("all");
    setItem(null);
    fetchRackItems(rack, "all");
  };

  const handleLevelChange = (level: string) => {
    setLevelFilter(level);
    setRackItems([]);
    if (selectedRack) {
      fetchRackItems(selectedRack, level);
    }
  };

  const handleFilterSearch = async (filters: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`http://127.0.0.1:5000/filter?${params.toString()}`);
    const data = await res.json();
    setItem(null);
    setRackItems(data);
    setSelectedRack(null);
  };

  const downloadRackList = () => {
    if (rackItems.length === 0) return;

    const headers = [
      "EAN",
      "Brand",
      "Style",
      "Color",
      "Product Group",
      "Rollout",
      "Rack",
      "Level",
      "Box",
    ];

    const rows = rackItems.map((itm) => [
      itm.ean,
      itm.brand,
      itm.style_name,
      itm.color_name,
      itm.product_group,
      itm.rollout,
      itm.rack,
      itm.level,
      itm.box_label || "",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rack-${selectedRack || "filtered"}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6">L.O.W RACK INVENTORY</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SearchBar onSearch={handleSearch} />
        <FilterSearch onSearch={handleFilterSearch} />
      </div>

      <RackGrid onSelect={handleRackSelect} />

      {selectedRack && (
        <div className="text-center mb-4">
          <p className="mb-2 font-semibold">
            Viewing items in <strong>{selectedRack}</strong>
          </p>
          <div className="flex justify-center gap-4">
            {["All", "Alto", "Bajo", "Box"].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`px-4 py-2 rounded border ${
                  levelFilter === level ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      {item && <ItemResult item={item} />}

      {rackItems.length > 0 && (
        <>
          <div className="text-center my-4">
            <button
              onClick={downloadRackList}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              📄 Get List
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {rackItems.map((itm) => (
              <div
                key={`${itm.ean}-${itm.box_label || ""}`}
                className="bg-white p-4 shadow rounded"
              >
                <p><strong>EAN:</strong> {itm.ean}</p>
                <p><strong>Brand:</strong> {itm.brand}</p>
                <p><strong>Style:</strong> {itm.style_name}</p>
                <p><strong>Color:</strong> {itm.color_name}</p>
                <p><strong>Product Group:</strong> {itm.product_group}</p>
                <p><strong>Rollout:</strong> {itm.rollout}</p>
                <p><strong>Rack:</strong> {itm.rack}</p>
                <p><strong>Level:</strong> {itm.level}</p>
                {itm.is_boxed && itm.box_label && (
                  <p><strong>Box:</strong> {itm.box_label}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
