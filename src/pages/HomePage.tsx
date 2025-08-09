import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Award, Truck, Shield, Leaf, Heart, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-spices.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { fetchRecipesWithIngredients, RecipeWithIngredients } from "@/services/database";

import Footer from "@/components/Footer";

// Import all podi images
import bisibellebathPowder from "@/assets/bisibellebath-powder.jpg";
import chutneyPodi from "@/assets/chutney-podi.jpg";
import idlyPodi from "@/assets/idly-podi.jpg";
import karvepakuPodi from "@/assets/karvepaku-podi.jpg";
import kobariPowder from "@/assets/kobari-powder.jpg";
import kuraPodi from "@/assets/kura-podi.jpg";
import palliPodi from "@/assets/palli-podi.jpg";
import polihoraPodi from "@/assets/polihora-podi.jpg";
import putnaluPodi from "@/assets/putnalu-podi.jpg";
import rasamPowder from "@/assets/rasam-powder.jpg";
import sambarPowder from "@/assets/sambar-powder.jpg";
import vangibhatPowder from "@/assets/vangibhat-powder.jpg";

// Map recipe names to images
const recipeImageMap: Record<string, string> = {
  "Bisibellebath Powder": bisibellebathPowder,
  "Chutney Podi": chutneyPodi,
  "Idly Podi": idlyPodi,
  "Karvepaku Podi": karvepakuPodi,
  "Kobari Powder": kobariPowder,
  "Kura Podi": kuraPodi,
  "Palli Podi": palliPodi,
  "Polihora Podi": polihoraPodi,
  "Putnalu Podi": putnaluPodi,
  "Rasam Powder": rasamPowder,
  "Sambar Powder": sambarPowder,
  "Vangibhat Powder": vangibhatPowder,
};

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesWithIngredients,
  });

  const visibleRecipes = (recipes as RecipeWithIngredients[]).filter(recipe => !recipe.is_hidden);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      
      {/* Navigation */}
      <nav className={"border-b border-orange-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-16 z-40"}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Artisan Delights</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Home</Link>
              <Link to="/contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Contact</Link>
              <Link to="/terms" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Terms</Link>
              <Link to="/privacy" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Privacy</Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/orders">
                      <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link to="/create-order">
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Order Now
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-amber-600" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
                    Authentic
                    <span className="block text-yellow-200">South Indian</span>
                    <span className="block text-orange-200">Flavors</span>
                  </h1>
                  <p className="text-xl text-orange-100 max-w-lg drop-shadow">
                    Traditional Podi's crafted with authentic flavors and premium ingredients, bringing the taste of South India to your doorstep
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <Link to="/create-order">
                    <Button size="lg" className="text-lg px-8 py-6 bg-white text-orange-600 hover:bg-orange-50 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Order Now
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-orange-600 shadow-lg">
                      Learn More
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Traditional South Indian Spices" 
                  className="rounded-3xl shadow-2xl w-full h-[500px] object-cover ring-4 ring-white/20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-3 text-lg font-bold drop-shadow">Premium Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">Why Choose Artisan Delights?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We bring you the authentic taste of South India with our carefully crafted spice blends
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-orange-700">Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sourced from the finest ingredients across South India
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-red-700">Authentic Taste</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Traditional recipes passed down through generations
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-blue-700">Fresh Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Made fresh to order and delivered to your doorstep
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-green-700">Pure & Natural</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  No artificial preservatives or additives
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">Our Premium Podi Collection</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our range of authentic South Indian spice powders
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {visibleRecipes.slice(0, 8).map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden bg-white/90 backdrop-blur-sm border-orange-200">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={recipeImageMap[recipe.name] || heroImage} 
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-orange-600 shadow-lg">Premium</Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">{recipe.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {recipe.preparation || "Traditional South Indian spice blend"}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-orange-100">
                      <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        ₹{recipe.selling_price}
                      </span>
                      <Link to="/create-order">
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          Add to Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/create-order">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl hover:shadow-2xl transition-all duration-300">
                <ShoppingCart className="h-5 w-5 mr-2" />
                View All Products & Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-red-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
            Ready to Experience Authentic Flavors?
          </h2>
          <p className="text-xl mb-8 opacity-90 drop-shadow">
            Order your favorite podi's today and taste the difference
          </p>
          <Link to="/create-order">
            <Button size="lg" className="text-lg px-8 py-6 bg-white text-orange-600 hover:bg-orange-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Start Your Order
            </Button>
          </Link>
        </div>
      </section>

      <Footer showTopButton={true} />
    </div>
  );
};

export default HomePage;