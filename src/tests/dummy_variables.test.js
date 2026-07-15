import {
  preprocessDummyVariables,
  buildDummyTableRows,
} from "@econometrics/use_cases/dummy_variables";

describe("preprocessDummyVariables", () => {
  const xData = {
    data: [["licență"], ["master"], ["licență"], ["doctorat"]],
    meta: [{ name: "Studii" }],
  };

  test("defaults the reference category to the first alphabetically", () => {
    const result = preprocessDummyVariables(xData);
    expect(result.meta.map((m) => m.reference)).toEqual(["doctorat", "doctorat"]);
  });

  test("generates one dummy column per non-reference category", () => {
    const result = preprocessDummyVariables(xData);
    expect(result.meta.map((m) => m.name)).toEqual(["Studii_licență", "Studii_master"]);
  });

  test("encodes each row as 0/1 against the dummy categories", () => {
    const result = preprocessDummyVariables(xData);
    expect(result.data).toEqual([
      [1, 0], // licență
      [0, 1], // master
      [1, 0], // licență
      [0, 0], // doctorat (reference)
    ]);
  });

  test("respects a user-provided reference category", () => {
    const result = preprocessDummyVariables(xData, { referenceCategories: ["master"] });
    expect(result.meta.map((m) => m.name)).toEqual(["Studii_doctorat", "Studii_licență"]);
    expect(result.data).toEqual([
      [0, 1], // licență
      [0, 0], // master (reference)
      [0, 1], // licență
      [1, 0], // doctorat
    ]);
  });

  test("processes multiple columns independently and concatenates their dummy columns per row", () => {
    const multiColumn = {
      data: [
        ["A", "X"],
        ["B", "Y"],
      ],
      meta: [{ name: "Col1" }, { name: "Col2" }],
    };
    const result = preprocessDummyVariables(multiColumn);
    expect(result.meta.map((m) => m.name)).toEqual(["Col1_B", "Col2_Y"]);
    expect(result.data).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  test("falls back to a D<n> placeholder name when meta is missing", () => {
    const result = preprocessDummyVariables({ data: [["A"], ["B"]] });
    expect(result.meta[0].name).toBe("D1_B");
  });
});

describe("buildDummyTableRows", () => {
  test("prepends a header row built from the meta names and units", () => {
    const dummyData = {
      data: [
        [1, 0],
        [0, 1],
      ],
      meta: [{ name: "Studii_licență", unit: "ani" }, { name: "Studii_master" }],
    };
    const rows = buildDummyTableRows(dummyData);
    expect(rows).toEqual([
      ["Studii_licență <ani>", "Studii_master "],
      [1, 0],
      [0, 1],
    ]);
  });
});
