"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatIDR } from "@/lib/format";
import type { Product } from "@/types/catalog";

const MAX_VISIBLE = 2;

function wrapOffset(index: number, active: number, length: number) {
  if (length < 2) return 0;

  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;

  return offset;
}

export function HeroCarousel({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStep, setDragStep] = useState(160);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef(0);
  const moved = useRef(false);
  const lastDragAt = useRef(0);
  const gesture = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const count = products.length;
  const activeProduct = products[active];

  const stepWidth = useCallback(() => {
    const width = trackRef.current?.clientWidth ?? 0;
    return Math.max(160, width * 0.55);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count],
  );

  const go = useCallback(
    (direction: number) => {
      if (count === 0) return;
      setActive((current) => ((current + direction) % count + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused || dragging) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => go(1), 5000);

    return () => window.clearTimeout(timer);
  }, [active, count, dragging, go, paused]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (count < 2) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const id = ++gesture.current;

    moved.current = false;
    dragRef.current = 0;
    setDragStep(stepWidth());
    setDragging(true);

    const onMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (!moved.current && Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
        moved.current = true;
      }

      if (!moved.current) return;

      moveEvent.preventDefault();
      dragRef.current = deltaX;
      setDrag(deltaX);
    };

    const finish = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);

      if (id !== gesture.current) return;

      const threshold = stepWidth() * 0.25;
      const final = dragRef.current;

      if (moved.current) lastDragAt.current = Date.now();

      setDragging(false);
      dragRef.current = 0;
      setDrag(0);

      if (final <= -threshold) go(1);
      else if (final >= threshold) go(-1);
    };

    const cancel = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);

      if (id !== gesture.current) return;

      dragRef.current = 0;
      setDrag(0);
      setDragging(false);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
  }

  if (!activeProduct) return null;

  const fraction = dragging ? drag / dragStep : 0;

  return (
    <div
      ref={trackRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="Produk pilihan"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
      className="absolute inset-0 cursor-grab select-none touch-pan-y outline-none active:cursor-grabbing"
      style={{ perspective: "1500px" }}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <p className="sr-only" aria-live="polite">
          {activeProduct.name}, {formatIDR(activeProduct.price)}, stok{" "}
          {activeProduct.stock} unit
        </p>
      </div>

      {products.map((product, index) => {
        const offset = wrapOffset(index, active, count);
        const visual = offset + fraction;
        const distance = Math.abs(visual);
        const isActive = offset === 0;
        const visible = distance <= MAX_VISIBLE + 1;

        const scale = Math.max(0.7, 1 - distance * 0.09);
        const translateX = visual * 44;
        const translateZ = -Math.min(distance, MAX_VISIBLE + 1) * 175;
        const rotateY = -Math.sign(visual) * Math.min(distance, 1) * 20;
        const opacity = Math.max(0, 1 - distance * 0.3);

        return (
          <div
            key={product.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${product.name}, ${index + 1} dari ${count}`}
            aria-hidden={!isActive}
            onClick={() => {
              if (Date.now() - lastDragAt.current < 350) return;
              goTo(index);
            }}
            className="absolute inset-y-2 inset-x-2 overflow-hidden rounded-2xl border border-white/10 bg-surface-2 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85)] sm:inset-y-3 sm:inset-x-3"
            style={{
              transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
              opacity,
              zIndex: 40 - Math.round(distance * 10),
              visibility: visible ? "visible" : "hidden",
              pointerEvents: visible ? "auto" : "none",
              transition: dragging
                ? "none"
                : "transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease",
              backfaceVisibility: "hidden",
            }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority={index === 0}
              draggable={false}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={cn(
                "pointer-events-none object-cover",
                isActive && "animate-kenburns",
              )}
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/0"
            />

            {isActive ? (
              <>
                <span className="animate-rise absolute left-3 top-3 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                  Edisi pilihan
                </span>

                <div
                  className="animate-rise absolute bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-black/75 p-4 text-white shadow-xl backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-auto sm:w-[19.5rem]"
                  style={{ animationDelay: "70ms" }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Pilihan editor
                  </p>

                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold tracking-tight">
                        {product.name}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-accent">
                        {formatIDR(product.price)}
                      </p>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      onClick={(event) => {
                        if (Date.now() - lastDragAt.current < 350) {
                          event.preventDefault();
                        }
                      }}
                      aria-label={`Lihat ${product.name}`}
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink"
                    >
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <p className="mt-2 text-[11px] text-white/60">
                    Stok {product.stock} unit · {product.categoryName}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        );
      })}

      {count > 1 ? (
        <div className="absolute right-4 top-4 z-50 flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-2 backdrop-blur-sm">
          {products.map((product, index) => (
            <button
              key={product.slug}
              type="button"
              onClick={() => {
                if (Date.now() - lastDragAt.current < 350) return;
                goTo(index);
              }}
              aria-label={`Tampilkan ${product.name}`}
              aria-current={index === active ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === active
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
