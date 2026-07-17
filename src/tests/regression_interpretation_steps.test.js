import {
  getEquation,
  buildAlphaSet,
  buildAlphaInsight,
  withFill,
  getConclusion,
} from "@econometrics/helpers/regression_interpretation_steps";

const t = (key, params = {}) => {
  if (!params || Object.keys(params).length === 0) return key;
  const interpolated = Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, "g"), v),
    key
  );
  return interpolated;
};

const yMeta = [{ name: "Sales", unit: "units" }];
const xMeta = [{ name: "Price", unit: "USD" }];

// ─── getEquation ──────────────────────────────────────────────────────────────

describe("getEquation", () => {
  test("builds a simple linear equation for a single predictor", () => {
    expect(getEquation(1, 1, [2], yMeta, xMeta, "linear")).toBe("Sales = 1 + 2 * Price");
  });

  test("wraps Y in ln() for log-linear and semi-log models", () => {
    expect(getEquation(1, 1, [2], yMeta, xMeta, "log-linear")).toContain("ln(Sales)");
    expect(getEquation(1, 1, [2], yMeta, xMeta, "semi-log")).toContain("ln(Sales)");
  });

  test("wraps X in ln() for log-linear and lin-log models", () => {
    expect(getEquation(1, 1, [2], yMeta, xMeta, "log-linear")).toContain("ln(Price)");
    expect(getEquation(1, 1, [2], yMeta, xMeta, "lin-log")).toContain("ln(Price)");
  });

  test("builds a multi-predictor equation with signed terms", () => {
    const xMeta2 = [{ name: "Price" }, { name: "Ads" }];
    expect(getEquation(2, 1, [2, -3], yMeta, xMeta2, "linear")).toBe(
      "Sales = 1 + 2 * Price - 3 * Ads"
    );
  });

  // Characterization test — pins a known pre-existing bug, not a spec.
  test("known bug: a negative single-predictor slope renders the literal string 'false'", () => {
    expect(getEquation(1, 1, [-2], yMeta, xMeta, "linear")).toContain("false");
  });
});

// ─── buildAlphaSet ────────────────────────────────────────────────────────────

describe("buildAlphaSet", () => {
  test("returns the default levels sorted when userAlpha is a default level", () => {
    expect(buildAlphaSet(0.05)).toEqual([0.01, 0.05, 0.1]);
  });

  test("appends and sorts a non-default userAlpha", () => {
    expect(buildAlphaSet(0.02)).toEqual([0.01, 0.02, 0.05, 0.1]);
  });

  test("does not duplicate a userAlpha equal to a default level", () => {
    expect(buildAlphaSet(0.1).filter((a) => a === 0.1)).toHaveLength(1);
  });
});

// ─── buildAlphaInsight ────────────────────────────────────────────────────────

describe("buildAlphaInsight", () => {
  test("returns null when significant at a stricter-or-equal alpha than the best default", () => {
    expect(buildAlphaInsight(0.001, 0.01, "B1", t, () => null, null)).toBeNull();
  });

  test("returns an insight row when not significant but a looser default alpha would pass", () => {
    const insight = buildAlphaInsight(0.03, 0.01, "B1", t, () => null, null);
    expect(insight).not.toBeNull();
    expect(insight).toHaveProperty("row");
  });

  test("returns a no-standard insight when no default alpha would pass", () => {
    const insight = buildAlphaInsight(0.5, 0.01, "B1", t, () => null, null);
    expect(insight.row.join(" ")).toContain("conclusionAlphaInsightNoStandard");
  });
});

// ─── withFill ─────────────────────────────────────────────────────────────────

describe("withFill", () => {
  test("merges a fill into the base format without mutating the original", () => {
    const base = { font: { bold: true } };
    const stat = { value: 1, color: "#ABCDEF" };
    const fillFor = (s) => (s ? { fill: { color: s.color } } : null);
    const merged = withFill(base, stat, fillFor);
    expect(merged).toEqual({ font: { bold: true }, fill: { color: "#ABCDEF" } });
    expect(base).toEqual({ font: { bold: true } });
  });

  test("returns the base format unchanged when fillFor yields nothing", () => {
    const base = { font: { bold: true } };
    expect(withFill(base, null, () => null)).toBe(base);
  });

  test("returns null base as-is when there is nothing to merge into", () => {
    expect(withFill(null, null, () => null)).toBeNull();
  });
});

// ─── getConclusion ────────────────────────────────────────────────────────────

describe("getConclusion", () => {
  test("uses the single-variable significant key when pValue < alpha", () => {
    const row = getConclusion({ pValue: 0.001, alpha: 0.05, bNumber: 1, yMeta, xMeta, t });
    expect(row.row.join(" ")).toContain("conclusionSignificant");
  });

  test("uses the marginal key when just above alpha", () => {
    const row = getConclusion({ pValue: 0.06, alpha: 0.05, bNumber: 1, yMeta, xMeta, t });
    expect(row.row.join(" ")).toContain("conclusionMarginal");
  });

  test("uses the not-significant key when well above alpha", () => {
    const row = getConclusion({ pValue: 0.5, alpha: 0.05, bNumber: 1, yMeta, xMeta, t });
    expect(row.row.join(" ")).toContain("conclusionNotSignificant");
  });

  test("uses the multiple-variable significant key when slopes is provided", () => {
    const row = getConclusion({
      pValue: 0.001,
      alpha: 0.05,
      slopes: [1, 2],
      yMeta,
      xMeta: [{ name: "Price" }, { name: "Ads" }],
      t,
    });
    expect(row.row.join(" ")).toContain("conclusionMultipleSignificant");
  });
});
