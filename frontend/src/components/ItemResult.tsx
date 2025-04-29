export default function ItemResult({ item }: { item: any }) {
    if (!item) return null;
  
    return (
      <div className="bg-white p-4 rounded shadow w-fit mx-auto">
        <h2 className="text-xl font-bold mb-2">Item Found</h2>
        <p><strong>EAN:</strong> {item.ean}</p>
        <p><strong>Brand:</strong> {item.brand}</p>
        <p><strong>Style:</strong> {item.style_name}</p>
        <p><strong>Color:</strong> {item.color_name}</p>
        <p><strong>Product Group:</strong> {item.product_group}</p>
        <p><strong>Rollout:</strong> {item.rollout}</p>
        {item.locations?.length > 0 && (
          <p><strong>Location:</strong> {item.locations.map((l: any) => `${l.rack} (${l.level})`).join(", ")}</p>
        )}
      </div>
    );
  }
  