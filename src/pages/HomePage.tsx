import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Award, Truck, Shield } from "lucide-react";
import heroImage from "@/assets/hero-spices.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { fetchRecipesWithIngredients, RecipeWithIngredients } from "@/services/database";

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesWithIngredients,
  });

  const visibleRecipes = (recipes as RecipeWithIngredients[]).filter(recipe => !recipe.is_hidden);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Artisan Delights</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors">Contact</Link>
              <Link to="/terms" className="text-foreground hover:text-primary transition-colors">Terms</Link>
              <Link to="/privacy" className="text-foreground hover:text-primary transition-colors">Privacy</Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/orders">
                      <Button variant="outline" size="sm">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link to="/create-order">
                    <Button size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Order Now
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/auth">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
        <img 
          src={heroImage} 
          alt="Traditional South Indian Spices" 
          className="w-full h-[70vh] object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Artisan <span className="text-accent">Delights</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Traditional South Indian Podi's crafted with authentic flavors and premium ingredients
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/create-order">
                <Button size="lg" className="text-lg px-8 py-6">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Order Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-primary">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Artisan Delights?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We bring you the authentic taste of South India with our carefully crafted spice blends
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sourced from the finest ingredients across South India
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Authentic Taste</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Traditional recipes passed down through generations
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Fresh Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Made fresh to order and delivered to your doorstep
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Pure & Natural</CardTitle>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Premium Podi Collection</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our range of authentic South Indian spice powders
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleRecipes.slice(0, 8).map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <Badge variant="secondary">Premium</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recipe.preparation || "Traditional South Indian spice blend"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        ₹{recipe.selling_price}
                      </span>
                      <Link to="/create-order">
                        <Button size="sm">
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
              <Button size="lg">
                View All Products & Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Authentic Flavors?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Order your favorite podi's today and taste the difference
          </p>
          <Link to="/create-order">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Start Your Order
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Artisan Delights</span>
              </div>
              <p className="text-muted-foreground">
                Bringing you the authentic taste of South India with our premium spice blends.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-muted-foreground hover:text-primary">Home</Link>
                <Link to="/create-order" className="block text-muted-foreground hover:text-primary">Order</Link>
                <Link to="/contact" className="block text-muted-foreground hover:text-primary">Contact</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link to="/terms" className="block text-muted-foreground hover:text-primary">Terms & Conditions</Link>
                <Link to="/privacy" className="block text-muted-foreground hover:text-primary">Privacy Policy</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <p className="text-muted-foreground">
                Email: info@artisandelights.com<br/>
                Phone: +91 98765 43210
              </p>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Artisan Delights. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;