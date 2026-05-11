export type SpiceLevel = "any" | "mild" | "medium" | "hot";

export type CustomizationPrefs = {
  vegetarianHighlight: boolean;
  veganHighlight: boolean;
  glutenFree: boolean;
  noNuts: boolean;
  spiceDefault: SpiceLevel;
};

const STORAGE_KEY = "foodislice_customization";

const defaults: CustomizationPrefs = {
  vegetarianHighlight: false,
  veganHighlight: false,
  glutenFree: false,
  noNuts: false,
  spiceDefault: "any",
};

function clampPrefs(p: Partial<CustomizationPrefs>): CustomizationPrefs {
  const spiceRaw = p.spiceDefault;
  const spice: SpiceLevel =
    spiceRaw === "mild" ||
    spiceRaw === "medium" ||
    spiceRaw === "hot" ||
    spiceRaw === "any"
      ? spiceRaw
      : defaults.spiceDefault;
  return {
    vegetarianHighlight: !!p.vegetarianHighlight,
    veganHighlight: !!p.veganHighlight,
    glutenFree: !!p.glutenFree,
    noNuts: !!p.noNuts,
    spiceDefault: spice,
  };
}

export function loadCustomizationPrefs(): CustomizationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== "object") return { ...defaults };
    return clampPrefs(j as Partial<CustomizationPrefs>);
  } catch {
    return { ...defaults };
  }
}

export function saveCustomizationPrefs(p: CustomizationPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clampPrefs(p)));
  } catch {
    /* ignore */
  }
}

/** Short line for Food Order / kitchen context (not auto-added to cart). */
export function summarizeCustomizationPrefs(p: CustomizationPrefs): string {
  const parts: string[] = [];
  if (p.vegetarianHighlight) parts.push("Vegetarian");
  if (p.veganHighlight) parts.push("Vegan");
  if (p.glutenFree) parts.push("Gluten-free");
  if (p.noNuts) parts.push("No nuts / nut allergy");
  if (p.spiceDefault !== "any") {
    parts.push(
      p.spiceDefault === "mild"
        ? "Prefer mild spice"
        : p.spiceDefault === "medium"
          ? "Prefer medium spice"
          : "Prefer hot spice",
    );
  }
  return parts.join(" · ");
}
