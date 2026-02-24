export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-background">
            <section className="bg-primary text-primary-foreground py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Legal</p>
                    <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
                    <p className="text-sm opacity-75 mt-2">Last updated: February 2026</p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-8">

                    <PolicySection title="1. Introduction">
                        <p>Welcome to AVANYAA (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard information when you visit our website or place an order.</p>
                    </PolicySection>

                    <PolicySection title="2. Information We Collect">
                        <p>We collect the following types of information:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li><strong>Personal details:</strong> Name, email address, phone number, and delivery address provided during checkout or account registration</li>
                            <li><strong>Order data:</strong> Items purchased, order history, payment method (we do not store card details)</li>
                            <li><strong>Usage data:</strong> Pages visited, device type, browser, and IP address (via analytics tools)</li>
                            <li><strong>Communications:</strong> Messages sent to us via the contact form or WhatsApp</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. How We Use Your Information">
                        <ul className="list-disc list-inside space-y-1">
                            <li>Process and fulfil your orders</li>
                            <li>Send order confirmations, shipping updates, and support responses</li>
                            <li>Improve our website and product offerings</li>
                            <li>Send promotional emails or offers (you can opt out at any time)</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="4. Data Sharing">
                        <p>We do not sell, rent, or trade your personal data. We may share data with trusted third parties only to the extent necessary:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li><strong>Courier partners</strong> — to fulfil and track deliveries</li>
                            <li><strong>Payment processors</strong> — to handle transactions securely</li>
                            <li><strong>Analytics providers</strong> (e.g., Google Analytics) — anonymised usage data only</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="5. Cookies">
                        <p>We use cookies to enhance your browsing experience (e.g., keeping items in your cart, remembering your session). You can disable cookies in your browser settings, though some features may not work correctly.</p>
                    </PolicySection>

                    <PolicySection title="6. Data Security">
                        <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. We encourage you to keep your account credentials confidential.</p>
                    </PolicySection>

                    <PolicySection title="7. Your Rights">
                        <p>You have the right to:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Access the personal data we hold about you</li>
                            <li>Request correction or deletion of your data</li>
                            <li>Opt out of marketing communications</li>
                            <li>Lodge a complaint with the relevant data protection authority</li>
                        </ul>
                        <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:support@avanyaa.in" className="text-primary underline">support@avanyaa.in</a>.</p>
                    </PolicySection>

                    <PolicySection title="8. Third-Party Links">
                        <p>Our website may contain links to third-party sites. We are not responsible for their privacy practices and encourage you to review their policies separately.</p>
                    </PolicySection>

                    <PolicySection title="9. Changes to This Policy">
                        <p>We may update this policy from time to time. Changes will be posted on this page with a revised &quot;Last updated&quot; date. Continued use of the website after changes constitutes acceptance of the updated policy.</p>
                    </PolicySection>

                    <PolicySection title="10. Contact Us">
                        <p>If you have questions about this policy, email us at <a href="mailto:support@avanyaa.in" className="text-primary underline">support@avanyaa.in</a>.</p>
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
