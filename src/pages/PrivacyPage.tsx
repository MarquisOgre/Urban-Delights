import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

const PrivacyPage = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 1, 2024
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Matters</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
                  <p className="text-muted-foreground mb-3">
                    We collect information you provide directly to us, such as when you:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Create an account or place an order</li>
                    <li>Contact us for customer support</li>
                    <li>Subscribe to our newsletter</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. Personal Information</h3>
                  <p className="text-muted-foreground mb-3">
                    The types of personal information we may collect include:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Name and contact information (email, phone, address)</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Order history and preferences</li>
                    <li>Communication preferences</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. How We Use Your Information</h3>
                  <p className="text-muted-foreground mb-3">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Process and fulfill your orders</li>
                    <li>Communicate with you about your orders and account</li>
                    <li>Provide customer support</li>
                    <li>Send you updates about new products and promotions (with your consent)</li>
                    <li>Improve our products and services</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Information Sharing</h3>
                  <p className="text-muted-foreground mb-3">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>With service providers who help us operate our business</li>
                    <li>To comply with legal requirements or protect our rights</li>
                    <li>In connection with a business transfer or merger</li>
                    <li>With your explicit consent</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Data Security</h3>
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Data Retention</h3>
                  <p className="text-muted-foreground">
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">7. Your Rights</h3>
                  <p className="text-muted-foreground mb-3">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request a copy of your personal information</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h3>
                  <p className="text-muted-foreground">
                    We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user preferences. You can control cookie settings through your browser preferences.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">9. Third-Party Links</h3>
                  <p className="text-muted-foreground">
                    Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party websites you visit.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">10. Children's Privacy</h3>
                  <p className="text-muted-foreground">
                    Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">11. Changes to This Policy</h3>
                  <p className="text-muted-foreground">
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">12. Contact Us</h3>
                  <p className="text-muted-foreground">
                    If you have any questions about this privacy policy or our privacy practices, please contact us at:
                  </p>
                  <div className="mt-2 text-muted-foreground">
                    <p>Email: privacy@artisandelights.com</p>
                    <p>Phone: +91 98765 43210</p>
                    <p>Address: 123 Spice Street, Chennai, Tamil Nadu 600001, India</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;