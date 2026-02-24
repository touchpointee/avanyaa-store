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
import { Loader2, ChevronDown, Search, Plus, MapPin, Home, Briefcase, MoreHorizontal, Trash2, CheckCircle2 } from 'lucide-react';
import { INDIA_DATA } from '@/lib/locationData';
import OrderStatusPopup from '@/components/OrderStatusPopup';

/* ─── Types ──────────────────────────────────────────── */
interface SavedAddress {
  _id: string;
  label: 'Home' | 'Work' | 'Other';
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  state: string;
  city: string;
  zipCode: string;
  country: string;
};

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

const LABEL_ICON = {
  Home: <Home className="h-3.5 w-3.5" />,
  Work: <Briefcase className="h-3.5 w-3.5" />,
  Other: <MoreHorizontal className="h-3.5 w-3.5" />,
};

const EMPTY_FORM: FormData = {
  fullName: '', email: '', phone: '',
  street: '', state: '', city: '', zipCode: '', country: 'India',
};

/* ════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  /* ── Saved addresses ──────────────────────────────── */
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  /* 'select' = choose from saved | 'new' = fill form */
  const [addrMode, setAddrMode] = useState<'select' | 'new'>('select');
  const [saveThisAddress, setSaveThisAddress] = useState(true);

  /* ── Form data ────────────────────────────────────── */
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  /* ── Dropdown helpers ─────────────────────────────── */
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryRef = useRef<HTMLDivElement>(null);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const stateRef = useRef<HTMLDivElement>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const cityRef = useRef<HTMLDivElement>(null);
  const [zipOpen, setZipOpen] = useState(false);
  const zipRef = useRef<HTMLDivElement>(null);

  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [pincodeError, setPincodeError] = useState('');

  /* ── Close dropdowns on outside click ────────────── */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) { setCountryOpen(false); setCountrySearch(''); }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) { setStateOpen(false); setStateSearch(''); }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) { setCityOpen(false); setCitySearch(''); }
      if (zipRef.current && !zipRef.current.contains(e.target as Node)) { setZipOpen(false); }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  /* ── Fetch saved addresses ────────────────────────── */
  useEffect(() => {
    // Wait until NextAuth has resolved the session
    if (sessionStatus === 'loading') return;
    // Guest / not logged in — skip fetch, show form directly
    if (sessionStatus === 'unauthenticated') {
      setAddrLoading(false);
      setAddrMode('new');
      return;
    }
    // Authenticated — fetch saved addresses
    setAddrLoading(true);
    fetch('/api/addresses')
      .then((r) => r.ok ? r.json() : [])
      .then((data: SavedAddress[]) => {
        setSavedAddresses(data);
        if (data.length > 0) {
          const def = data.find((a) => a.isDefault) ?? data[0];
          setSelectedAddressId(def._id);
          setAddrMode('select');
        } else {
          setAddrMode('new');
        }
      })
      .catch(() => { setAddrMode('new'); })
      .finally(() => setAddrLoading(false));
  }, [sessionStatus]);

  /* ── Pre-fill name/email from session ────────────── */
  useEffect(() => {
    if (session && (session.user as { role?: string }).role === 'admin') {
      router.push('/auth/signin'); return;
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'zipCode') { setPincodeStatus('idle'); setPincodeError(''); }
    if ((name === 'city' || name === 'state') && pincodeStatus === 'valid') {
      setFormData((prev) => ({ ...prev, [name]: value, zipCode: '' }));
      setPincodeStatus('idle'); setPincodeError('');
    }
  };

  /* ── Pincode auto-fill ────────────────────────────── */
  useEffect(() => {
    const pin = formData.zipCode.trim();
    if (!/^\d{6}$/.test(pin)) {
      if (pin.length === 6) { setPincodeStatus('invalid'); setPincodeError('Enter a valid 6-digit Indian pincode'); }
      else { setPincodeStatus('idle'); setPincodeError(''); }
      return;
    }
    setPincodeStatus('loading'); setPincodeError('');
    const controller = new AbortController();
    fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const record = data?.[0];
        if (record?.Status === 'Success' && record.PostOffice?.length > 0) {
          const po = record.PostOffice[0];
          setFormData((prev) => ({ ...prev, city: po.District || po.Name || prev.city, state: po.State || prev.state }));
          setPincodeStatus('valid'); setPincodeError('');
        } else { setPincodeStatus('invalid'); setPincodeError('Pincode not found. Please check and try again.'); }
      })
      .catch((err) => { if (err.name !== 'AbortError') { setPincodeStatus('invalid'); setPincodeError('Could not verify pincode. Please try again.'); } });
    return () => controller.abort();
  }, [formData.zipCode]);

  /* ── Delete saved address ─────────────────────────── */
  const deleteAddress = async (id: string) => {
    await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
    const next = savedAddresses.filter((a) => a._id !== id);
    setSavedAddresses(next);
    if (selectedAddressId === id) {
      setSelectedAddressId(next[0]?._id ?? null);
      if (next.length === 0) setAddrMode('new');
    }
  };

  /* ── Build address payload ────────────────────────── */
  const getAddressPayload = (): FormData | null => {
    if (addrMode === 'select') {
      const addr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (!addr) return null;
      return { fullName: addr.fullName, email: addr.email, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, zipCode: addr.zipCode, country: addr.country };
    }
    return formData;
  };

  /* ── Place order ──────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const address = getAddressPayload();
    if (!address) { toast({ title: 'Select an address', variant: 'destructive' }); setLoading(false); return; }

    const requiredFields: (keyof FormData)[] = ['fullName', 'email', 'phone', 'street', 'state', 'city', 'zipCode', 'country'];
    for (const field of requiredFields) {
      if (!address[field]) {
        toast({ title: 'Missing information', description: `Please fill in ${field}`, variant: 'destructive' });
        setLoading(false); return;
      }
    }
    if (!/\S+@\S+\.\S+/.test(address.email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' });
      setLoading(false); return;
    }

    try {
      // Optionally save before placing order
      if (addrMode === 'new' && saveThisAddress && isCustomerSession(session)) {
        const saveRes = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...address, label: 'Home' }),
        });
        if (!saveRes.ok) {
          const err = await saveRes.json().catch(() => ({}));
          console.error('[Save address failed]', saveRes.status, err);
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, size: item.size })), address }),
      });
      const data = await response.json();
      if (response.ok) { clearCart(); setPlacedOrderId(data.orderId); }
      else toast({ title: 'Order failed', description: data.error || 'Something went wrong', variant: 'destructive' });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ title: 'Error', description: 'Failed to place order. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0 && !loading && !placedOrderId) router.replace('/cart');
  }, [items.length, loading, placedOrderId, router]);

  if (items.length === 0 && !placedOrderId) {
    return <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[40vh]"><p className="text-muted-foreground">Redirecting to cart...</p></div>;
  }

  const isIndia = formData.country === 'India';
  const availableStates = isIndia ? Object.keys(INDIA_DATA).sort() : [];
  const availableCities = isIndia && formData.state && INDIA_DATA[formData.state] ? Object.keys(INDIA_DATA[formData.state]).sort() : [];
  const availableZips = isIndia && formData.state && formData.city && INDIA_DATA[formData.state]?.[formData.city] ? INDIA_DATA[formData.state][formData.city] : [];

  return (
    <>
      {placedOrderId && (
        <OrderStatusPopup type="placed" onDone={() => { router.push(`/order-success?orderId=${placedOrderId}`); }} />
      )}
      <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-2 tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Pay by <strong>Cash on Delivery (COD)</strong> when you receive your order.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

            {/* ═══════════════════════════════════════════
                DELIVERY ADDRESS CARD
            ═══════════════════════════════════════════ */}
            <Card className="rounded-xl border border-border shadow overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-lg">Delivery Address</CardTitle>
                  {savedAddresses.length > 0 && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setAddrMode('select')}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${addrMode === 'select' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                        Saved
                      </button>
                      <button type="button" onClick={() => setAddrMode('new')}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${addrMode === 'new' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                        <Plus className="h-3 w-3" /> Add New
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* ── Loading ── */}
                {addrLoading && (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-muted" />)}
                  </div>
                )}

                {/* ── Saved address selector ── */}
                {!addrLoading && addrMode === 'select' && savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <div key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`relative flex gap-4 items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-muted/30'}`}>
                        {/* Radio */}
                        <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${selectedAddressId === addr._id ? 'border-primary' : 'border-border'}`}>
                          {selectedAddressId === addr._id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${addr.label === 'Home' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : addr.label === 'Work' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' : 'bg-muted text-muted-foreground'}`}>
                              {LABEL_ICON[addr.label]} {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Default
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm text-foreground">{addr.fullName}</p>
                          <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                            {addr.street}, {addr.city}, {addr.state} – {addr.zipCode}, {addr.country}
                          </p>
                        </div>
                        {/* Delete */}
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); deleteAddress(addr._id); }}
                          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add another address shortcut */}
                    <button type="button" onClick={() => setAddrMode('new')}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 text-sm text-muted-foreground hover:text-foreground transition-all">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Plus className="h-4 w-4" />
                      </div>
                      Add a new address
                    </button>
                  </div>
                )}

                {/* ── New address form ── */}
                {!addrLoading && addrMode === 'new' && (
                  <div className="space-y-4">
                    {/* Back to saved */}
                    {savedAddresses.length > 0 && (
                      <button type="button" onClick={() => setAddrMode('select')}
                        className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                        ← Back to saved addresses
                      </button>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="rounded-lg border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="rounded-lg border-border" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="rounded-lg border-border" />
                      </div>
                      {/* Country dropdown */}
                      <div className="space-y-2" ref={countryRef}>
                        <Label htmlFor="country-btn">Country *</Label>
                        <div className="relative">
                          <button id="country-btn" type="button" onClick={() => { setCountryOpen((o) => !o); setCountrySearch(''); }}
                            className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors">
                            <span className="flex items-center gap-2 truncate">
                              {formData.country ? (
                                <>
                                  <img src={`https://flagcdn.com/20x15/${COUNTRIES.find((c) => c.name === formData.country)?.code ?? 'un'}.png`} width={20} height={15} alt={formData.country} className="rounded-sm object-cover shrink-0" />
                                  <span>{formData.country}</span>
                                </>
                              ) : <span className="text-muted-foreground">Select country</span>}
                            </span>
                            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${countryOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {countryOpen && (
                            <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <input autoFocus type="text" placeholder="Search country…" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                              </div>
                              <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
                                {COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
                                  <li key={c.code}>
                                    <button type="button" role="option" aria-selected={formData.country === c.name}
                                      onClick={() => { setFormData({ ...formData, country: c.name, state: '', city: '', zipCode: '' }); setCountryOpen(false); setCountrySearch(''); }}
                                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${formData.country === c.name ? 'bg-primary/10 font-medium text-primary' : ''}`}>
                                      <img src={`https://flagcdn.com/20x15/${c.code}.png`} width={20} height={15} alt={c.name} className="rounded-sm object-cover shrink-0" />
                                      <span>{c.name}</span>
                                    </button>
                                  </li>
                                ))}
                                {COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                                  <li className="px-3 py-4 text-center text-sm text-muted-foreground">No country found</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* State / City / ZIP */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* STATE */}
                      <div className="space-y-2" ref={isIndia ? stateRef : undefined}>
                        <Label htmlFor={isIndia ? 'state-btn' : 'state'}>State *</Label>
                        {isIndia ? (
                          <div className="relative">
                            <button id="state-btn" type="button" disabled={!formData.country}
                              onClick={() => { setStateOpen((o) => !o); setStateSearch(''); }}
                              className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                              <span className={formData.state ? '' : 'text-muted-foreground'}>{formData.state || 'Select state'}</span>
                              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${stateOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {stateOpen && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  <input autoFocus type="text" placeholder="Search state…" value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                                </div>
                                <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
                                  {availableStates.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase())).map((s) => (
                                    <li key={s}><button type="button" role="option" aria-selected={formData.state === s}
                                      onClick={() => { setFormData({ ...formData, state: s, city: '', zipCode: '' }); setStateOpen(false); setStateSearch(''); }}
                                      className={`flex w-full items-center px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${formData.state === s ? 'bg-primary/10 font-medium text-primary' : ''}`}>{s}</button></li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required className="rounded-lg border-border" />
                        )}
                      </div>
                      {/* CITY */}
                      <div className="space-y-2" ref={isIndia ? cityRef : undefined}>
                        <Label htmlFor={isIndia ? 'city-btn' : 'city'}>City *</Label>
                        {isIndia ? (
                          <div className="relative">
                            <button id="city-btn" type="button" disabled={!formData.state}
                              onClick={() => { setCityOpen((o) => !o); setCitySearch(''); }}
                              className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                              <span className={formData.city ? '' : 'text-muted-foreground'}>{formData.city || (formData.state ? 'Select city' : 'Select state first')}</span>
                              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {cityOpen && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  <input autoFocus type="text" placeholder="Search city…" value={citySearch} onChange={(e) => setCitySearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                                </div>
                                <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
                                  {availableCities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())).map((c) => (
                                    <li key={c}><button type="button" role="option" aria-selected={formData.city === c}
                                      onClick={() => { const zips = INDIA_DATA[formData.state]?.[c] ?? []; setFormData({ ...formData, city: c, zipCode: zips.length === 1 ? zips[0] : '' }); setCityOpen(false); setCitySearch(''); }}
                                      className={`flex w-full items-center px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${formData.city === c ? 'bg-primary/10 font-medium text-primary' : ''}`}>{c}</button></li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required className="rounded-lg border-border" />
                        )}
                      </div>
                      {/* ZIP */}
                      <div className="space-y-2" ref={isIndia && availableZips.length > 1 ? zipRef : undefined}>
                        <Label htmlFor={isIndia && availableZips.length > 1 ? 'zip-btn' : 'zipCode'}>ZIP Code *</Label>
                        {isIndia && availableZips.length > 1 ? (
                          <div className="relative">
                            <button id="zip-btn" type="button" disabled={!formData.city} onClick={() => setZipOpen((o) => !o)}
                              className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                              <span className={formData.zipCode ? '' : 'text-muted-foreground'}>{formData.zipCode || (formData.city ? 'Select PIN' : 'Select city first')}</span>
                              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${zipOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {zipOpen && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                                <ul className="max-h-48 overflow-y-auto py-1" role="listbox">
                                  {availableZips.map((z) => (
                                    <li key={z}><button type="button" role="option" aria-selected={formData.zipCode === z}
                                      onClick={() => { setFormData({ ...formData, zipCode: z }); setZipOpen(false); }}
                                      className={`flex w-full items-center px-3 py-2.5 text-sm font-mono transition-colors hover:bg-muted/60 ${formData.zipCode === z ? 'bg-primary/10 font-semibold text-primary' : ''}`}>{z}</button></li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required readOnly={isIndia && availableZips.length === 1}
                            placeholder={isIndia && !formData.city ? 'Select city first' : ''} className="rounded-lg border-border" />
                        )}
                        {pincodeError && <p className="text-xs text-destructive mt-1">{pincodeError}</p>}
                        {pincodeStatus === 'valid' && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Pincode verified</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required className="rounded-lg border-border" />
                    </div>

                    {/* Save address toggle — single button, no double-toggle */}
                    {isCustomerSession(session) && (
                      <button
                        type="button"
                        onClick={() => setSaveThisAddress((v) => !v)}
                        className="flex items-center gap-3 group text-left w-full"
                        aria-pressed={saveThisAddress}
                      >
                        <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${saveThisAddress ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
                          }`}>
                          {saveThisAddress && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-foreground">Save this address for future orders</span>
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════
                PAYMENT METHOD
            ═══════════════════════════════════════════ */}
            <Card className="rounded-xl border border-border shadow overflow-hidden">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                  <div className="flex-1">
                    <p className="font-semibold">Cash on Delivery (COD)</p>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </div>
                  <span className="text-2xl">💵</span>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Order
            </Button>
          </form>

          {/* ═══════════════════════════════════════════
              ORDER SUMMARY
          ═══════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl border border-border shadow sticky top-28 overflow-hidden">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} × {item.quantity}{item.size && ` (${item.size})`}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-border" />
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(getTotalPrice())}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-600 font-medium">FREE</span></div>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span><span>{formatPrice(getTotalPrice())}</span>
                </div>

                {/* Selected address preview */}
                {addrMode === 'select' && selectedAddressId && (() => {
                  const addr = savedAddresses.find(a => a._id === selectedAddressId);
                  if (!addr) return null;
                  return (
                    <div className="mt-2 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Delivering to</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground leading-relaxed">
                          {addr.fullName}<br />
                          {addr.street}, {addr.city}, {addr.state} – {addr.zipCode}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
