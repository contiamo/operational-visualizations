import { DataFrame } from "@operational/frame";
import { total, maxValue, uniqueValues } from "../stats";

const rawData = {
  columns: [
    {
      name: "Customer.Continent" as "Customer.Continent",
      type: "string",
    },
    {
      name: "Customer.Country" as "Customer.Country",
      type: "string",
    },
    {
      name: "Customer.City" as "Customer.City",
      type: "string",
    },
    {
      name: "Customer.AgeGroup" as "Customer.AgeGroup",
      type: "string",
    },
    {
      name: "Customer.Gender" as "Customer.Gender",
      type: "string",
    },
    {
      name: "sales" as "sales",
      type: "number",
    },
    {
      name: "revenue" as "revenue",
      type: "number",
    },
  ],
  rows: [
    ["Europe", "Germany", "Berlin", "<50", "Female", 101, 10.2],
    ["Europe", "Germany", "Dresden", "<50", "Female", 201, 20.2],
    ["Europe", "Germany", "Hamburg", "<50", "Female", 301, 30.2],
    ["Europe", "UK", "London", "<50", "Female", 401, 40.2],
    ["Europe", "UK", "Edinburgh", "<50", "Female", 501, 50.2],
    ["Europe", "UK", "Dresden", "<50", "Female", 701, 70.2],
    ["North America", "USA", "New York", "<50", "Female", 801, 80.2],
    ["North America", "Canada", "Toronto", "<50", "Female", 901, 90.2],
    ["Europe", "Germany", "Berlin", "<50", "Male", 103, 10.4],
    ["Europe", "Germany", "Dresden", "<50", "Male", 203, 20.4],
    ["Europe", "Germany", "Hamburg", "<50", "Male", 303, 30.4],
    ["Europe", "UK", "London", "<50", "Male", 403, 40.4],
    ["Europe", "UK", "Edinburgh", "<50", "Male", 503, 50.4],
    [null, "UK", "Dresden", "<50", "Male", null, 70.4],
    ["North America", "USA", "New York", "<50", "Male", 803, 80.4],
    ["North America", "Canada", "Toronto", "<50", "Male", 903, 90.4],
    ["Europe", "Germany", "Berlin", ">=50", "Female", 105, 10.6],
    ["Europe", "Germany", "Dresden", ">=50", "Female", 205, 20.6],
    ["Europe", "Germany", "Hamburg", ">=50", "Female", 305, 30.6],
    ["Europe", "UK", "London", ">=50", "Female", 405, 40.6],
    ["Europe", "UK", "Edinburgh", ">=50", "Female", 505, 50.6],
    ["Europe", "UK", "Dresden", ">=50", "Female", 705, 70.6],
    ["North America", "USA", "New York", ">=50", "Female", 805, 80.6],
    ["North America", "Canada", "Toronto", ">=50", "Female", 905, 90.6],
    ["Europe", "Germany", "Berlin", ">=50", "Male", 107, 10.8],
    ["Europe", "Germany", "Dresden", ">=50", "Male", 207, 20.8],
    ["Europe", "Germany", "Hamburg", ">=50", "Male", 307, 30.8],
    ["Europe", "UK", "London", ">=50", "Male", 407, 40.8],
    ["Europe", "UK", "Edinburgh", ">=50", "Male", 507, 50.8],
    ["Europe", "UK", "Dresden", ">=50", "Male", 707, 70.8],
    ["North America", "USA", "New York", ">=50", "Male", 807, 80.8],
    ["North America", "Canada", "Toronto", ">=50", "Male", 907, 90.8],
  ],
};

const frame = new DataFrame(rawData.columns, rawData.rows);
const pivotFrame = frame.pivot({
  rows: ["Customer.Continent", "Customer.Country", "Customer.City"],
  columns: ["Customer.AgeGroup", "Customer.Gender"],
});
const fragment = pivotFrame.row(0);
const group = frame.groupBy(["Customer.Continent", "Customer.Country", "Customer.City"]);
const salesCursor = frame.getCursor("sales");
const continentCursor = frame.getCursor("Customer.Continent");

describe("total()", () => {
  describe("DataFrame", () => {
    it("calculates total for the numeric column", () => {
      expect(total(frame, salesCursor)).toEqual(15025);
    });
    it("does't calculate total for the string column", () => {
      expect(total(frame, continentCursor)).toBe(NaN);
    });
  });
  describe("FragmentFrame", () => {
    it("calculates total for the numeric column", () => {
      expect(total(fragment, salesCursor)).toEqual(416);
    });
    it("does't calculate total for the string column", () => {
      expect(total(fragment, continentCursor)).toBe(NaN);
    });
  });
  describe("GroupFrame", () => {
    it("calculates total for the numeric column", () => {
      expect(total(group, salesCursor)).toEqual(15025);
    });
    it("does't calculate total for the string column", () => {
      expect(total(group, continentCursor)).toBe(NaN);
    });
  });
});

describe("maxValue()", () => {
  describe("DataFrame", () => {
    it("calculates max for the numeric column", () => {
      expect(maxValue(frame, salesCursor)).toEqual(907);
    });
    it("does't calculate max for the string column", () => {
      expect(maxValue(frame, continentCursor)).toBe(NaN);
    });
  });
  describe("FragmentFrame", () => {
    it("calculates max for the numeric column", () => {
      expect(maxValue(fragment, salesCursor)).toEqual(107);
    });
    it("does't calculate max for the string column", () => {
      expect(maxValue(fragment, continentCursor)).toBe(NaN);
    });
  });
  describe("GroupFrame", () => {
    it("calculates max for the numeric column", () => {
      expect(maxValue(group, salesCursor)).toEqual(3616);
    });
    it("does't calculate max for the string column", () => {
      expect(maxValue(group, continentCursor)).toBe(NaN);
    });
  });
});

describe("uniqueValues()", () => {
  describe("DataFrame", () => {
    it("calculates unique value for the numeric column", () => {
      expect(uniqueValues(frame, salesCursor)).toStrictEqual([
        101,
        201,
        301,
        401,
        501,
        701,
        801,
        901,
        103,
        203,
        303,
        403,
        503,
        803,
        903,
        105,
        205,
        305,
        405,
        505,
        705,
        805,
        905,
        107,
        207,
        307,
        407,
        507,
        707,
        807,
        907,
      ]);
    });
    it("calculates unique value for the string column", () => {
      expect(uniqueValues(frame, continentCursor)).toStrictEqual(["Europe", "North America"]);
    });
  });
  describe("FragmentFrame", () => {
    it("calculates unique for the numeric column", () => {
      expect(uniqueValues(fragment, salesCursor)).toStrictEqual([101, 103, 105, 107]);
    });
    it("calculates unique for the string column", () => {
      expect(uniqueValues(fragment, continentCursor)).toStrictEqual(["Europe"]);
    });
  });
  describe("GroupFrame", () => {
    it("calculates unique for the numeric column", () => {
      expect(uniqueValues(frame, salesCursor)).toStrictEqual([
        101,
        201,
        301,
        401,
        501,
        701,
        801,
        901,
        103,
        203,
        303,
        403,
        503,
        803,
        903,
        105,
        205,
        305,
        405,
        505,
        705,
        805,
        905,
        107,
        207,
        307,
        407,
        507,
        707,
        807,
        907,
      ]);
    });
    it("calculates unique for the string column", () => {
      expect(uniqueValues(frame, continentCursor)).toStrictEqual(["Europe", "North America"]);
    });
  });
});
