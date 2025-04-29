import { useEffect, useState } from "react";

type FilterSearchProps = {
  onSearch: (filters: Record<string, string>) => void;
};

export default function FilterSearch({ onSearch }: FilterSearchProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [rollouts, setRollouts] = useState<string[]>([]);
  const [productGroups, setProductGroups] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const [filters, setFilters] = useState<Record<string, string>>({
    brand: "",
    rollout: "",
    product_group: "",
    color_name: "",
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/filters/options");
        const data = await res.json();
        setBrands(data.brands || []);
        setRollouts(data.rollouts || []);
        setProductGroups(data.product_groups || []);
        setColors(data.colors || []);
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    };
    loadOptions();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    const nonEmpty = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "")
    );
    onSearch(nonEmpty);
  };

  return (
    <div className="bg-white p-4 shadow rounded w-full max-w-sm">
      <h2 className="text-lg font-bold mb-4">Filter by...</h2>

      <div className="space-y-4">
        <select
          value={filters.brand}
          onChange={(e) => handleChange("brand", e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Brands</option>
          {brands?.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={filters.rollout}
          onChange={(e) => handleChange("rollout", e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Rollouts</option>
          {rollouts?.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={filters.product_group}
          onChange={(e) => handleChange("product_group", e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Product Groups</option>
          {productGroups?.map((pg) => (
            <option key={pg} value={pg}>
              {pg}
            </option>
          ))}
        </select>

        <select
          value={filters.color_name}
          onChange={(e) => handleChange("color_name", e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Colors</option>
          {colors?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}
