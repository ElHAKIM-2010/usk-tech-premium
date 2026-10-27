"use client";

import { useActionState } from "react";

import { updateStockAction } from "@/app/admin/produk/actions";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/admin-schemas";
import { buttonClass } from "@/lib/ui";

const initialState: AdminActionState = initialAdminActionState;

export function StockForm({
  productId,
  productName,
  stock,
}: {
  productId: number;
  productName: string;
  stock: number;
}) {
  const [state, formAction, pending] = useActionState(
    updateStockAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input type="hidden" name="productId" value={productId} />
        <input
          type="number"
          name="stock"
          min={0}
          max={100000}
          step={1}
          defaultValue={stock}
          aria-label={`Stok ${productName}`}
          className="w-20 rounded-lg border border-border bg-bg px-2 py-1.5 text-xs text-text outline-none focus:border-accent-text/60"
        />
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("secondary", "sm", "px-3 py-1.5")}
        >
          {pending ? "..." : "Simpan"}
        </button>
      </div>

      {state.status === "success" ? (
        <p className="text-[10px] text-accent-text">Tersimpan</p>
      ) : null}

      {state.status === "error" ? (
        <p className="text-[10px] text-danger">{state.message}</p>
      ) : null}
    </form>
  );
}
