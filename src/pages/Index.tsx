
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Clock, Truck, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";

const Index = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Chicken Burger Deluxe",
      price: 12.99,
      offerPrice: 9.99,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      rating: 4.8,
      category: "Burgers"
    },
    {
      id: 2,
      name: "Margherita Pizza",
      price: 15.99,
      offerPrice: 12.99,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      rating: 4.9,
      category: "Pizza"
    },
    {
      id: 3,
      name: "Crispy Fried Chicken",
      price: 11.99,
      offerPrice: 9.49,
      image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
      rating: 4.7,
      category: "Chicken"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Fast Food,
                <span className="block text-yellow-300">Fast Delivery!</span>
              </h1>
              <p className="text-xl mb-8 text-orange-100">
                Delicious meals delivered to your doorstep in 30 minutes or less.
                Fresh ingredients, amazing taste!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-orange-500 hover:bg-orange-50 transform hover:scale-105 transition-all">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Order Now
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500 transform hover:scale-105 transition-all">
                  View Menu
                </Button>
              </div>
            </div>
            <div className="animate-slide-in">
              <img
                src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop"
                alt="Delicious burger"
                className="rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose FastFood?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to delivering the best fast food experience with quality ingredients and lightning-fast service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-2 hover:border-orange-200">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-xl text-gray-800">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get your favorite food delivered in 30 minutes or less, guaranteed fresh and hot.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-2 hover:border-orange-200">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-xl text-gray-800">Quality Food</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Made with fresh ingredients and cooked to perfection by our experienced chefs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-2 hover:border-orange-200">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Truck className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-xl text-gray-800">Free Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enjoy free delivery on orders over $25. No hidden fees, just great food at great prices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Menu
            </h2>
            <p className="text-gray-600">
              Try our most popular dishes loved by thousands of customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-orange-400 mr-3" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-orange-400 mr-3" />
                  <span>123 Food Street, Taste City, TC 12345</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">Opening Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>10:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday - Sunday:</span>
                  <span>11:00 AM - 12:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Link */}
      <div className="fixed bottom-4 right-4">
        <Link to="/admin-login">
          <Button className="bg-gray-800 hover:bg-gray-700 text-white shadow-lg">
            Admin Access
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
