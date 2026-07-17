import { buildDesignMatrices } from "@math/helpers/morph";

const toNum = (v) => Number(v);

const yData = { data: [[2], [4], [8]], meta: [] };
const xData = {
  data: [
    [1, 3],
    [2, 6],
    [4, 12],
  ],
  meta: [],
};

describe("buildDesignMatrices", () => {
  describe("linear model — no transforms", () => {
    const { Y, X } = buildDesignMatrices(yData, xData, "linear");

    test("Y has correct length", () => {
      expect(Y.length).toBe(3);
    });

    test("Y values are unchanged", () => {
      expect(Y.map((r) => toNum(r[0]))).toEqual([2, 4, 8]);
    });

    test("X prepends intercept column of 1s", () => {
      X.forEach((row) => expect(toNum(row[0])).toBe(1));
    });

    test("X preserves original values after intercept", () => {
      expect(X.map((row) => [toNum(row[1]), toNum(row[2])])).toEqual([
        [1, 3],
        [2, 6],
        [4, 12],
      ]);
    });
  });

  describe("log-linear model — both Y and X log-transformed", () => {
    const { Y, X } = buildDesignMatrices(yData, xData, "log-linear");

    test("Y values are ln-transformed", () => {
      const expected = [2, 4, 8].map(Math.log);
      Y.forEach((r, i) => expect(toNum(r[0])).toBeCloseTo(expected[i], 10));
    });

    test("X values (after intercept) are ln-transformed", () => {
      const expectedRow0 = [1, 3].map(Math.log);
      expect(toNum(X[0][1])).toBeCloseTo(expectedRow0[0], 10);
      expect(toNum(X[0][2])).toBeCloseTo(expectedRow0[1], 10);
    });

    test("X intercept column is still 1", () => {
      X.forEach((row) => expect(toNum(row[0])).toBe(1));
    });
  });

  describe("semi-log model — only Y log-transformed", () => {
    const { Y, X } = buildDesignMatrices(yData, xData, "semi-log");

    test("Y values are ln-transformed", () => {
      const expected = [2, 4, 8].map(Math.log);
      Y.forEach((r, i) => expect(toNum(r[0])).toBeCloseTo(expected[i], 10));
    });

    test("X values are unchanged", () => {
      expect(X.map((row) => [toNum(row[1]), toNum(row[2])])).toEqual([
        [1, 3],
        [2, 6],
        [4, 12],
      ]);
    });
  });

  describe("lin-log model — only X log-transformed", () => {
    const { Y, X } = buildDesignMatrices(yData, xData, "lin-log");

    test("Y values are unchanged", () => {
      expect(Y.map((r) => toNum(r[0]))).toEqual([2, 4, 8]);
    });

    test("X values (after intercept) are ln-transformed", () => {
      const expectedRow1 = [2, 6].map(Math.log);
      expect(toNum(X[1][1])).toBeCloseTo(expectedRow1[0], 10);
      expect(toNum(X[1][2])).toBeCloseTo(expectedRow1[1], 10);
    });
  });

  describe("error handling", () => {
    const negYData = { data: [[-1], [4]], meta: [] };
    const negXData = {
      data: [
        [1, -3],
        [2, 6],
      ],
      meta: [],
    };

    test("throws when Y <= 0 in log-linear", () => {
      expect(() => buildDesignMatrices(negYData, xData, "log-linear")).toThrow(
        /strictly positive values for Y/
      );
    });

    test("throws when Y <= 0 in semi-log", () => {
      expect(() => buildDesignMatrices(negYData, xData, "semi-log")).toThrow(
        /strictly positive values for Y/
      );
    });

    test("throws when X <= 0 in log-linear", () => {
      expect(() => buildDesignMatrices(yData, negXData, "log-linear")).toThrow(
        /strictly positive values for the X variables/
      );
    });

    test("throws when X <= 0 in lin-log", () => {
      expect(() => buildDesignMatrices(yData, negXData, "lin-log")).toThrow(
        /strictly positive values for the X variables/
      );
    });
  });
});
