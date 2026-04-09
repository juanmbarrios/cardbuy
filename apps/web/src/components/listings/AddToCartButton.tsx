"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@cardbuy/ui";
import { useCart } from "@/context/CartContext";

interface Props {
  listingId: string;
  isOutOfStock: boolean;
}

export function AddToCartButton({ listingId, isOutOfStock }: Props) {
  const { status } = useSession();
  const { addItem } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleAdd = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    setLoading(true);
    setFeedback(null);

    const result = await addItem(listingId);

    if (result.ok) {
      setFeedback({ ok: true, msg: "¡Añadido al carrito!" });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ ok: false, msg: result.error ?? "No se pudo añadir" });
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="primary"
        size="lg"
        disabled={isOutOfStock || status === "loading"}
        loading={loading}
        onClick={handleAdd}
        className="w-full"
      >
        {isOutOfStock ? "No disponible" : "Añadir al carrito"}
      </Button>

      {feedback && (
        <p
          className={[
            "text-xs text-center",
            feedback.ok ? "text-green-400" : "text-red-400",
          ].join(" ")}
        >
          {feedback.msg}
        </p>
      )}

      {!isOutOfStock && !feedback && (
        <p className="text-xs text-center text-slate-500">
          Pago protegido · Devoluciones en 14 días
        </p>
      )}
    </div>
  );
}
