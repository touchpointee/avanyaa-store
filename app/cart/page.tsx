'use client';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-20 pb-24 md:pb-20">
        <div className="text-center space-y-5 max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto rounded-xl bg-muted border border-border flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Your cart is empty</h1>
          <p className="text-muted-foreground text-sm">
            Add some beautiful dresses to your cart
          </p>
          <Button className="rounded-lg w-full" size="lg" asChild>
            <Link href="/products">Shop now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-6 tracking-tight">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.productId}-${item.size}`} className="rounded-xl border border-border shadow overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full h-52 max-w-[140px] sm:max-w-none sm:w-24 sm:h-32 rounded-xl overflow-hidden bg-muted shrink-0 mx-auto sm:mx-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-2 flex-1 min-w-0">{item.name}</h3>
                      <p className="font-bold text-sm shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    {item.size && (
                      <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)} each</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg shrink-0 touch-manipulation"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg shrink-0 touch-manipulation"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-lg ml-auto shrink-0 text-destructive touch-manipulation"
                        onClick={() => removeItem(item.productId, item.size)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-xl border border-border shadow sticky top-20 overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <h2 className="font-heading text-lg font-semibold tracking-tight">Order Summary</h2>
              <Separator className="bg-border" />
              <div className="space-y-2 text-sm">
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
                <span className="text-primary">{formatPrice(getTotalPrice())}</span>
              </div>
              <p className="text-xs text-muted-foreground rounded-lg bg-muted border border-border p-2.5">
                Pay by <strong>Cash on Delivery (COD)</strong> when you receive your order.
              </p>
              <Button className="w-full rounded-lg h-12 text-base font-semibold" size="lg" asChild>
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
              <Button variant="outline" className="w-full rounded-lg border-border" asChild>
                <Link href="/products">Continue shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
