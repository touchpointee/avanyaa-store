'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { isCustomerSession } from '@/lib/customerSession';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ChevronDown, Search } from 'lucide-react';
import { INDIA_DATA } from '@/lib/locationData';
import OrderStatusPopup from '@/components/OrderStatusPopup';

const COUNTRIES = [
  { code: 'in', name: 'India' },
  { code: 'af', name: 'Afghanistan' },
  { code: 'au', name: 'Australia' },
  { code: 'bd', name: 'Bangladesh' },
  { code: 'bt', name: 'Bhutan' },
  { code: 'ca', name: 'Canada' },
  { code: 'cn', name: 'China' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ir', name: 'Iran' },
  { code: 'iq', name: 'Iraq' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'ke', name: 'Kenya' },
  { code: 'my', name: 'Malaysia' },
  { code: 'mv', name: 'Maldives' },
  { code: 'mx', name: 'Mexico' },
  { code: 'mm', name: 'Myanmar' },
  { code: 'np', name: 'Nepal' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'ph', name: 'Philippines' },
  { code: 'qa', name: 'Qatar' },
  { code: 'ru', name: 'Russia' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'sg', name: 'Singapore' },
  { code: 'za', name: 'South Africa' },
  { code: 'kr', name: 'South Korea' },
  { code: 'es', name: 'Spain' },
  { code: 'lk', name: 'Sri Lanka' },
  { code: 'th', name: 'Thailand' },
  { code: 'tr', name: 'Turkey' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' },
  { code: 'vn', name: 'Vietnam' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  // Stores orderId while the success popup is visible; null = no popup
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // ── Country dropdown ──────────────────────────────────────────
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryRef = useRef<HTMLDivElement>(null);

  // ── State dropdown ────────────────────────────────────────────
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const stateRef = useRef<HTMLDivElement>(null);

  // ── City dropdown ─────────────────────────────────────────────
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const cityRef = useRef<HTMLDivElement>(null);

  // ── ZIP dropdown ──────────────────────────────────────────────
  const [zipOpen, setZipOpen] = useState(false);
  const zipRef = useRef<HTMLDivElement>(null);

  // Click-outside handler for all four dropdowns
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false); setCountrySearch('');
      }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setStateOpen(false); setStateSearch('');
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false); setCitySearch('');
      }
      if (zipRef.current && !zipRef.current.contains(e.target as Node)) {
        setZipOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    state: '',
    city: '',
    zipCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (session && (session.user as { role?: string }).role === 'admin') {
      router.push('/auth/signin');
      return;
    }
    if (isCustomerSession(session) && session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: session.user?.name || prev.fullName,
        email: session.user?.email || prev.email,
      }));
    }
  }, [session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    const requiredFields = ['fullName', 'email', 'phone', 'street', 'state', 'city', 'zipCode', 'country'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: 'Missing information',
          description: `Please fill in ${field}`,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    }

    // Validate email
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
          })),
          address: formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        clearCart();
        // Show the popup immediately; navigate only after it finishes
        setPlacedOrderId(data.orderId);
      } else {
        toast({
          title: 'Order failed',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Don't redirect to cart while the success popup is visible
    if (items.length === 0 && !loading && !placedOrderId) {
      router.replace('/cart');
    }
  }, [items.length, loading, placedOrderId, router]);

  if (items.length === 0 && !placedOrderId) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Redirecting to cart...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Order placed popup ───────────────────────────── */}
      {placedOrderId && (
        <OrderStatusPopup
          type="placed"
          onDone={() => {
            router.push(`/order-success?orderId=${placedOrderId}`);
          }}
        />
      )}
      <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-2 tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Guest checkout · Pay by <strong>Cash on Delivery (COD)</strong> when you receive your order.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl border border-border shadow overflow-hidden">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border-border"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border-border"
                    />
                  </div>
                  <div className="space-y-2" ref={countryRef}>
                    <Label htmlFor="country-btn">Country *</Label>
                    <div className="relative">
                      <button
                        id="country-btn"
                        type="button"
                        onClick={() => { setCountryOpen((o) => !o); setCountrySearch(''); }}
                        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          {formData.country ? (
                            <>
                              <img
                                src={`https://flagcdn.com/20x15/${COUNTRIES.find((c) => c.name === formData.country)?.code ?? 'un'}.png`}
                                width={20}
                                height={15}
                                alt={formData.country}
                                className="rounded-sm object-cover shrink-0"
                              />
                              <span>{formData.country}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Select country</span>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${countryOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {countryOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                          {/* Search */}
                          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search country…"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                          </div>
                          {/* List */}
                          <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
                            {COUNTRIES.filter((c) =>
                              c.name.toLowerCase().includes(countrySearch.toLowerCase())
                            ).map((c) => (
                              <li key={c.code}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={formData.country === c.name}
                                  onClick={() => {
                                    // When country changes, cascade-reset state/city/zip
                                    setFormData({ ...formData, country: c.name, state: '', city: '', zipCode: '' });
                                    setCountryOpen(false);
                                    setCountrySearch('');
                                  }}
                                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${formData.country === c.name ? 'bg-primary/10 font-medium text-primary' : ''}`}
                                >
                                  <img
                                    src={`https://flagcdn.com/20x15/${c.code}.png`}
                                    width={20}
                                    height={15}
                                    alt={c.name}
                                    className="rounded-sm object-cover shrink-0"
                                  />
                                  <span>{c.name}</span>
                                </button>
                              </li>
                            ))}
                            {COUNTRIES.filter((c) =>
                              c.name.toLowerCase().includes(countrySearch.toLowerCase())
                            ).length === 0 && (
                                <li className="px-3 py-4 text-center text-sm text-muted-foreground">No country found</li>
                              )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── State / City / ZIP ─────────────────────────── */}
                {(() => {
                  const isIndia = formData.country === 'India';
                  const availableStates = isIndia ? Object.keys(INDIA_DATA).sort() : [];
                  const availableCities = isIndia && formData.state && INDIA_DATA[formData.state]
                    ? Object.keys(INDIA_DATA[formData.state]).sort()
                    : [];
                  const availableZips = isIndia && formData.state && formData.city && INDIA_DATA[formData.state]?.[formData.city]
                    ? INDIA_DATA[formData.state][formData.city]
                    : [];

                  return (
                    <div className="grid md:grid-cols-3 gap-4">

                      {/* STATE */}
                      <div className="space-y-2" ref={isIndia ? stateRef : undefined}>
                        <Label htmlFor={isIndia ? 'state-btn' : 'state'}>State *</Label>
                        {isIndia ? (
                          <div className="relative">
                            <button
                              id="state-btn"
                              type="button"
                              disabled={!formData.country}
                              onClick={() => { setStateOpen((o) => !o); setStateSearch(''); }}
                              className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className={formData.state ? '' : 'text-muted-foreground'}>
                                {formData.state || 'Select state'}
                              </span>
                              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${stateOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {stateOpen && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  <input autoFocus type="text" placeholder="Search state…" value={stateSearch}
                                    onChange={(e) => setStateSearch(e.target.value)}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                                </div>
                                <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
                                  {availableStates
                                    .filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()))
                                    .map((s) => (
                                      <li key={s}>
                                        <button type="button" role="option"
                                          aria-selected={formData.state === s}
                                          onClick={() => {
                                            setFormData({ ...formData, state: s, city: '', zipCode: '' });
                                            setStateOpen(false); setStateSearch('');
                                          }}
                                          className={`flex w-full items-center px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${formData.state === s ? 'bg-primary/10 font-medium text-primary' : ''}`}
                                        >{s}</button>
                                      </li>
                                    ))}
                                  {availableStates.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase())).length === 0 && (
                                    <li className="px-3 py-4 text-center text-sm text-muted-foreground">No state found</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Input id="state" name="state" value={formData.state} onChange={handleInputChange}
                            required className="rounded-lg border-border" />
                        )}
                      </div>

                      {/* CITY */}
                      <div className="space-y-2" ref={isIndia ? cityRef : undefined}>
                        <Label htmlFor={isIndia ? 'city-btn' : 'city'}>City *</Label>
                        {isIndia ? (
                          <div className="relative">
                            <button
                              id="city-btn"
                              type="button"
                              disabled={!formData.state}
                              onClick={() => { setCityOpen((o) => !o); setCitySearch(''); }}
                              className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className={formData.city ? '' : 'text-muted-foreground'}>
                                {formData.city || (formData.state ? 'Select city' : 'Select state first')}
                              </span>
                              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {cityOpen && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  <input autoFocus type="text" placeholder="Search city…" value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                                </div>
                                <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
                                  {availableCities
                                    .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                                    .map((c) => (
                                      <li key={c}>
                                        <button type="button" role="option"
                                          aria-selected={formData.city === c}
                                          onClick={() => {
                                            const zips = INDIA_DATA[formData.state]?.[c] ?? [];
                                            setFormData({ ...formData, city: c, zipCode: zips.length === 1 ? zips[0] : '' });
                                            setCityOpen(false); setCitySearch('');
                                          }}
                                          className={`flex w-full items-center px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${formData.city === c ? 'bg-primary/10 font-medium text-primary' : ''}`}
                                        >{c}</button>
                                      </li>
                                    ))}
                                  {availableCities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                                    <li className="px-3 py-4 text-center text-sm text-muted-foreground">No city found</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Input id="city" name="city" value={formData.city} onChange={handleInputChange}
                            required className="rounded-lg border-border" />
                        )}
                      </div>

                      {/* ZIP CODE */}
                      <div className="space-y-2" ref={isIndia && availableZips.length > 1 ? zipRef : undefined}>
                        <Label htmlFor={isIndia && availableZips.length > 1 ? 'zip-btn' : 'zipCode'}>ZIP Code *</Label>
                        {isIndia && availableZips.length > 1 ? (
                          <div className="relative">
                            <button
                              id="zip-btn"
                              type="button"
                              disabled={!formData.city}
                              onClick={() => setZipOpen((o) => !o)}
                              className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className={formData.zipCode ? '' : 'text-muted-foreground'}>
                                {formData.zipCode || (formData.city ? 'Select PIN' : 'Select city first')}
                              </span>
                              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${zipOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {zipOpen && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                                <ul className="max-h-48 overflow-y-auto py-1" role="listbox">
                                  {availableZips.map((z) => (
                                    <li key={z}>
                                      <button type="button" role="option"
                                        aria-selected={formData.zipCode === z}
                                        onClick={() => { setFormData({ ...formData, zipCode: z }); setZipOpen(false); }}
                                        className={`flex w-full items-center px-3 py-2.5 text-sm font-mono transition-colors hover:bg-muted/60 ${formData.zipCode === z ? 'bg-primary/10 font-semibold text-primary' : ''}`}
                                      >{z}</button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                            required readOnly={isIndia && availableZips.length === 1}
                            placeholder={isIndia && !formData.city ? 'Select city first' : ''}
                            className="rounded-lg border-border" />
                        )}
                      </div>

                    </div>
                  );
                })()}

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg border-border"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border shadow overflow-hidden">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/50">
                  <div className="flex-1">
                    <p className="font-semibold">Cash on Delivery (COD)</p>
                    <p className="text-sm text-muted-foreground">
                      Pay when you receive your order
                    </p>
                  </div>
                  <span className="text-2xl">💵</span>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-sm h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place order
            </Button>
          </form>

          <div className="lg:col-span-1">
            <Card className="rounded-xl border border-border shadow sticky top-20 overflow-hidden">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                        {item.size && ` (${item.size})`}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-border" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
