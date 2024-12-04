

const flattenJsonWithEscaping = require('../index').flattenJsonWithEscaping; // Replace with the path to your implementation

// Example Usage:
const nestedData1 = { test: { tester: { testing: "10" } } };
console.log(flattenJsonWithEscaping(nestedData1));
// Output: { "test.tester.testing": "10" }

const nestedData2 = {
    test: {
        tester: {
            testing: "10",
            makeup: 10
        },
        madeup: 20
    },
    fakeup: 30
};
console.log(flattenJsonWithEscaping(nestedData2));
// Output: { "test.tester.testing": "10", "test.tester.makeup": 10, "test.madeup": 20, "fakeup": 30 }

const nestedData3 = {
    test: {
        "tester.makeup": {
            testing: "10",
            makeup: 10
        },
        madeup: 20
    },
    fakeup: 30
};
console.log(flattenJsonWithEscaping(nestedData3));
// Output:
// {
//   "test.tester\\.makeup.testing": "10",
//   "test.tester\\.makeup.makeup": 10,
//   "test.madeup": 20,
//   "fakeup": 30
// }
