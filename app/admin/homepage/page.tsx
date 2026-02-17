'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, GripVertical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Section {
  _id: string;
  type: string;
  title: string;
  order: number;
  active: boolean;
  linkedProductIds: string[];
  categoryId: string | null;
}

export default function AdminHomepagePage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/homepage-sections');
      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<string, string> = {
    hero: 'Hero',
    featured_categories: 'Featured Categories',
    trending: 'Trending',
    new_arrivals: 'New Arrivals',
    promo: 'Promo Banner',
    category: 'Category Section',
    big_size: 'Big Size',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Homepage Manager</h2>
        <Button asChild>
          <Link href="/admin/homepage/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground">
        Control which sections appear on the homepage and in what order. Enable/disable and edit each section.
      </p>

      <div className="space-y-4">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <Card key={section._id}>
              <CardContent className="p-4 flex flex-wrap items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{typeLabels[section.type] || section.type}</Badge>
                    {!section.active && <Badge variant="outline">Disabled</Badge>}
                    <span className="font-medium">{section.title || '(No title)'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order: {section.order}
                    {section.type === 'big_size'
                      ? ' · Products with XL/XXL etc. (auto)'
                      : null}
                    {section.type !== 'big_size' && section.linkedProductIds?.length > 0 &&
                      ` · ${section.linkedProductIds.length} product(s)`}
                    {section.type !== 'big_size' && section.categoryId && ' · Category linked'}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/homepage/edit/${section._id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {sections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No homepage sections yet. Add sections to build your dynamic homepage (e.g. Trending, New Arrivals, Category blocks).
          </CardContent>
        </Card>
      )}
    </div>
  );
}
