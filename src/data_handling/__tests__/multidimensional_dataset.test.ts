import { last } from "../../utils/helpers";
import MultidimensionalDataset, { Dataset, Predicate, SliceOptions } from "../multidimensional_dataset";

/**
 * Flattens array by one level
 */
const flatten = (array: any[]) =>
  array.reduce<any[]>((memo, val) => (Array.isArray(val) ? memo.concat(...val) : memo.concat(val)), []);

describe("MultidimensionalDataset", () => {
  const dataset = new MultidimensionalDataset({
    columnDimensions: [
      { key: "Customer.AgeGroup", metadata: {} },
      { key: "Customer.Gender", metadata: {} },
      { key: "measures", metadata: {} },
    ],
    rowDimensions: [
      { key: "Customer.Continent", metadata: {} },
      { key: "Customer.Country", metadata: {} },
      { key: "Customer.City", metadata: {} },
    ],
    rows: [
      ["Europe", "Germany", "Berlin"],
      ["Europe", "Germany", "Dresden"],
      ["Europe", "Germany", "Hamburg"],
      ["Europe", "UK", "London"],
      ["Europe", "UK", "Edinburgh"],
      ["Europe", "Germany", "Hamburg"], // This duplicate is here on purpose :)
      ["Europe", "UK", "Dresden"], // This geographical mistake is here on purpose :)
      ["North America", "USA", "New York"],
      ["North America", "Canada", "Toronto"],
    ],
    columns: [
      ["<50", "Female", "sales"],
      ["<50", "Female", "revenue"],
      ["<50", "Male", "sales"],
      ["<50", "Male", "revenue"],
      [">=50", "Female", "sales"],
      [">=50", "Female", "revenue"],
      [">=50", "Male", "sales"],
      [">=50", "Male", "revenue"],
    ],
    data: [
      [101, 102, 103, 104, 105, 106, 107, 108],
      [201, 202, 203, 204, 205, 206, 207, 208],
      [301, 302, 303, 304, 305, 306, 307, 308],
      [401, 402, 403, 404, 405, 406, 407, 408],
      [501, 502, 503, 504, 505, 506, 507, 508],
      [601, 602, 603, 604, 605, 606, 607, 608],
      [701, 702, 703, 704, 705, 706, 707, 708],
      [801, 802, 803, 804, 805, 806, 807, 808],
      [901, 902, 903, 904, 905, 906, 907, 908],
    ],
  });

  describe("validates raw dataset", () => {
    const invalidDataTestCases = [
      {
        case: "Columns but no columnDimensions",
        dataset: {
          columnDimensions: [],
          rowDimensions: [],
          columns: [["hello"]],
          rows: [],
          data: [],
        },
        expected:
          "Invalid raw dataset: number of values in any column of `columns` may not be different from number of `columnDimensions`",
      },
      {
        case: "Different number of columns and columnDimensions",
        dataset: {
          columnDimensions: [{ key: "Greeting" }],
          rowDimensions: [],
          columns: [["hello", "world"]],
          rows: [],
          data: [],
        },
        expected:
          "Invalid raw dataset: number of values in any column of `columns` may not be different from number of `columnDimensions`",
      },
      {
        case: "Rows but no rowDimensions",
        dataset: {
          columnDimensions: [],
          rowDimensions: [],
          columns: [],
          rows: [["eggplant"]],
          data: [],
        },
        expected:
          "Invalid raw dataset: number of values in any row of `rows` may not be different from number of `rowDimensions`",
      },
      {
        case: "Different number of rows and rowDimensions",
        dataset: {
          columnDimensions: [],
          rowDimensions: [{ key: "Vegetable" }],
          columns: [],
          rows: [["eggplant", "zucchini"]],
          data: [],
        },
        expected:
          "Invalid raw dataset: number of values in any row of `rows` may not be different from number of `rowDimensions`",
      },
      {
        case: "Rows and columns but no data",
        dataset: {
          columnDimensions: [{ key: "Greeting" }],
          rowDimensions: [{ key: "Vegetable" }],
          columns: [["hello"]],
          rows: [["eggplant"]],
          data: [],
        },
        expected: "Invalid raw dataset: `data` may not be empty if both `rows` and `columns` are not empty",
      },
      {
        case: "Too many rows in data",
        dataset: {
          columnDimensions: [{ key: "Greeting" }],
          rowDimensions: [{ key: "Vegetable" }],
          columns: [["hello"]],
          rows: [["eggplant"]],
          data: [[101], [201]],
        },
        expected: "Invalid raw dataset: number of rows in `data` may not be different from number of `rows`",
      },
      {
        case: "Too many columns in data",
        dataset: {
          columnDimensions: [{ key: "Greeting" }],
          rowDimensions: [{ key: "Vegetable" }],
          columns: [["hello"]],
          rows: [["eggplant"]],
          data: [[101, 102]],
        },
        expected: "Invalid raw dataset: number of columns in `data` may not be different from number of `columns`",
      },
    ];

    invalidDataTestCases.forEach(testCase => {
      it(testCase.case, () => {
        expect(() => new MultidimensionalDataset(testCase.dataset)).toThrowError(testCase.expected);
      });
    });
  });

  describe("#columns", () => {
    const columns = dataset.columns();

    it("returns the right number of columns", () => {
      expect(columns.length).toBe(8);
    });

    describe("column", () => {
      const column = columns[3];

      it("#x returns the column dimensions and their values for a column", () => {
        expect(column.dimensionValues()).toEqual([
          { key: "Customer.AgeGroup", metadata: {}, value: "<50" },
          { key: "Customer.Gender", metadata: {}, value: "Male" },
          { key: "measures", metadata: {}, value: "revenue" },
        ]);
      });

      describe("#matches", () => {
        const columnMatchCases = [
          {
            case: "matches the correct age group",
            predicates: [{ key: "Customer.AgeGroup", type: "include", values: ["<50"] }],
            expected: true,
          },
          {
            case: "matches the correct gender",
            predicates: [{ key: "Customer.Gender", type: "include", values: ["Male"] }],
            expected: true,
          },
          {
            case: "matches the correct measure",
            predicates: [{ key: "measures", type: "include", values: ["revenue"] }],
            expected: true,
          },
          {
            case: "doesn't match an incorrect age group",
            predicates: [{ key: "Customer.AgeGroup", type: "include", values: [">=50"] }],
            expected: false,
          },
          {
            case: "doesn't match an incorrect gender",
            predicates: [{ key: "Customer.Gender", type: "include", values: ["Female"] }],
            expected: false,
          },
          {
            case: "doesn't match an incorrect measure",
            predicates: [{ key: "measures", type: "include", values: ["measures"] }],
            expected: false,
          },
        ];

        columnMatchCases.forEach(matchCase => {
          it(matchCase.case, () => {
            expect(column.matches(matchCase.predicates as Predicate[])).toBe(matchCase.expected);
          });
        });
      });

      describe("#cells", () => {
        const cells = column.cells();

        it("returns the right number of cells", () => {
          expect(cells.length).toBe(9);
        });

        it("returns the right cells", () => {
          expect(cells.map(c => c.value())).toEqual([104, 204, 304, 404, 504, 604, 704, 804, 904]);
        });

        describe("cell", () => {
          const cell = cells[1];

          it("#x returns the column dimensions and their values for a cell", () => {
            expect(cell.x()).toEqual([
              { key: "Customer.AgeGroup", metadata: {}, value: "<50" },
              { key: "Customer.Gender", metadata: {}, value: "Male" },
              { key: "measures", metadata: {}, value: "revenue" },
            ]);
          });

          it("#y returns the row dimensions and their values for a cell", () => {
            expect(cell.y()).toEqual([
              { key: "Customer.Continent", metadata: {}, value: "Europe" },
              { key: "Customer.Country", metadata: {}, value: "Germany" },
              { key: "Customer.City", metadata: {}, value: "Dresden" },
            ]);
          });

          it("#value returns the cell value", () => {
            expect(cell.value()).toBe(204);
          });

          describe("#matches", () => {
            const cellMatchCases = [
              {
                case: "matches the full, exact cell dimension values",
                options: {
                  x: [
                    { key: "Customer.AgeGroup", type: "include", values: ["<50"] },
                    { key: "Customer.Gender", type: "include", values: ["Male"] },
                    { key: "measures", type: "include", values: ["revenue"] },
                  ],
                  y: [
                    { key: "Customer.Continent", type: "include", values: ["Europe"] },
                    { key: "Customer.Country", type: "include", values: ["Germany"] },
                    { key: "Customer.City", type: "include", values: ["Dresden"] },
                  ],
                },
                expected: true,
              },
              {
                case: "matches partial cell dimension values",
                options: {
                  x: [
                    { key: "Customer.Gender", type: "include", values: ["Male"] },
                    { key: "measures", type: "include", values: ["revenue"] },
                  ],
                  y: [
                    { key: "Customer.Continent", type: "include", values: ["Europe"] },
                    { key: "Customer.Country", type: "include", values: ["Germany"] },
                  ],
                },
                expected: true,
              },
              {
                case: "matches multiple cell dimension values",
                options: {
                  x: [{ key: "Customer.Gender", type: "include", values: ["Male", "Female"] }],
                  y: [{ key: "Customer.Continent", type: "include", values: ["Europe", "North America"] }],
                },
                expected: true,
              },
              {
                case: "matches only column dimension values",
                options: {
                  x: [{ key: "Customer.Gender", type: "include", values: ["Male"] }],
                },
                expected: true,
              },
              {
                case: "matches only row dimension values",
                options: {
                  y: [{ key: "Customer.City", type: "include", values: ["Dresden"] }],
                },
                expected: true,
              },
              {
                case: "matches empty options",
                options: {
                  x: [],
                  y: [],
                },
                expected: true,
              },
              {
                case: "matches with exclude predicates",
                options: {
                  x: [{ key: "Customer.Gender", type: "exclude", values: ["Female"] }],
                  y: [{ key: "Customer.Country", type: "exclude", values: ["Canada"] }],
                },
                expected: true,
              },
              {
                case: "doesn't match if any predicates wrong",
                options: {
                  x: [
                    { key: "Customer.AgeGroup", type: "include", values: ["<50"] },
                    { key: "Customer.Gender", type: "include", values: ["Female"] },
                    { key: "measures", type: "include", values: ["revenue"] },
                  ],
                  y: [
                    { key: "Customer.Continent", type: "include", values: ["North America"] },
                    { key: "Customer.Country", type: "include", values: ["Germany"] },
                    { key: "Customer.City", type: "include", values: ["Dresden"] },
                  ],
                },
                expected: false,
              },
            ];

            cellMatchCases.forEach(matchCase => {
              it(matchCase.case, () => {
                expect(cell.matches(matchCase.options as SliceOptions)).toBe(matchCase.expected);
              });
            });
          });
        });
      });
    });
  });

  describe("#rows", () => {
    const rows = dataset.rows();

    it("returns the right number of rows", () => {
      expect(rows.length).toBe(9);
    });

    describe("row", () => {
      const row = rows[3];

      it("#y returns the row dimensions and their values for a row", () => {
        expect(row.dimensionValues()).toEqual([
          { key: "Customer.Continent", metadata: {}, value: "Europe" },
          { key: "Customer.Country", metadata: {}, value: "UK" },
          { key: "Customer.City", metadata: {}, value: "London" },
        ]);
      });

      describe("#matches", () => {
        const rowMatchCases = [
          {
            case: "matches the correct continent",
            predicates: [{ key: "Customer.Continent", type: "include", values: ["Europe"] }],
            expected: true,
          },
          {
            case: "matches the correct country",
            predicates: [{ key: "Customer.Country", type: "include", values: ["UK"] }],
            expected: true,
          },
          {
            case: "matches the correct city",
            predicates: [{ key: "Customer.City", type: "include", values: ["London"] }],
            expected: true,
          },
          {
            case: "doesn't match an incorrect continent",
            predicates: [{ key: "Customer.Continent", type: "include", values: ["North America"] }],
            expected: false,
          },
          {
            case: "doesn't match an incorrect country",
            predicates: [{ key: "Customer.Country", type: "include", values: ["Germany"] }],
            expected: false,
          },
          {
            case: "doesn't match an incorrect city",
            predicates: [{ key: "Customer.City", type: "include", values: ["Berlin"] }],
            expected: false,
          },
        ];

        rowMatchCases.forEach(matchCase => {
          it(matchCase.case, () => {
            expect(row.matches(matchCase.predicates as Predicate[])).toBe(matchCase.expected);
          });
        });
      });

      describe("#cells", () => {
        const cells = row.cells();

        it("returns the right number of cells", () => {
          expect(cells.length).toBe(8);
        });

        it("returns the right cells", () => {
          expect(cells.map(c => c.value())).toEqual([401, 402, 403, 404, 405, 406, 407, 408]);
        });

        describe("cell", () => {
          const cell = cells[1];

          it("#y returns the row dimensions and their values for a cell", () => {
            expect(cell.y()).toEqual([
              { key: "Customer.Continent", metadata: {}, value: "Europe" },
              { key: "Customer.Country", metadata: {}, value: "UK" },
              { key: "Customer.City", metadata: {}, value: "London" },
            ]);
          });

          it("#x returns the row dimensions and their values for a cell", () => {
            expect(cell.x()).toEqual([
              { key: "Customer.AgeGroup", metadata: {}, value: "<50" },
              { key: "Customer.Gender", metadata: {}, value: "Female" },
              { key: "measures", metadata: {}, value: "revenue" },
            ]);
          });

          it("#value returns the cell value", () => {
            expect(cell.value()).toBe(402);
          });

          describe("#matches", () => {
            const cellMatchCases = [
              {
                case: "matches the full, exact cell dimension values",
                options: {
                  x: [
                    { key: "Customer.AgeGroup", type: "include", values: ["<50"] },
                    { key: "Customer.Gender", type: "include", values: ["Female"] },
                    { key: "measures", type: "include", values: ["revenue"] },
                  ],
                  y: [
                    { key: "Customer.Continent", type: "include", values: ["Europe"] },
                    { key: "Customer.Country", type: "include", values: ["UK"] },
                    { key: "Customer.City", type: "include", values: ["London"] },
                  ],
                },
                expected: true,
              },
              {
                case: "matches partial cell dimension values",
                options: {
                  x: [
                    { key: "Customer.Gender", type: "include", values: ["Female"] },
                    { key: "measures", type: "include", values: ["revenue"] },
                  ],
                  y: [
                    { key: "Customer.Continent", type: "include", values: ["Europe"] },
                    { key: "Customer.Country", type: "include", values: ["UK"] },
                  ],
                },
                expected: true,
              },
              {
                case: "matches multiple cell dimension values",
                options: {
                  x: [{ key: "Customer.Gender", type: "include", values: ["Male", "Female"] }],
                  y: [{ key: "Customer.Continent", type: "include", values: ["Europe", "North America"] }],
                },
                expected: true,
              },
              {
                case: "matches only column dimension values",
                options: {
                  x: [{ key: "Customer.Gender", type: "include", values: ["Female"] }],
                },
                expected: true,
              },
              {
                case: "matches only row dimension values",
                options: {
                  y: [{ key: "Customer.City", type: "include", values: ["London"] }],
                },
                expected: true,
              },
              {
                case: "matches empty options",
                options: {
                  x: [],
                  y: [],
                },
                expected: true,
              },
              {
                case: "matches with exclude predicates",
                options: {
                  x: [{ key: "Customer.Gender", type: "exclude", values: ["Male"] }],
                  y: [{ key: "Customer.Country", type: "exclude", values: ["Canada"] }],
                },
                expected: true,
              },
              {
                case: "doesn't match if any predicates wrong",
                options: {
                  x: [
                    { key: "Customer.AgeGroup", type: "include", values: [">=50"] },
                    { key: "Customer.Gender", type: "include", values: ["Female"] },
                    { key: "measures", type: "include", values: ["revenue"] },
                  ],
                  y: [
                    { key: "Customer.Continent", type: "include", values: ["Europe"] },
                    { key: "Customer.Country", type: "include", values: ["Germany"] },
                    { key: "Customer.City", type: "include", values: ["London"] },
                  ],
                },
                expected: false,
              },
            ];

            cellMatchCases.forEach(matchCase => {
              it(matchCase.case, () => {
                expect(cell.matches(matchCase.options as SliceOptions)).toBe(matchCase.expected);
              });
            });
          });
        });
      });
    });
  });

  describe("#slice returns a new data set that is a slice of the source", () => {
    it("does not accept invalid y predicates", () => {
      expect(() => {
        dataset.slice({ y: [{ key: "Customer.Invalid", type: "include", values: ["UK"] }] });
      }).toThrowError("Y dimension 'Customer.Invalid' does not exist in the rowDimensions.");
    });

    it("does not accept invalid x predicates", () => {
      expect(() => {
        dataset.slice({ x: [{ key: "Customer.Invalid", type: "include", values: ["<50"] }] });
      }).toThrowError("X dimension 'Customer.Invalid' does not exist in the columnDimensions.");
    });

    const sliceTestCases = [
      {
        case: "only x is specified and it only 'includes' an invalid dimension value",
        dataset,
        slice: { x: [{ key: "Customer.Gender", type: "include", values: ["INVALID"] }] } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [
            ["Europe", "Germany", "Berlin"],
            ["Europe", "Germany", "Dresden"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "UK", "London"],
            ["Europe", "UK", "Edinburgh"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "UK", "Dresden"],
            ["North America", "USA", "New York"],
            ["North America", "Canada", "Toronto"],
          ],
          columns: [],
          data: [],
        },
      },
      {
        case: "only x is specified and it 'includes' a dimension value",
        dataset,
        slice: { x: [{ key: "Customer.Gender", type: "include", values: ["Female"] }] } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [
            ["Europe", "Germany", "Berlin"],
            ["Europe", "Germany", "Dresden"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "UK", "London"],
            ["Europe", "UK", "Edinburgh"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "UK", "Dresden"],
            ["North America", "USA", "New York"],
            ["North America", "Canada", "Toronto"],
          ],
          columns: [
            ["<50", "Female", "sales"],
            ["<50", "Female", "revenue"],
            [">=50", "Female", "sales"],
            [">=50", "Female", "revenue"],
          ],
          data: [
            [101, 102, 105, 106],
            [201, 202, 205, 206],
            [301, 302, 305, 306],
            [401, 402, 405, 406],
            [501, 502, 505, 506],
            [601, 602, 605, 606],
            [701, 702, 705, 706],
            [801, 802, 805, 806],
            [901, 902, 905, 906],
          ],
        },
      },
      {
        case: "only x is specified and it 'excludes' a dimension value",
        dataset,
        slice: { x: [{ key: "Customer.Gender", type: "exclude", values: ["Female"] }] } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [
            ["Europe", "Germany", "Berlin"],
            ["Europe", "Germany", "Dresden"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "UK", "London"],
            ["Europe", "UK", "Edinburgh"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "UK", "Dresden"],
            ["North America", "USA", "New York"],
            ["North America", "Canada", "Toronto"],
          ],
          columns: [
            ["<50", "Male", "sales"],
            ["<50", "Male", "revenue"],
            [">=50", "Male", "sales"],
            [">=50", "Male", "revenue"],
          ],
          data: [
            [103, 104, 107, 108],
            [203, 204, 207, 208],
            [303, 304, 307, 308],
            [403, 404, 407, 408],
            [503, 504, 507, 508],
            [603, 604, 607, 608],
            [703, 704, 707, 708],
            [803, 804, 807, 808],
            [903, 904, 907, 908],
          ],
        },
      },
      {
        case: "only x is specified and it includes and excludes multiple dimensions' values",
        dataset,
        slice: {
          x: [
            { key: "Customer.Gender", type: "exclude", values: ["Female"] },
            { key: "Customer.AgeGroup", type: "include", values: [">=50"] },
          ],
        } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [
            ["Europe", "Germany", "Berlin"],
            ["Europe", "Germany", "Dresden"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "UK", "London"],
            ["Europe", "UK", "Edinburgh"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "UK", "Dresden"],
            ["North America", "USA", "New York"],
            ["North America", "Canada", "Toronto"],
          ],
          columns: [[">=50", "Male", "sales"], [">=50", "Male", "revenue"]],
          data: [
            [107, 108],
            [207, 208],
            [307, 308],
            [407, 408],
            [507, 508],
            [607, 608],
            [707, 708],
            [807, 808],
            [907, 908],
          ],
        },
      },
      {
        case: "only y is specified and it only 'includes' an invalid dimension value",
        dataset,
        slice: { y: [{ key: "Customer.Country", type: "include", values: ["INVALID"] }] } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [],
          columns: [
            ["<50", "Female", "sales"],
            ["<50", "Female", "revenue"],
            ["<50", "Male", "sales"],
            ["<50", "Male", "revenue"],
            [">=50", "Female", "sales"],
            [">=50", "Female", "revenue"],
            [">=50", "Male", "sales"],
            [">=50", "Male", "revenue"],
          ],
          data: [],
        },
      },
      {
        case: "only y is specified and it 'includes' a dimension value",
        dataset,
        slice: { y: [{ key: "Customer.Country", type: "include", values: ["UK"] }] } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [["Europe", "UK", "London"], ["Europe", "UK", "Edinburgh"], ["Europe", "UK", "Dresden"]],
          columns: [
            ["<50", "Female", "sales"],
            ["<50", "Female", "revenue"],
            ["<50", "Male", "sales"],
            ["<50", "Male", "revenue"],
            [">=50", "Female", "sales"],
            [">=50", "Female", "revenue"],
            [">=50", "Male", "sales"],
            [">=50", "Male", "revenue"],
          ],
          data: [
            [401, 402, 403, 404, 405, 406, 407, 408],
            [501, 502, 503, 504, 505, 506, 507, 508],
            [701, 702, 703, 704, 705, 706, 707, 708],
          ],
        },
      },
      {
        case: "only y is specified and it 'excludes' a dimension value",
        dataset,
        slice: { y: [{ key: "Customer.Country", type: "exclude", values: ["UK"] }] } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [
            ["Europe", "Germany", "Berlin"],
            ["Europe", "Germany", "Dresden"],
            ["Europe", "Germany", "Hamburg"],
            ["Europe", "Germany", "Hamburg"],
            ["North America", "USA", "New York"],
            ["North America", "Canada", "Toronto"],
          ],
          columns: [
            ["<50", "Female", "sales"],
            ["<50", "Female", "revenue"],
            ["<50", "Male", "sales"],
            ["<50", "Male", "revenue"],
            [">=50", "Female", "sales"],
            [">=50", "Female", "revenue"],
            [">=50", "Male", "sales"],
            [">=50", "Male", "revenue"],
          ],
          data: [
            [101, 102, 103, 104, 105, 106, 107, 108],
            [201, 202, 203, 204, 205, 206, 207, 208],
            [301, 302, 303, 304, 305, 306, 307, 308],
            [601, 602, 603, 604, 605, 606, 607, 608],
            [801, 802, 803, 804, 805, 806, 807, 808],
            [901, 902, 903, 904, 905, 906, 907, 908],
          ],
        },
      },
      {
        case: "only y is specified and it includes and excludes multiple dimensions' values",
        dataset,
        slice: {
          y: [
            { key: "Customer.Country", type: "exclude", values: ["UK"] },
            { key: "Customer.City", type: "include", values: ["Dresden"] },
          ],
        } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [["Europe", "Germany", "Dresden"]],
          columns: [
            ["<50", "Female", "sales"],
            ["<50", "Female", "revenue"],
            ["<50", "Male", "sales"],
            ["<50", "Male", "revenue"],
            [">=50", "Female", "sales"],
            [">=50", "Female", "revenue"],
            [">=50", "Male", "sales"],
            [">=50", "Male", "revenue"],
          ],
          data: [[201, 202, 203, 204, 205, 206, 207, 208]],
        },
      },
      {
        case: "x and y are specified and both only contain invalid values",
        dataset,
        slice: {
          x: [{ key: "Customer.Gender", type: "include", values: ["INVALID"] }],
          y: [{ key: "Customer.Country", type: "include", values: ["INVALID"] }],
        } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [],
          columns: [],
          data: [],
        },
      },
      {
        case: "x and y are specified",
        dataset,
        slice: {
          x: [{ key: "Customer.Gender", type: "include", values: ["Female"] }],
          y: [{ key: "Customer.Country", type: "include", values: ["UK"] }],
        } as SliceOptions,
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [
            { key: "Customer.Continent", metadata: {} },
            { key: "Customer.Country", metadata: {} },
            { key: "Customer.City", metadata: {} },
          ],
          rows: [["Europe", "UK", "London"], ["Europe", "UK", "Edinburgh"], ["Europe", "UK", "Dresden"]],
          columns: [
            ["<50", "Female", "sales"],
            ["<50", "Female", "revenue"],
            [">=50", "Female", "sales"],
            [">=50", "Female", "revenue"],
          ],
          data: [[401, 402, 405, 406], [501, 502, 505, 506], [701, 702, 705, 706]],
        },
      },
    ];

    sliceTestCases.forEach(testCase => {
      it(testCase.case, () => {
        expect(testCase.dataset.slice(testCase.slice).serialize()).toEqual(testCase.expected);
      });
    });
  });

  describe("#aggregate", () => {
    const aggregateTestCases = [
      {
        case: "x and y specified, aggregating over y",
        dataset,
        aggregate: {
          x: "measures",
          y: "Customer.Country",
          merge: (data: Dataset<number>) => ({
            data: data.rows().map(row => {
              const city = row
                .dimensionValues()
                .filter(y => y.key === "Customer.City")
                .map(d => d.value);
              return flatten([city, row.cells().map(cell => cell.value())]);
            }),
          }),
        },
        expected: {
          columnDimensions: [
            { key: "Customer.AgeGroup", metadata: {} },
            { key: "Customer.Gender", metadata: {} },
            { key: "measures", metadata: {} },
          ],
          rowDimensions: [{ key: "Customer.Continent", metadata: {} }, { key: "Customer.Country", metadata: {} }],
          columns: [
            ["<50", "Female", "sales"],
            ["<50", "Female", "revenue"],
            ["<50", "Male", "sales"],
            ["<50", "Male", "revenue"],
            [">=50", "Female", "sales"],
            [">=50", "Female", "revenue"],
            [">=50", "Male", "sales"],
            [">=50", "Male", "revenue"],
          ],
          rows: [["Europe", "Germany"], ["Europe", "UK"], ["North America", "USA"], ["North America", "Canada"]],
          data: [
            [
              { data: [["Berlin", 101], ["Dresden", 201], ["Hamburg", 301], ["Hamburg", 601]] },
              { data: [["Berlin", 102], ["Dresden", 202], ["Hamburg", 302], ["Hamburg", 602]] },
              { data: [["Berlin", 103], ["Dresden", 203], ["Hamburg", 303], ["Hamburg", 603]] },
              { data: [["Berlin", 104], ["Dresden", 204], ["Hamburg", 304], ["Hamburg", 604]] },
              { data: [["Berlin", 105], ["Dresden", 205], ["Hamburg", 305], ["Hamburg", 605]] },
              { data: [["Berlin", 106], ["Dresden", 206], ["Hamburg", 306], ["Hamburg", 606]] },
              { data: [["Berlin", 107], ["Dresden", 207], ["Hamburg", 307], ["Hamburg", 607]] },
              { data: [["Berlin", 108], ["Dresden", 208], ["Hamburg", 308], ["Hamburg", 608]] },
            ],
            [
              { data: [["London", 401], ["Edinburgh", 501], ["Dresden", 701]] },
              { data: [["London", 402], ["Edinburgh", 502], ["Dresden", 702]] },
              { data: [["London", 403], ["Edinburgh", 503], ["Dresden", 703]] },
              { data: [["London", 404], ["Edinburgh", 504], ["Dresden", 704]] },
              { data: [["London", 405], ["Edinburgh", 505], ["Dresden", 705]] },
              { data: [["London", 406], ["Edinburgh", 506], ["Dresden", 706]] },
              { data: [["London", 407], ["Edinburgh", 507], ["Dresden", 707]] },
              { data: [["London", 408], ["Edinburgh", 508], ["Dresden", 708]] },
            ],
            [
              { data: [["New York", 801]] },
              { data: [["New York", 802]] },
              { data: [["New York", 803]] },
              { data: [["New York", 804]] },
              { data: [["New York", 805]] },
              { data: [["New York", 806]] },
              { data: [["New York", 807]] },
              { data: [["New York", 808]] },
            ],
            [
              { data: [["Toronto", 901]] },
              { data: [["Toronto", 902]] },
              { data: [["Toronto", 903]] },
              { data: [["Toronto", 904]] },
              { data: [["Toronto", 905]] },
              { data: [["Toronto", 906]] },
              { data: [["Toronto", 907]] },
              { data: [["Toronto", 908]] },
            ],
          ],
        },
      },
      {
        case: "only x specified",
        dataset,
        aggregate: {
          x: "Customer.Gender",
          merge: (data: Dataset<number>) => ({
            measures: data.columns().map(col => ({
              key: last(col.dimensionValues()).value,
              value: col.cells().reduce((memo, cell) => memo + cell.value(), 0),
            })),
          }),
        },
        expected: {
          columnDimensions: [{ key: "Customer.AgeGroup", metadata: {} }, { key: "Customer.Gender", metadata: {} }],
          rowDimensions: [],
          columns: [["<50", "Female"], ["<50", "Male"], [">=50", "Female"], [">=50", "Male"]],
          rows: [[]],
          data: [
            [
              { measures: [{ key: "sales", value: 4509 }, { key: "revenue", value: 4518 }] },
              { measures: [{ key: "sales", value: 4527 }, { key: "revenue", value: 4536 }] },
              { measures: [{ key: "sales", value: 4545 }, { key: "revenue", value: 4554 }] },
              { measures: [{ key: "sales", value: 4563 }, { key: "revenue", value: 4572 }] },
            ],
          ],
        },
      },
      {
        case: "only y specified",
        dataset,
        aggregate: {
          y: "Customer.Continent",
          merge: (data: Dataset<number>) => ({
            key: data.rows()[0].dimensionValues()[0].value,
            data: data.columns().map(col => ({
              ageGroup: col.dimensionValues()[0].value,
              gender: col.dimensionValues()[1].value,
              measure: col.dimensionValues()[2].value,
              value: col.cells().reduce((memo, cell) => memo + cell.value(), 0),
            })),
          }),
        },
        expected: {
          columnDimensions: [],
          rowDimensions: [{ key: "Customer.Continent", metadata: {} }],
          columns: [[]],
          rows: [["Europe"], ["North America"]],
          data: [
            [
              {
                key: "Europe",
                data: [
                  { ageGroup: "<50", gender: "Female", measure: "sales", value: 2807 },
                  { ageGroup: "<50", gender: "Female", measure: "revenue", value: 2814 },
                  { ageGroup: "<50", gender: "Male", measure: "sales", value: 2821 },
                  { ageGroup: "<50", gender: "Male", measure: "revenue", value: 2828 },
                  { ageGroup: ">=50", gender: "Female", measure: "sales", value: 2835 },
                  { ageGroup: ">=50", gender: "Female", measure: "revenue", value: 2842 },
                  { ageGroup: ">=50", gender: "Male", measure: "sales", value: 2849 },
                  { ageGroup: ">=50", gender: "Male", measure: "revenue", value: 2856 },
                ],
              },
            ],
            [
              {
                key: "North America",
                data: [
                  { ageGroup: "<50", gender: "Female", measure: "sales", value: 1702 },
                  { ageGroup: "<50", gender: "Female", measure: "revenue", value: 1704 },
                  { ageGroup: "<50", gender: "Male", measure: "sales", value: 1706 },
                  { ageGroup: "<50", gender: "Male", measure: "revenue", value: 1708 },
                  { ageGroup: ">=50", gender: "Female", measure: "sales", value: 1710 },
                  { ageGroup: ">=50", gender: "Female", measure: "revenue", value: 1712 },
                  { ageGroup: ">=50", gender: "Male", measure: "sales", value: 1714 },
                  { ageGroup: ">=50", gender: "Male", measure: "revenue", value: 1716 },
                ],
              },
            ],
          ],
        },
      },
    ];

    aggregateTestCases.forEach(testCase => {
      it(testCase.case, () => {
        expect(testCase.dataset.aggregate<any>(testCase.aggregate).serialize()).toEqual(testCase.expected);
      });
    });
  });

  describe("#transpose", () => {
    it("returns a transposed dataset", () => {
      expect(dataset.transpose().serialize()).toEqual({
        columnDimensions: [
          { key: "Customer.Continent", metadata: {} },
          { key: "Customer.Country", metadata: {} },
          { key: "Customer.City", metadata: {} },
        ],
        rowDimensions: [
          { key: "Customer.AgeGroup", metadata: {} },
          { key: "Customer.Gender", metadata: {} },
          { key: "measures", metadata: {} },
        ],
        rows: [
          ["<50", "Female", "sales"],
          ["<50", "Female", "revenue"],
          ["<50", "Male", "sales"],
          ["<50", "Male", "revenue"],
          [">=50", "Female", "sales"],
          [">=50", "Female", "revenue"],
          [">=50", "Male", "sales"],
          [">=50", "Male", "revenue"],
        ],
        columns: [
          ["Europe", "Germany", "Berlin"],
          ["Europe", "Germany", "Dresden"],
          ["Europe", "Germany", "Hamburg"],
          ["Europe", "UK", "London"],
          ["Europe", "UK", "Edinburgh"],
          ["Europe", "Germany", "Hamburg"],
          ["Europe", "UK", "Dresden"],
          ["North America", "USA", "New York"],
          ["North America", "Canada", "Toronto"],
        ],
        data: [
          [101, 201, 301, 401, 501, 601, 701, 801, 901],
          [102, 202, 302, 402, 502, 602, 702, 802, 902],
          [103, 203, 303, 403, 503, 603, 703, 803, 903],
          [104, 204, 304, 404, 504, 604, 704, 804, 904],
          [105, 205, 305, 405, 505, 605, 705, 805, 905],
          [106, 206, 306, 406, 506, 606, 706, 806, 906],
          [107, 207, 307, 407, 507, 607, 707, 807, 907],
          [108, 208, 308, 408, 508, 608, 708, 808, 908],
        ],
      });
    });
  });

  describe("#transform", () => {
    const expected = {
      columnDimensions: [
        { key: "Customer.AgeGroup", metadata: {} },
        { key: "Customer.Gender", metadata: {} },
        { key: "measures", metadata: {} },
      ],
      rowDimensions: [
        { key: "Customer.Continent", metadata: {} },
        { key: "Customer.Country", metadata: {} },
        { key: "Customer.City", metadata: {} },
      ],
      rows: [
        ["Europe", "Germany", "Berlin"],
        ["Europe", "Germany", "Dresden"],
        ["Europe", "Germany", "Hamburg"],
        ["Europe", "UK", "London"],
        ["Europe", "UK", "Edinburgh"],
        ["Europe", "Germany", "Hamburg"], // This duplicate is here on purpose :)
        ["Europe", "UK", "Dresden"], // This geographical mistake is here on purpose :)
        ["North America", "USA", "New York"],
        ["North America", "Canada", "Toronto"],
      ],
      columns: [
        ["<50", "Female", "sales"],
        ["<50", "Female", "revenue"],
        ["<50", "Male", "sales"],
        ["<50", "Male", "revenue"],
        [">=50", "Female", "sales"],
        [">=50", "Female", "revenue"],
        [">=50", "Male", "sales"],
        [">=50", "Male", "revenue"],
      ],
      data: [
        [
          { value: 101, color: "#ff0000" },
          { value: 102, color: "#ff0000" },
          { value: 103, color: "#ff0000" },
          { value: 104, color: "#ff0000" },
          { value: 105, color: "#ff0000" },
          { value: 106, color: "#ff0000" },
          { value: 107, color: "#ff0000" },
          { value: 108, color: "#ff0000" },
        ],
        [
          { value: 201, color: "#ff0000" },
          { value: 202, color: "#ff0000" },
          { value: 203, color: "#ff0000" },
          { value: 204, color: "#ff0000" },
          { value: 205, color: "#ff0000" },
          { value: 206, color: "#ff0000" },
          { value: 207, color: "#ff0000" },
          { value: 208, color: "#ff0000" },
        ],
        [
          { value: 301, color: "#ff0000" },
          { value: 302, color: "#ff0000" },
          { value: 303, color: "#ff0000" },
          { value: 304, color: "#ff0000" },
          { value: 305, color: "#ff0000" },
          { value: 306, color: "#ff0000" },
          { value: 307, color: "#ff0000" },
          { value: 308, color: "#ff0000" },
        ],
        [
          { value: 401, color: "#ff0000" },
          { value: 402, color: "#ff0000" },
          { value: 403, color: "#ff0000" },
          { value: 404, color: "#ff0000" },
          { value: 405, color: "#ff0000" },
          { value: 406, color: "#ff0000" },
          { value: 407, color: "#ff0000" },
          { value: 408, color: "#ff0000" },
        ],
        [
          { value: 501, color: "#ff0000" },
          { value: 502, color: "#ff0000" },
          { value: 503, color: "#ff0000" },
          { value: 504, color: "#ff0000" },
          { value: 505, color: "#ff0000" },
          { value: 506, color: "#ff0000" },
          { value: 507, color: "#ff0000" },
          { value: 508, color: "#ff0000" },
        ],
        [
          { value: 601, color: "#ff0000" },
          { value: 602, color: "#ff0000" },
          { value: 603, color: "#ff0000" },
          { value: 604, color: "#ff0000" },
          { value: 605, color: "#ff0000" },
          { value: 606, color: "#ff0000" },
          { value: 607, color: "#ff0000" },
          { value: 608, color: "#ff0000" },
        ],
        [
          { value: 701, color: "#ff0000" },
          { value: 702, color: "#ff0000" },
          { value: 703, color: "#ff0000" },
          { value: 704, color: "#ff0000" },
          { value: 705, color: "#ff0000" },
          { value: 706, color: "#ff0000" },
          { value: 707, color: "#ff0000" },
          { value: 708, color: "#ff0000" },
        ],
        [
          { value: 801, color: "#ff0000" },
          { value: 802, color: "#ff0000" },
          { value: 803, color: "#ff0000" },
          { value: 804, color: "#ff0000" },
          { value: 805, color: "#ff0000" },
          { value: 806, color: "#ff0000" },
          { value: 807, color: "#ff0000" },
          { value: 808, color: "#ff0000" },
        ],
        [
          { value: 901, color: "#ff0000" },
          { value: 902, color: "#ff0000" },
          { value: 903, color: "#ff0000" },
          { value: 904, color: "#ff0000" },
          { value: 905, color: "#ff0000" },
          { value: 906, color: "#ff0000" },
          { value: 907, color: "#ff0000" },
          { value: 908, color: "#ff0000" },
        ],
      ],
    };

    it("transforms the cell values", () => {
      expect(
        dataset
          .transform<{ value: number; color: string }>(cell => ({
            value: cell.value(),
            color: "#ff0000",
          }))
          .serialize(),
      ).toEqual(expected);
    });
  });

  describe("#readonly", () => {
    it("returns a dataset with only specific methods", () => {
      expect(dataset.readonly()).toHaveProperty("columns");
      expect(dataset.readonly()).toHaveProperty("rows");
      expect(dataset.readonly()).toHaveProperty("columnDimensions");
      expect(dataset.readonly()).toHaveProperty("rowDimensions");
      expect(dataset.readonly()).toHaveProperty("serialize");
      expect(dataset.readonly()).not.toHaveProperty("slice");
      expect(dataset.readonly()).not.toHaveProperty("aggregate");
      expect(dataset.readonly()).not.toHaveProperty("readonly");
    });

    it("#columns works as expected", () => {
      expect(
        dataset
          .readonly()
          .columns()
          .map(column => column.dimensionValues().map(x => x.value)),
      ).toEqual([
        ["<50", "Female", "sales"],
        ["<50", "Female", "revenue"],
        ["<50", "Male", "sales"],
        ["<50", "Male", "revenue"],
        [">=50", "Female", "sales"],
        [">=50", "Female", "revenue"],
        [">=50", "Male", "sales"],
        [">=50", "Male", "revenue"],
      ]);
    });
  });

  describe("Special multidimensional datasets", () => {
    describe("Empty dataset", () => {
      const datasetEmpty = new MultidimensionalDataset({
        columnDimensions: [],
        rowDimensions: [],
        rows: [],
        columns: [],
        data: [],
      });

      it("#slice with no predicates returns an empty dataset", () => {
        expect(datasetEmpty.slice({}).serialize()).toEqual(datasetEmpty.serialize());
      });

      it("#aggregate with no dimension keys returns an empty dataset", () => {
        expect(
          datasetEmpty
            .aggregate({
              merge: () => {
                throw new Error("This merge function should not have be called.");
              },
            })
            .serialize(),
        ).toEqual(datasetEmpty.serialize());
      });

      it("#transpose returns an empty dataset", () => {
        expect(datasetEmpty.transpose().serialize()).toEqual(datasetEmpty.serialize());
      });

      it("#transform returns an empty dataset", () => {
        expect(
          datasetEmpty
            .transform(() => {
              throw new Error("This transform function should not have be called.");
            })
            .serialize(),
        ).toEqual(datasetEmpty.serialize());
      });

      it("#rows is empty", () => {
        expect(datasetEmpty.rows().length).toBe(0);
      });

      it("#columns is empty", () => {
        expect(datasetEmpty.columns().length).toBe(0);
      });
    });

    describe("Empty dataset with columns", () => {
      const datasetEmptyWithColumns = new MultidimensionalDataset({
        columnDimensions: [{ key: "measures", metadata: {} }],
        rowDimensions: [],
        rows: [],
        columns: [["sales"], ["revenue"]],
        data: [],
      });

      it("#slice for column returns an empty data set", () => {
        expect(
          datasetEmptyWithColumns.slice({ x: [{ key: "measures", type: "include", values: ["sales"] }] }).serialize(),
        ).toEqual({
          columnDimensions: [{ key: "measures", metadata: {} }],
          rowDimensions: [],
          rows: [],
          columns: [["sales"]],
          data: [],
        });
      });

      it("#aggregate with no dimension keys returns an empty dataset", () => {
        expect(
          datasetEmptyWithColumns
            .aggregate({
              merge: () => {
                throw new Error("This merge function should not have be called.");
              },
            })
            .serialize(),
        ).toEqual(datasetEmptyWithColumns.serialize());
      });

      it("#transpose returns an empty dataset with rows", () => {
        expect(datasetEmptyWithColumns.transpose().serialize()).toEqual({
          columnDimensions: [],
          rowDimensions: [{ key: "measures", metadata: {} }],
          rows: [["sales"], ["revenue"]],
          columns: [],
          data: [],
        });
      });

      it("#transform returns an empty dataset", () => {
        expect(
          datasetEmptyWithColumns
            .transform(() => {
              throw new Error("This transform function should not have be called.");
            })
            .serialize(),
        ).toEqual(datasetEmptyWithColumns.serialize());
      });

      it("#rows is empty", () => {
        expect(datasetEmptyWithColumns.rows().length).toBe(0);
      });

      it("#columns are returned as expected", () => {
        expect(datasetEmptyWithColumns.columns().length).toBe(2);
      });
    });

    describe("Empty dataset with rows", () => {
      const datasetEmptyWithRows = new MultidimensionalDataset({
        columnDimensions: [],
        rowDimensions: [{ key: "measures", metadata: {} }],
        rows: [["sales"], ["revenue"]],
        columns: [],
        data: [],
      });

      it("#slice for row returns an empty data set", () => {
        expect(
          datasetEmptyWithRows.slice({ y: [{ key: "measures", type: "include", values: ["sales"] }] }).serialize(),
        ).toEqual({
          columnDimensions: [],
          rowDimensions: [{ key: "measures", metadata: {} }],
          rows: [["sales"]],
          columns: [],
          data: [],
        });
      });

      it("#aggregate with no dimension keys returns an empty dataset", () => {
        expect(
          datasetEmptyWithRows
            .aggregate({
              merge: () => {
                throw new Error("This merge function should not have be called.");
              },
            })
            .serialize(),
        ).toEqual(datasetEmptyWithRows.serialize());
      });

      it("#transpose returns an empty dataset with columns", () => {
        expect(datasetEmptyWithRows.transpose().serialize()).toEqual({
          columnDimensions: [{ key: "measures", metadata: {} }],
          rowDimensions: [],
          rows: [],
          columns: [["sales"], ["revenue"]],
          data: [],
        });
      });

      it("#transform returns an empty dataset", () => {
        expect(
          datasetEmptyWithRows
            .transform(() => {
              throw new Error("This transform function should not have be called.");
            })
            .serialize(),
        ).toEqual(datasetEmptyWithRows.serialize());
      });

      it("#rows are returned as expected", () => {
        expect(datasetEmptyWithRows.rows().length).toBe(2);
      });

      it("#columns is empty", () => {
        expect(datasetEmptyWithRows.columns().length).toBe(0);
      });
    });

    describe("Dataset with only one cell", () => {
      const datasetWithOnlyOneCell = new MultidimensionalDataset({
        columnDimensions: [{ key: "sales", metadata: {} }],
        rowDimensions: [{ key: "total", metadata: {} }],
        rows: [["Total"]],
        columns: [["sales"]],
        data: [[101]],
      });

      it("#slice for row returns the same data set", () => {
        expect(
          datasetWithOnlyOneCell.slice({ y: [{ key: "total", type: "include", values: ["Total"] }] }).serialize(),
        ).toEqual(datasetWithOnlyOneCell.serialize());
      });

      it("#slice for column returns the same data set", () => {
        expect(
          datasetWithOnlyOneCell.slice({ x: [{ key: "sales", type: "include", values: ["sales"] }] }).serialize(),
        ).toEqual(datasetWithOnlyOneCell.serialize());
      });

      it("#aggregate works as expected", () => {
        expect(
          datasetWithOnlyOneCell
            .aggregate({
              x: "sales",
              merge: v => ({
                foo: v
                  .columns()[0]
                  .cells()[0]
                  .value(),
              }),
            })
            .serialize(),
        ).toEqual({
          columnDimensions: [{ key: "sales", metadata: {} }],
          rowDimensions: [],
          rows: [[]],
          columns: [["sales"]],
          data: [[{ foo: 101 }]],
        });
      });

      it("#transpose works as expected", () => {
        expect(datasetWithOnlyOneCell.transpose().serialize()).toEqual({
          columnDimensions: [{ key: "total", metadata: {} }],
          rowDimensions: [{ key: "sales", metadata: {} }],
          rows: [["sales"]],
          columns: [["Total"]],
          data: [[101]],
        });
      });

      it("#transform works as expected", () => {
        expect(datasetWithOnlyOneCell.transform(v => v.value() * 2).serialize()).toEqual({
          columnDimensions: [{ key: "sales", metadata: {} }],
          rowDimensions: [{ key: "total", metadata: {} }],
          rows: [["Total"]],
          columns: [["sales"]],
          data: [[202]],
        });
      });

      it("#rows are returned as expected", () => {
        expect(datasetWithOnlyOneCell.rows().length).toBe(1);
      });

      it("#columns are returned as expected", () => {
        expect(datasetWithOnlyOneCell.columns().length).toBe(1);
      });
    });
  });
});
