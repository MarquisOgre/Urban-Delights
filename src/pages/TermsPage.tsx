import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Artisan Delights</span>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 1, 2024
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
                  <p className="text-muted-foreground">
                    By accessing and using Artisan Delights' website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. Products and Services</h3>
                  <p className="text-muted-foreground">
                    Artisan Delights specializes in traditional South Indian spice powders (podis). All products are made fresh to order using authentic recipes and premium ingredients. We reserve the right to modify our product offerings at any time without prior notice.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. Orders and Payment</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>All orders are subject to availability and acceptance by Artisan Delights</li>
                    <li>Prices are in Indian Rupees (INR) and are subject to change without notice</li>
                    <li>Payment must be made in full before order processing</li>
                    <li>We accept various payment methods as displayed on our website</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Delivery and Shipping</h3>
                  <p className="text-muted-foreground">
                    We strive to deliver all orders within the estimated timeframe. However, delivery times are approximate and may vary due to factors beyond our control. Risk of loss and title for products pass to you upon delivery to the carrier.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Return and Refund Policy</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Returns are accepted within 7 days of delivery for unopened products</li>
                    <li>Products must be in original packaging and condition</li>
                    <li>Customer is responsible for return shipping costs unless the product is defective</li>
                    <li>Refunds will be processed within 5-7 business days after receiving the returned item</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Quality Assurance</h3>
                  <p className="text-muted-foreground">
                    We are committed to providing high-quality products. If you are not satisfied with your purchase, please contact us within 7 days of delivery. We will work with you to resolve any quality issues.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">7. Intellectual Property</h3>
                  <p className="text-muted-foreground">
                    All content on this website, including but not limited to text, graphics, logos, images, and recipes, is the property of Artisan Delights and is protected by copyright and other intellectual property laws.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">8. Limitation of Liability</h3>
                  <p className="text-muted-foreground">
                    Artisan Delights shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">9. Contact Information</h3>
                  <p className="text-muted-foreground">
                    If you have any questions about these Terms & Conditions, please contact us at:
                  </p>
                  <div className="mt-2 text-muted-foreground">
                    <p>Email: info@artisandelights.com</p>
                    <p>Phone: +91 98765 43210</p>
                    <p>Address: 123 Spice Street, Chennai, Tamil Nadu 600001, India</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">10. Changes to Terms</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this website. Your continued use of the service constitutes acceptance of the modified terms.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;