import { deepEqual, doesNotThrow, equal, throws } from "node:assert/strict";
import { createRequireJSON } from "../backwards.utl.mjs";
import { runFixture } from "./run-get-dependencies-fixture.utl.mjs";
import normalizeResolveOptions from "#main/resolve-options/normalize.mjs";
import { normalizeCruiseOptions } from "#main/options/normalize.mjs";
import getDependencies from "#extract/get-dependencies.mjs";

const requireJSON = createRequireJSON(import.meta.url);

const coffeeFixtures = requireJSON("./__fixtures__/coffee.json");
const vueFixtures = requireJSON("./__fixtures__/vue.json");

describe("[I] extract/getDependencies - Vue with TypeScript - ", () => {
  vueFixtures.forEach((pFixture) => runFixture(pFixture, "tsc"));
});
describe("[I] extract/getDependencies - CoffeeScript - ", () => {
  coffeeFixtures.forEach((pFixture) => runFixture(pFixture));
});

describe("[I] extract/getDependencies - Error scenarios - ", () => {
  it("Does not raise an exception on syntax errors (because we're on the loose parser)", async () => {
    const lOptions = normalizeCruiseOptions({});
    const lResolveOptions = await normalizeResolveOptions(
      { bustTheCache: true },
      lOptions,
    );

    doesNotThrow(
      () =>
        getDependencies(
          "test/extract/__mocks__/syntax-error.js",
          lOptions,
          lResolveOptions,
        ),
      /Extracting dependencies ran afoul of... Unexpected token \(1:3\)/,
    );
  });
  it("Raises an exception on non-existing files", () => {
    throws(() => {
      getDependencies("non-existing-file.md", normalizeCruiseOptions({}), {});
    }, /Extracting dependencies ran afoul of...\n\n {2}ENOENT: no such file or directory, open /);
  });
});

describe("[I] extract/getDependencies - even when require gets non-string arguments, extract doesn't break", () => {
  let lOptions = {};
  let lResolveOptions = {};

  before("normalize options & resolve options", async () => {
    lOptions = normalizeCruiseOptions({});
    lResolveOptions = await normalizeResolveOptions(
      { bustTheCache: true },
      lOptions,
    );
  });

  it("Just skips require(481)", () => {
    equal(
      getDependencies(
        "./test/extract/__mocks__/cjs-require-non-strings/require-a-number.js",
        lOptions,
        lResolveOptions,
      ).length,
      1,
    );
  });

  it("Just skips require(a function)", () => {
    equal(
      getDependencies(
        "./test/extract/__mocks__/cjs-require-non-strings/require-a-function.js",
        lOptions,
        lResolveOptions,
      ).length,
      1,
    );
  });

  it("Just skips require(an iife)", () => {
    equal(
      getDependencies(
        "./test/extract/__mocks__/cjs-require-non-strings/require-an-iife.js",
        normalizeCruiseOptions({}),
        {},
      ).length,
      1,
    );
  });
});

