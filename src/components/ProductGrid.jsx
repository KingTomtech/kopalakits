import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, onAdd, onToggleWishlist, wishlist }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
          onToggleWishlist={onToggleWishlist}
          inWishlist={wishlist?.includes(product.id) || false}
        />
      ))}
    </div>
  );
}
