"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@cardbuy/ui";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [shopSlug, setShopSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShopName = (value: string) => {
    setShopName(value);
    setShopSlug(
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/seller/become", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopName, shopSlug, description }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al crear el perfil de vendedor.");
      return;
    }

    router.push("/seller/dashboard");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Crea tu tienda
        </h1>
        <p className="text-slate-400 text-sm">
          Empieza a vender cartas TCG en CardBuy. Es gratis y sin comisiones de apertura.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-surface border border-surface-border rounded-2xl p-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Nombre de la tienda
          </label>
          <Input
            placeholder="ej. CardShark TCG"
            value={shopName}
            onChange={(e) => handleShopName(e.target.value)}
            required
            minLength={3}
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            URL de tu tienda
          </label>
          <div className="flex items-center gap-0 rounded-lg border border-surface-border bg-bg overflow-hidden focus-within:ring-2 focus-within:ring-brand/50 focus-within:border-brand/50">
            <span className="px-3 text-sm text-slate-500 shrink-0">cardbuy.com/seller/</span>
            <input
              type="text"
              value={shopSlug}
              onChange={(e) => setShopSlug(e.target.value)}
              placeholder="mi-tienda"
              required
              minLength={3}
              maxLength={40}
              pattern="[a-z0-9-]+"
              className="flex-1 bg-transparent py-2 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Solo letras minúsculas, números y guiones.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuéntanos sobre tu tienda, especialidad, política de envíos..."
            maxLength={500}
            rows={3}
            className="w-full rounded-lg border border-surface-border bg-bg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 border border-red-900/50 bg-red-950/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button variant="primary" type="submit" loading={loading} className="w-full">
          Crear mi tienda
        </Button>
      </form>
    </div>
  );
}
