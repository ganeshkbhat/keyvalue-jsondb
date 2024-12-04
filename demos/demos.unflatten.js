
const unflattenJson = require('../index').unflattenJson; // Replace with the path to your implementation

// Example Usage:
const flatData1 = { "test.tester.testing": "10" };
console.log(JSON.stringify(unflattenJson(flatData1), null, 2));
// Output:
// {
//   "test": {
//     "tester": {
//       "testing": "10"
//     }
//   }
// }

const flatData2 = {
    "test.tester.testing": "10",
    "test.tester.makeup": 10,
    "test.madeup": 20,
    "fakeup": 30
};
console.log(JSON.stringify(unflattenJson(flatData2), null, 2));
// Output:
// {
//   "test": {
//     "tester": {
//       "testing": "10",
//       "makeup": 10
//     },
//     "madeup": 20
//   },
//   "fakeup": 30
// }

const flatData3 = { "nest\\..secondnest.third\\.nest": 1 };
console.log(JSON.stringify(unflattenJson(flatData3), null, 2));
// Output:
// {
//   "nest.secondnest": {
//     "third.nest": 1
//   }
// }
