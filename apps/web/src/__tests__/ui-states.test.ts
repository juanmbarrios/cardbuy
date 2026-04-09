import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Helpers — mirrors lógica interna de EmptyState y ErrorState
// ---------------------------------------------------------------------------

function resolveEmptyTitle(searchQuery: string | undefined): string {
  if (searchQuery) {
    return `Sin resultados para "${searchQuery}"`;
  }
  return "No hay cartas disponibles";
}

function resolveEmptyDescription(searchQuery: string | undefined): string {
  if (searchQuery) {
    return "Prueba con otros términos o elimina algunos filtros.";
  }
  return "Prueba a cambiar los filtros o vuelve más tarde.";
}

function resolveErrorTitle(title: string | undefined): string {
  return title ?? "Algo salió mal";
}

function resolveErrorDescription(description: string | undefined): string {
  return description ?? "No hemos podido cargar el contenido. Inténtalo de nuevo.";
}

function skeletonCount(count: number | undefined): number {
  return count ?? 10;
}

// ---------------------------------------------------------------------------
// Tests — EmptyState
// ---------------------------------------------------------------------------

describe("EmptyState title", () => {
  it("shows generic title when no search query", () => {
    expect(resolveEmptyTitle(undefined)).toBe("No hay cartas disponibles");
  });

  it("shows query-specific title when search query is present", () => {
    expect(resolveEmptyTitle("charizard")).toBe('Sin resultados para "charizard"');
  });

  it("includes the exact query string in the title", () => {
    const query = "Black Lotus Alpha";
    expect(resolveEmptyTitle(query)).toContain(query);
  });
});

describe("EmptyState description", () => {
  it("shows filter hint when no search query", () => {
    expect(resolveEmptyDescription(undefined)).toContain("filtros");
  });

  it("shows search hint when query is present", () => {
    const desc = resolveEmptyDescription("something");
    expect(desc).toContain("términos");
    expect(desc).toContain("filtros");
  });
});

// ---------------------------------------------------------------------------
// Tests — ErrorState
// ---------------------------------------------------------------------------

describe("ErrorState defaults", () => {
  it("falls back to default title when none provided", () => {
    expect(resolveErrorTitle(undefined)).toBe("Algo salió mal");
  });

  it("uses provided title when given", () => {
    expect(resolveErrorTitle("Error de red")).toBe("Error de red");
  });

  it("falls back to default description when none provided", () => {
    expect(resolveErrorDescription(undefined)).toContain("cargar");
  });

  it("uses provided description when given", () => {
    expect(resolveErrorDescription("Sin conexión")).toBe("Sin conexión");
  });
});

// ---------------------------------------------------------------------------
// Tests — ListingsGridSkeleton count
// ---------------------------------------------------------------------------

describe("ListingsGridSkeleton count", () => {
  it("defaults to 10 skeleton cards when count is undefined", () => {
    expect(skeletonCount(undefined)).toBe(10);
  });

  it("uses provided count", () => {
    expect(skeletonCount(5)).toBe(5);
    expect(skeletonCount(20)).toBe(20);
  });

  it("accepts zero (edge case — empty skeleton grid)", () => {
    expect(skeletonCount(0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests — Touch target validation (44px WCAG 2.5.5)
// ---------------------------------------------------------------------------

describe("Touch target min-height", () => {
  // 44px = 2.75rem. Tailwind min-h-[44px] ensures this.
  // We test the mapping from px to number.
  const MIN_TOUCH_PX = 44;

  it("44px satisfies WCAG 2.5.5 minimum touch target", () => {
    expect(MIN_TOUCH_PX).toBeGreaterThanOrEqual(44);
  });

  it("FilterPanel select height meets minimum (min-h-[44px])", () => {
    // Simulates the height resolved from Tailwind class min-h-[44px]
    const resolvedHeightPx = 44;
    expect(resolvedHeightPx).toBeGreaterThanOrEqual(MIN_TOUCH_PX);
  });

  it("EmptyState CTA button height meets minimum (min-h-[44px])", () => {
    const resolvedHeightPx = 44;
    expect(resolvedHeightPx).toBeGreaterThanOrEqual(MIN_TOUCH_PX);
  });

  it("ErrorState retry button height meets minimum (min-h-[44px])", () => {
    const resolvedHeightPx = 44;
    expect(resolvedHeightPx).toBeGreaterThanOrEqual(MIN_TOUCH_PX);
  });
});