describe("[I] extract/getDependencies - include", () => {
  it("returns no dependencies when the includeOnly pattern is erroneous", async () => {
    const lOptions = normalizeCruiseOptions({
      includeOnly: "will-not-match-dependencies-for-this-file",
    });
    const lResolveOptions = await normalizeResolveOptions(
      { bustTheCache: true },
      lOptions,
    );

    deepEqual(
      getDependencies(
        "./test/extract/__mocks__/include/src/index.js",
        lOptions,
        lResolveOptions,
      ),
      [],
    );
  });

  it('only includes dependencies matching the passed "includeOnly" (1)', async () => {
    const lOptions = normalizeCruiseOptions({ includeOnly: "/src/" });
    const lResolveOptions = await normalizeResolveOptions(
      { bustTheCache: true },
      lOptions,
    );

    deepEqual(
      getDependencies(
        "./test/extract/__mocks__/include/src/index.js",
        lOptions,
        lResolveOptions,
      ),
      [
        {
          coreModule: false,
          couldNotResolve: false,
          dependencyTypes: ["local"],
          dynamic: false,
          followable: true,
          exoticallyRequired: false,
          matchesDoNotFollow: false,
          module: "./bla",
          moduleSystem: "cjs",
          resolved: "test/extract/__mocks__/include/src/bla.js",
        },
      ],
    );
  });

  it('only includes dependencies matching the passed "includeOnly" (2)', async () => {
    const lOptions = normalizeCruiseOptions({ includeOnly: "include" });
    const lResolveOptions = await normalizeResolveOptions(
      { bustTheCache: true },
      lOptions,
    );

    deepEqual(
      getDependencies(
        "./test/extract/__mocks__/include/src/index.js",
        lOptions,
        lResolveOptions,
      ),
      [
        {
          coreModule: false,
          couldNotResolve: false,
          dependencyTypes: ["local"],
          dynamic: false,
          followable: true,
          exoticallyRequired: false,
          matchesDoNotFollow: false,
          module: "../di",
          moduleSystem: "cjs",
          resolved: "test/extract/__mocks__/include/di.js",
        },
        {
          coreModule: false,
          couldNotResolve: false,
          dependencyTypes: ["local"],
          dynamic: false,
          followable: true,
          exoticallyRequired: false,
          matchesDoNotFollow: false,
          module: "./bla",
          moduleSystem: "cjs",
          resolved: "test/extract/__mocks__/include/src/bla.js",
        },
      ],
    );
  });

  it("annotates the exotic require", async () => {
    const lOptions = normalizeCruiseOptions({ exoticRequireStrings: ["need"] });
    const lResolveOptions = await normalizeResolveOptions(
      { bustTheCache: true },
      lOptions,
    );

    deepEqual(
      getDependencies(
        "./test/extract/__mocks__/exotic-require/index.js",
        lOptions,
        lResolveOptions,
      ),
      [
        {
          coreModule: false,
          couldNotResolve: false,
          dependencyTypes: ["local"],
          dynamic: false,
          followable: true,
          exoticallyRequired: true,
          matchesDoNotFollow: false,
          module: "./required-with-need",
          moduleSystem: "cjs",
          exoticRequire: "need",
          resolved:
            "test/extract/__mocks__/exotic-require/required-with-need.js",
        },
      ],
    );
  });

  it("does not parse files matching extensions in the extraExtensionsToScan array", async () => {
    const lOptions = normalizeCruiseOptions({
      extraExtensionsToScan: [".bentknee", ".yolo"],
    });
    const lResolveOptions = await normalizeResolveOptions(
      { bustTheCache: true },
      lOptions,
    );

    deepEqual(
      getDependencies(
        "./test/extract/__mocks__/extra-extensions/not-parsed-when-in-extra-extensions.yolo",
        lOptions,
        lResolveOptions,
      ),
      [],
    );
  });

  it("adds a preCompilationOnly attribute when tsPreCompilationDeps === 'specify'", async () => {
    const lOptions = normalizeCruiseOptions({
      tsPreCompilationDeps: "specify",
    });
    const lResolveOptions = await normalizeResolveOptions(
      { bustTheCache: true },
      lOptions,
    );

    deepEqual(
      getDependencies(
        "./test/extract/__mocks__/specifyTsPreCompilationDeps/index.ts",
        lOptions,
        lResolveOptions,
      ),
      [
        {
          coreModule: false,
          couldNotResolve: false,
          dependencyTypes: ["local"],
          dynamic: false,
          followable: true,
          exoticallyRequired: false,
          matchesDoNotFollow: false,
          module: "./pre-compilation-only",
          moduleSystem: "es6",
          preCompilationOnly: true,
          resolved:
            "test/extract/__mocks__/specifyTsPreCompilationDeps/pre-compilation-only.d.ts",
        },
        {
          coreModule: false,
          couldNotResolve: false,
          dependencyTypes: ["local"],
          dynamic: false,
          followable: true,
          exoticallyRequired: false,
          matchesDoNotFollow: false,
          module: "./real-deal",
          moduleSystem: "es6",
          preCompilationOnly: false,
          resolved:
            "test/extract/__mocks__/specifyTsPreCompilationDeps/real-deal.ts",
        },
      ],
    );
  });
});
