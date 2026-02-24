export default function ReturnsRefundsPage() {
    return (
        <main className="min-h-screen bg-background">
            <section className="bg-primary text-primary-foreground py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Policy</p>
                    <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">Returns &amp; Refunds</h1>
                    <p className="text-sm opacity-75 mt-2">Last updated: February 2026</p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-8">

                    <PolicySection title="1. Return Eligibility">
                        <p>We accept returns within <strong>7 days of delivery</strong>. To be eligible, the item must be:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Unused, unwashed, and unaltered</li>
                            <li>In its original packaging with all tags attached</li>
                            <li>Accompanied by the original invoice or order number</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="2. Non-Returnable Items">
                        <p>The following items cannot be returned or exchanged:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Items purchased on clearance or final-sale</li>
                            <li>Items that have been worn, washed, or altered</li>
                            <li>Items returned after the 7-day window</li>
                            <li>Innerwear or intimates (for hygiene reasons)</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. How to Initiate a Return">
                        <p>To start a return or exchange:</p>
                        <ol className="list-decimal list-inside space-y-1 mt-2">
                            <li>Contact us via WhatsApp or email at <a href="mailto:support@avanyaa.in" className="text-primary underline">support@avanyaa.in</a></li>
                            <li>Share your order ID and reason for return (photos help if the item is defective)</li>
                            <li>Our team will confirm eligibility and arrange a pickup</li>
                        </ol>
                        <p className="mt-2">Please do <strong>not</strong> send items back without prior confirmation from us.</p>
                    </PolicySection>

                    <PolicySection title="4. Exchanges">
                        <p>We are happy to exchange an item for a different size or colour, subject to availability. Exchange requests follow the same eligibility criteria as returns. Items purchased during sales are eligible for exchange only — not refunds — unless the item is defective.</p>
                    </PolicySection>

                    <PolicySection title="5. Refund Processing">
                        <p>Once we receive and inspect the returned item, refunds are processed within <strong>5–7 business days</strong>. The amount will be credited to your original payment method.</p>
                        <p className="mt-2">For COD orders, refunds will be issued via bank transfer. Please share your bank account details when raising a return request.</p>
                    </PolicySection>

                    <PolicySection title="6. Defective or Wrong Items">
                        <p>If you received a defective, damaged, or incorrect item, please contact us within <strong>48 hours of delivery</strong> with photos. We will arrange a replacement or full refund at no additional cost to you.</p>
                    </PolicySection>

                    <PolicySection title="7. Contact Us">
                        <p>For returns & refunds queries: <a href="mailto:support@avanyaa.in" className="text-primary underline">support@avanyaa.in</a> or WhatsApp us.</p>
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
