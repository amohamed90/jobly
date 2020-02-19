const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field", function() {
   const {query, values} =
   sqlForPartialUpdate("companies", { name: "Amazon" }, "companyName", "id")

   expect(query).toEqual("UPDATE companies SET name=$1 WHERE companyName=$2 RETURNING *");
   expect(values).toEqual(["Amazon", "id"]);
  });
});


