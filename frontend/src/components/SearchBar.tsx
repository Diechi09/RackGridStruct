import { useState } from "react";

export default function SearchBar({ onSearch }: { onSearch: (ean: string) => void }) {
  const [ean, setEan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ean.trim()) onSearch(ean.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center mb-4">
      <input
        type="text"
        value={ean}
        onChange={(e) => setEan(e.target.value)}
        placeholder="Enter EAN..."
        className="border p-2 rounded-1 w-64"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 rounded-r">
        Search
      </button>
    </form>
  );
}
