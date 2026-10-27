"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCart } from "@/components/cart/cart-provider";
import { buttonClass } from "@/lib/ui";

interface PurchasePanelProps {
  slug: string;
  stock: number;
}

export function PurchasePanel({ slug, stock }: PurchasePanelProps) {
  const { addItem, ready } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = stock <= 0;

  useEffect(() => {
    if (!added) return;

    const timer = window.setTimeout(() => setAdded(false), 3000);
    return () => window.clearTimeout(timer);
  }, [added]);

  function handleAdd() {
    addItem(slug, quantity, stock);
    setAdded(true);
  }

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={Math.max(1, stock)}
          label="Jumlah produk"
        />
        <p className="text-xs text-muted">
          {outOfStock ? "Stok habis" : `Maksimal ${stock} unit per pesanan`}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!ready || outOfStock}
          className={buttonClass("primary", "lg", "flex-1")}
        >
          {added ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <ShoppingBag className="size-4" aria-hidden="true" />
          )}
          {outOfStock ? "Stok habis" : added ? "Ditambahkan ke keranjang" : "Tambah ke keranjang"}
        </button>

        {added ? (
          <Link href="/cart" className={buttonClass("secondary", "lg")}>
            Lihat keranjang
          </Link>
        ) : null}
      </div>

      <p aria-live="polite" className="mt-3 text-xs leading-5 text-muted">
        {added
          ? "Produk masuk ke keranjang di perangkat ini."
          : "Keranjang tersimpan di perangkat ini. Lanjutkan ke checkout dari halaman keranjang."}
      </p>
    </div>
  );
}
