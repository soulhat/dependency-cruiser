const expect = require("chai").expect;
const { matchesReachesRule } = require("../../src/validate/match-module-rule");

const EMPTY_RULE = { from: {}, to: {} };
const ANY_REACHABLE = {
  name: "no-unreachable",
  from: {},
  to: { reachable: true }
};
const ANY_REACHABLE_NAMELESS = {
  from: {},
  to: { reachable: true }
};

describe("validate/match-module-rule - reaches", () => {
  it("rule without reachable attribute doesn't match modules with a reaches (implicit)", () => {
    expect(matchesReachesRule(EMPTY_RULE, {})).to.equal(false);
  });
  it("rule without reachable attribute doesn't match modules with a reaches (explicit)", () => {
    expect(
      matchesReachesRule(EMPTY_RULE, {
        reaches: [
          {
            modules: [{ source: "src/hoppetee.js" }],
            asDefinedInRule: "no-unreachable"
          }
        ]
      })
    ).to.equal(false);
  });
  it("rule without reachable attribute matches modules with a reaches (explicit)", () => {
    expect(
      matchesReachesRule(ANY_REACHABLE, {
        reaches: [
          {
            modules: [{ source: "src/hoppetee.js" }],
            asDefinedInRule: "no-unreachable"
          }
        ]
      })
    ).to.equal(true);
  });
  it("rule without reachable attribute matches modules with a reaches (explicit, nameless rule)", () => {
    expect(
      matchesReachesRule(ANY_REACHABLE_NAMELESS, {
        reaches: [
          {
            modules: [{ source: "src/hoppetee.js" }],
            asDefinedInRule: "not-in-allowed"
          }
        ]
      })
    ).to.equal(true);
  });
});
