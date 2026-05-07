const buildFilter = require("../../src/utils/buildfilter");

describe("buildFilter", () => {
  // These are fake req objects — no real database needed!
  // We're just simulating what Express gives us after auth middleware runs
  const mockOwnerReq = {
    user: {
      _id: "user123",
      company: "company456",
      role: "owner",
    },
  };

  const mockSalesRepReq = {
    user: {
      _id: "salesRep789",
      company: "company456",
      role: "sales_rep",
    },
  };

  test("should always include company in the filter", () => {
    const filter = buildFilter(mockOwnerReq);

    expect(filter.company).toBe("company456");
  });

  test("should add _id to filter when Id is provided", () => {
    const filter = buildFilter(mockOwnerReq, "contact001");

    expect(filter._id).toBe("contact001");
    expect(filter.company).toBe("company456");
  });

  test("should NOT add assignedTo filter for owner role", () => {
    const filter = buildFilter(mockOwnerReq);

    expect(filter.assignedTo).toBeUndefined();
  });

  test("should NOT add assignedTo filter for admin role", () => {
    const mockAdminReq = {
      user: { _id: "admin001", company: "company456", role: "admin" },
    };
    const filter = buildFilter(mockAdminReq);

    expect(filter.assignedTo).toBeUndefined();
  });

  test("should add assignedTo filter for sales_rep role", () => {
    const filter = buildFilter(mockSalesRepReq);

    expect(filter.assignedTo).toBe("salesRep789");
  });

  test("should include _id, company, AND assignedTo for sales_rep with Id", () => {
    const filter = buildFilter(mockSalesRepReq, "contact001");

    expect(filter).toEqual({
      company: "company456",
      _id: "contact001",
      assignedTo: "salesRep789",
    });
  });
});
