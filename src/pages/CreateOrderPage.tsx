import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '@/api/clientApi';
import { productApi } from '@/api/productApi';
import { orderApi } from '@/api/orderApi';
import type { ClientResponse } from '@/types/client';
import type { ProductResponse } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TierBadge } from '@/components/shared/TierBadge';
import { TIER_DISCOUNTS, TVA_RATE, PROMO_DISCOUNT_RATE } from '@/lib/constants';
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Tag,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

interface OrderItem {
  product: ProductResponse;
  quantite: number;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [codePromo, setCodePromo] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [c, p] = await Promise.all([
          clientApi.getAll(),
          productApi.getAll(0, 1000),
        ]);
        setClients(c);
        setProducts(p.content);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtered lists
  const filteredClients = useMemo(
    () => clients.filter((c) => c.nom.toLowerCase().includes(clientSearch.toLowerCase())),
    [clients, clientSearch]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.nom.toLowerCase().includes(productSearch.toLowerCase()) &&
          !items.some((item) => item.product.id === p.id)
      ),
    [products, productSearch, items]
  );

  // Calculation
  const sousTotal = items.reduce((sum, item) => sum + item.product.prixUnitaire * item.quantite, 0);

  const tierDiscount = useMemo(() => {
    if (!selectedClient) return 0;
    const disc = TIER_DISCOUNTS[selectedClient.tier];
    if (sousTotal >= disc.minSubtotal) {
      return sousTotal * (disc.percentage / 100);
    }
    return 0;
  }, [selectedClient, sousTotal]);

  const promoValid = /^PROMO-[A-Z0-9]{4}$/.test(codePromo.toUpperCase());
  const promoDiscount = promoValid ? sousTotal * PROMO_DISCOUNT_RATE : 0;
  const totalDiscount = tierDiscount + promoDiscount;
  const htApresRemise = sousTotal - totalDiscount;
  const tva = htApresRemise * TVA_RATE;
  const totalTtc = htApresRemise + tva;

  const addProduct = (product: ProductResponse) => {
    setItems([...items, { product, quantite: 1 }]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    setItems(items.map((item, i) => {
      if (i !== index) return item;
      const newQ = Math.max(1, Math.min(item.product.stock, item.quantite + delta));
      return { ...item, quantite: newQ };
    }));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderApi.create({
        clientId: selectedClient.id,
        items: items.map((item) => ({
          productId: item.product.id,
          quantite: item.quantite,
        })),
        codePromo: promoValid ? codePromo.toUpperCase() : undefined,
      });
      toast.success('Order created successfully!');
      navigate(`/app/orders/${order.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/orders')}
          className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-bg-light dark:hover:bg-bg-tertiary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Create Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
              1. Select Client
            </h3>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-tertiary">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    {selectedClient.nom}
                  </span>
                  <TierBadge tier={selectedClient.tier} size="sm" />
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-xs text-danger hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="Search clients by name..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {showClientDropdown && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-secondary shadow-xl">
                    {filteredClients.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-text-muted">No clients found</div>
                    ) : (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(client);
                            setClientSearch('');
                            setShowClientDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-bg-light dark:hover:bg-bg-tertiary text-left"
                        >
                          <span className="text-text-primary-light dark:text-text-primary-dark">{client.nom}</span>
                          <TierBadge tier={client.tier} size="sm" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tier info */}
            {selectedClient && (
              <div className="mt-3 p-3 rounded-lg bg-info/5 border border-info/20">
                <p className="text-xs text-info">
                  <strong>{selectedClient.tier}</strong> tier — {TIER_DISCOUNTS[selectedClient.tier].percentage}% loyalty discount
                  {TIER_DISCOUNTS[selectedClient.tier].minSubtotal > 0 &&
                    ` (min. ${formatCurrency(TIER_DISCOUNTS[selectedClient.tier].minSubtotal)} subtotal)`}
                </p>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
              2. Add Products
            </h3>

            {/* Product search */}
            <div className="relative mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {showProductDropdown && productSearch && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-secondary shadow-xl">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-text-muted">No products found</div>
                  ) : (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        disabled={product.stock === 0}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-bg-light dark:hover:bg-bg-tertiary text-left disabled:opacity-50"
                      >
                        <div>
                          <span className="text-text-primary-light dark:text-text-primary-dark">{product.nom}</span>
                          <span className="text-xs text-text-muted ml-2">Stock: {product.stock}</span>
                        </div>
                        <span className="font-mono text-xs">{formatCurrency(product.prixUnitaire)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Items list */}
            {items.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 stroke-1" />
                Search and add products above
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-tertiary"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                        {item.product.nom}
                      </p>
                      <p className="text-xs text-text-muted font-mono">{formatCurrency(item.product.prixUnitaire)} / unit</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="p-1 rounded-md border border-border-light dark:border-border-dark hover:bg-bg-card-light dark:hover:bg-bg-secondary"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-mono text-sm font-medium">{item.quantite}</span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="p-1 rounded-md border border-border-light dark:border-border-dark hover:bg-bg-card-light dark:hover:bg-bg-secondary"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-mono text-sm font-medium min-w-[100px] text-right text-text-primary-light dark:text-text-primary-dark">
                      {formatCurrency(item.product.prixUnitaire * item.quantite)}
                    </span>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promo Code */}
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
              3. Promo Code (Optional)
            </h3>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={codePromo}
                onChange={(e) => setCodePromo(e.target.value.toUpperCase())}
                placeholder="PROMO-XXXX"
                maxLength={10}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-bg-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono',
                  codePromo && !promoValid ? 'border-danger' : 'border-border-light dark:border-border-dark',
                  codePromo && promoValid && 'border-success'
                )}
              />
            </div>
            {codePromo && !promoValid && (
              <p className="mt-1 text-xs text-danger">Format: PROMO-XXXX (4 alphanumeric chars)</p>
            )}
            {codePromo && promoValid && (
              <p className="mt-1 text-xs text-success">+5% promo discount applied!</p>
            )}
          </div>
        </div>

        {/* Right: Live Calculation */}
        <div className="lg:col-span-1">
          <div className="bg-bg-card-light dark:bg-bg-secondary rounded-xl border border-border-light dark:border-border-dark p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
              Order Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal HT</span>
                <span className="font-mono">{formatCurrency(sousTotal)}</span>
              </div>

              {tierDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Loyalty ({TIER_DISCOUNTS[selectedClient!.tier].percentage}%)
                  </span>
                  <span className="font-mono text-accent">-{formatCurrency(tierDiscount)}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Promo (5%)</span>
                  <span className="font-mono text-accent">-{formatCurrency(promoDiscount)}</span>
                </div>
              )}

              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm border-t border-border-light dark:border-border-dark pt-2">
                  <span className="text-text-secondary">HT après remise</span>
                  <span className="font-mono">{formatCurrency(htApresRemise)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">TVA (20%)</span>
                <span className="font-mono">{formatCurrency(tva)}</span>
              </div>

              <div className="border-t border-border-light dark:border-border-dark pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                    Total TTC
                  </span>
                  <span className="text-xl font-bold font-mono text-primary">
                    {formatCurrency(totalTtc)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedClient || items.length === 0}
              className={cn(
                'w-full mt-6 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </span>
              ) : (
                'Create Order'
              )}
            </button>

            <p className="text-xs text-text-muted text-center mt-3">
              {items.length} item{items.length !== 1 ? 's' : ''} • {selectedClient ? selectedClient.nom : 'No client selected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
