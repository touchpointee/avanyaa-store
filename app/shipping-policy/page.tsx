export default function ShippingPolicyPage() {
    return (
        <main className="min-h-screen bg-background">
            <section className="bg-primary text-primary-foreground py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Policy</p>
                    <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">Shipping Policy</h1>
                    <p className="text-sm opacity-75 mt-2">Last updated: February 2026</p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">

                    <PolicySection title="1. Shipping Coverage">
                        <p>We currently ship across India only. International shipping is not available at this time but is coming soon.</p>
                    </PolicySection>

                    <PolicySection title="2. Processing Time">
                        <p>Orders are processed within <strong>1–2 business days</strong> after payment confirmation (or order placement for COD). Orders placed on Sundays or public holidays are processed the next business day.</p>
                    </PolicySection>

                    <PolicySection title="3. Delivery Timelines">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-4 font-semibold">Shipping Type</th>
                                    <th className="text-left py-2 font-semibold">Estimated Delivery</th>
                                </tr>
                            </thead>
                            <tbody className="text-muted-foreground">
                                <tr className="border-b border-border/50">
                                    <td className="py-2 pr-4">Standard Delivery</td>
                                    <td className="py-2">4–7 business days</td>
                                </tr>
                                <tr className="border-b border-border/50">
                                    <td className="py-2 pr-4">Express Delivery (select cities)</td>
                                    <td className="py-2">2–3 business days</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">Remote / Rural Areas</td>
                                    <td className="py-2">7–12 business days</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-muted-foreground text-sm mt-2">These are estimated timelines and may vary due to courier delays, weather events, or peak seasons.</p>
                    </PolicySection>

                    <PolicySection title="4. Shipping Charges">
                        <p>Shipping charges (if any) are displayed at checkout before you confirm your order. We periodically offer free shipping on orders above a certain value — check the site banner for active offers.</p>
                    </PolicySection>

                    <PolicySection title="5. Cash on Delivery (COD)">
                        <p>COD is available for most pin codes across India. A small COD handling fee may apply and will be shown at checkout. Please ensure someone is available to receive and pay for the parcel at the delivery address.</p>
                    </PolicySection>

                    <PolicySection title="6. Order Tracking">
                        <p>Once your order is dispatched, you will receive a tracking number via email and WhatsApp. You can track your order under <strong>My Orders</strong> in your account or directly on the courier&apos;s website.</p>
                    </PolicySection>

                    <PolicySection title="7. Failed Delivery Attempts">
                        <p>If delivery is unsuccessful after 2–3 attempts, the parcel will be returned to us. In such cases, please contact us to arrange re-delivery. Additional shipping charges may apply for re-dispatch.</p>
                    </PolicySection>

                    <PolicySection title="8. Contact Us">
                        <p>For any shipping-related queries, reach us at <a href="mailto:support@avanyaa.in" className="text-primary underline">support@avanyaa.in</a> or via WhatsApp.</p>
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
