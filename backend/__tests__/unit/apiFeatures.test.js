const ApiFeatures = require("../../src/utils/apiFeatures");

describe("ApiFeatures", () => {
  // This is a "mock" — a fake object that pretends to be a Mongoose query.
  // Why fake it? Because we want to test ApiFeatures LOGIC only,
  // not whether MongoDB actually works. That's what unit testing means.
  const createMockQuery = () => {
    const mockQuery = {
      find: jest.fn().mockReturnThis(), // jest.fn() = fake function
      sort: jest.fn().mockReturnThis(), // .mockReturnThis() = returns the object itself
      select: jest.fn().mockReturnThis(), // so chaining works: query.find().sort().select()
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    return mockQuery;
  };

  // ──────────────────────────────────────────────
  // filter() tests
  // ──────────────────────────────────────────────
  describe("filter()", () => {
    test("should remove page, sort, limit, fields from the query", () => {
      const mockQuery = createMockQuery();
      const queryString = {
        name: "John",
        page: "1",
        sort: "name",
        limit: "10",
        fields: "name,email",
      };

      const features = new ApiFeatures(mockQuery, queryString);
      features.filter();

      // find() should ONLY receive {name: "John"}
      // page, sort, limit, fields should be stripped out
      expect(mockQuery.find).toHaveBeenCalledWith({ name: "John" });
    });

    test("should remove company and assignedTo from query (security)", () => {
      const mockQuery = createMockQuery();
      const queryString = {
        name: "John",
        company: "hacked_company_id",
        assignedTo: "hacked_user_id",
      };

      const features = new ApiFeatures(mockQuery, queryString);
      features.filter();

      // A user should NOT be able to inject company or assignedTo via query params
      expect(mockQuery.find).toHaveBeenCalledWith({ name: "John" });
    });

    test("should convert gte/gt/lte/lt to MongoDB operators", () => {
      const mockQuery = createMockQuery();
      const queryString = { price: { gte: "100" } };

      const features = new ApiFeatures(mockQuery, queryString);
      features.filter();

      // gte should become $gte (MongoDB syntax)
      expect(mockQuery.find).toHaveBeenCalledWith({ price: { $gte: "100" } });
    });

    test("should return this (for chaining)", () => {
      const mockQuery = createMockQuery();
      const features = new ApiFeatures(mockQuery, {});

      const result = features.filter();
      expect(result).toBeInstanceOf(ApiFeatures);
    });
  });

  // ──────────────────────────────────────────────
  // sort() tests
  // ──────────────────────────────────────────────
  describe("sort()", () => {
    test("should sort by provided fields (comma → space)", () => {
      const mockQuery = createMockQuery();
      const queryString = { sort: "name,-createdAt" };

      const features = new ApiFeatures(mockQuery, queryString);
      features.sort();

      // "name,-createdAt" becomes "name -createdAt" (MongoDB format)
      expect(mockQuery.sort).toHaveBeenCalledWith("name -createdAt");
    });

    test("should default to -createdAt when no sort param", () => {
      const mockQuery = createMockQuery();
      const features = new ApiFeatures(mockQuery, {});
      features.sort();

      expect(mockQuery.sort).toHaveBeenCalledWith("-createdAt");
    });
  });

  // ──────────────────────────────────────────────
  // limitFields() tests
  // ──────────────────────────────────────────────
  describe("limitFields()", () => {
    test("should select only requested fields", () => {
      const mockQuery = createMockQuery();
      const queryString = { fields: "name,email,phone" };

      const features = new ApiFeatures(mockQuery, queryString);
      features.limitFields();

      expect(mockQuery.select).toHaveBeenCalledWith("name email phone");
    });

    test("should exclude __v by default", () => {
      const mockQuery = createMockQuery();
      const features = new ApiFeatures(mockQuery, {});
      features.limitFields();

      expect(mockQuery.select).toHaveBeenCalledWith("-__v");
    });
  });

  // ──────────────────────────────────────────────
  // paginate() tests
  // ──────────────────────────────────────────────
  describe("paginate()", () => {
    test("should calculate correct skip for page 3, limit 10", () => {
      const mockQuery = createMockQuery();
      const queryString = { page: "3", limit: "10" };

      const features = new ApiFeatures(mockQuery, queryString);
      features.paginate();

      // Page 3, limit 10 → skip first 20 results
      expect(mockQuery.skip).toHaveBeenCalledWith(20);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    test("should default to page 1 and limit 100", () => {
      const mockQuery = createMockQuery();
      const features = new ApiFeatures(mockQuery, {});
      features.paginate();

      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(100);
    });

    test("should convert string params to numbers", () => {
      const mockQuery = createMockQuery();
      const queryString = { page: "2", limit: "25" };

      const features = new ApiFeatures(mockQuery, queryString);
      features.paginate();

      // "2" and "25" come as strings from req.query — must be converted
      expect(mockQuery.skip).toHaveBeenCalledWith(25);
      expect(mockQuery.limit).toHaveBeenCalledWith(25);
    });
  });

  // ──────────────────────────────────────────────
  // chaining test
  // ──────────────────────────────────────────────
  test("all methods should be chainable together", () => {
    const mockQuery = createMockQuery();
    const features = new ApiFeatures(mockQuery, { sort: "name" });

    // This is how your controllers use it:
    // new ApiFeatures(query, req.query).filter().sort().limitFields().paginate()
    const result = features.filter().sort().limitFields().paginate();

    expect(result).toBeInstanceOf(ApiFeatures);
  });
});
