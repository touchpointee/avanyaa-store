export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background">
            <section className="bg-primary text-primary-foreground py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Legal</p>
                    <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">Terms &amp; Conditions</h1>
                    <p className="text-sm opacity-75 mt-2">Last updated: February 2026</p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-8">

                    <PolicySection title="1. Acceptance of Terms">
                        <p>By accessing or using the AVANYAA website (avanyaa.in) or placing an order, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our website.</p>
                    </PolicySection>

                    <PolicySection title="2. Use of the Website">
                        <p>You agree to use this website only for lawful purposes. You must not:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Use the website in any way that violates applicable laws or regulations</li>
                            <li>Attempt to gain unauthorised access to any part of the website or its systems</li>
                            <li>Transmit any unsolicited or unauthorised advertising material</li>
                            <li>Use automated tools to scrape or extract data from the website</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. Account Registration">
                        <p>You may register an account to access features like order history and saved addresses. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately of any unauthorised use.</p>
                    </PolicySection>

                    <PolicySection title="4. Products & Pricing">
                        <p>We reserve the right to modify product listings, descriptions, and prices at any time without prior notice. Prices are displayed in Indian Rupees (INR) inclusive of applicable taxes. In the event of a pricing error, we reserve the right to cancel the affected order and notify you.</p>
                    </PolicySection>

                    <PolicySection title="5. Orders & Payment">
                        <p>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order. An order is confirmed only upon our written confirmation (email or WhatsApp). Payment must be made in full at checkout or upon delivery for COD orders.</p>
                    </PolicySection>

                    <PolicySection title="6. Shipping & Delivery">
                        <p>Delivery timelines are estimates and are not guaranteed. AVANYAA is not liable for delays caused by courier partners, natural events, or circumstances beyond our control. Please refer to our <a href="/shipping-policy" className="text-primary underline">Shipping Policy</a> for full details.</p>
                    </PolicySection>

                    <PolicySection title="7. Returns & Refunds">
                        <p>Returns and refunds are governed by our <a href="/returns-refunds" className="text-primary underline">Returns &amp; Refunds Policy</a>, which forms part of these Terms.</p>
                    </PolicySection>

                    <PolicySection title="8. Intellectual Property">
                        <p>All content on this website — including text, images, logos, and design — is the property of AVANYAA or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
                    </PolicySection>

                    <PolicySection title="9. Limitation of Liability">
                        <p>To the maximum extent permitted by law, AVANYAA shall not be liable for any indirect, incidental, or consequential loss arising from your use of our website or products. Our total liability in connection with any claim shall not exceed the amount paid for the relevant order.</p>
                    </PolicySection>

                    <PolicySection title="10. Privacy">
                        <p>Your use of this website is also governed by our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>, which is incorporated into these Terms by reference.</p>
                    </PolicySection>

                    <PolicySection title="11. Changes to Terms">
                        <p>We may revise these Terms at any time. Changes will be effective immediately upon posting. Continued use of the website after changes constitutes your acceptance of the revised Terms.</p>
                    </PolicySection>

                    <PolicySection title="12. Governing Law">
                        <p>These Terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Thiruvananthapuram, Kerala.</p>
                    </PolicySection>

                    <PolicySection title="13. Contact Us">
                        <p>For questions about these Terms, email <a href="mailto:support@avanyaa.in" className="text-primary underline">support@avanyaa.in</a>.</p>
                    </PolicySection>

                </div>
            </section>
        </main>
    );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="font-heading text-lg font-semibold mb-3 text-foreground">{title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
        </div>
    );
}
