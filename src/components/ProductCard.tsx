
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Plus } from "lucide-react";

interface ProductVariant {
  name: string;
  price: number;
  offerPrice: number;
}

interface ProductAddon {
  name: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  offerPrice: number;
  image: string;
  rating: number;
  category: string;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = Math.round(((product.price - product.offerPrice) / product.price) * 100);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
            -{discount}%
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2">
          {product.category}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-orange-500">
              PKR {product.offerPrice}
            </span>
            {product.price !== product.offerPrice && (
              <span className="text-sm text-gray-500 line-through">
                PKR {product.price}
              </span>
            )}
          </div>
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">Variants:</p>
            <div className="flex flex-wrap gap-1">
              {product.variants.map((variant, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {variant.name} - PKR {variant.offerPrice}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {product.addons && product.addons.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">Add-ons available:</p>
            <div className="flex flex-wrap gap-1">
              {product.addons.slice(0, 2).map((addon, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-50">
                  +{addon.name} (+PKR {addon.price})
                </Badge>
              ))}
              {product.addons.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{product.addons.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <Button className="w-full bg-orange-500 hover:bg-orange-600 transform hover:scale-105 transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
