/**
 * all supported extensions; for each extension whether or not
 * it is supported in the current environment
 */
export const allExtensions: Array<{
    /**
     * File extension (e.g. ".js", ".ts", ".jsx")
     */
    extension: string;
    /**
     * Whether or not the extension is available as supported in the current environment
     */
    available: boolean;
}>;

export type AvailableTranspilersType = Array<{
    /**
     * The name of the transpiler (e.g. "typescript", "coffeescript")
     */
    name: string;
    /**
     * A semver version range (e.g. ">=2.0.0 <3.0.0")
     */
    version: string;
    /**
     * Whether or not the transpiler is available in the current environment
     */
    available: boolean;
}>;

export type ModuleSystemType = "cjs" | "amd" | "es6";

export type OutputType = "json" | "html" | "dot" | "csv" | "err";

export type SeverityType = "error" | "warn" | "info";

export type DependencyType = "local"     | "npm"         | "npm-dev"      | "npm-optional"
                            | "npm-peer" | "npm-bundled" | "npm-no-pkg"   | "npm-unknown"
                            | "core"     | "unknown"     | "undetermined" | "deprecated";

export interface IRestriction {
    /**
     * A regular expression an end of a dependency should match to be catched by this rule.
     */
    path?: string;
    /**
     * A regular expression an end of a dependency should NOT match to be catched by this rule.
     */
    pathNot?: string;
}

export interface IToRestriction {
    /**
     * A regular expression an end of a dependency should match to be catched by this rule.
     */
    path?: string;
    /**
     * A regular expression an end of a dependency should NOT match to be catched by this rule.
     */
    pathNot?: string;
    /**
     * Whether or not to match modules dependency-cruiser could not resolve (and probably
     * aren't on disk). For this one too: leave out if you don't care either way.
     */
    couldNotResolve?: boolean;
    /**
     * Whether or not to match when following to the to will ultimately end up in the from.
     */
    circular?: boolean;
    /**
     * Whether or not to match modules of any of these types (leaving out matches any of them)
     */
    dependencyTypes?: DependencyType[];
    /**
     * If true matches dependencies with more than one dependency type (e.g. defined in
     * _both_ npm and npm-dev)
     */
    moreThanOneDependencyType?: boolean;
    /**
     * Whether or not to match modules that were released under one of the mentioned
     * licenses. E.g. to flag GPL-1.0, GPL-2.0 licensed modules (e.g. because your app
     * is not compatible with the GPL) use "GPL"
     */
    license?: string;
    /**
     * Whether or not to match modules that were NOT released under one of the mentioned
     * licenses. E.g. to flag everyting non MIT use "MIT" here
     */
    licenseNot?: string;
}

export interface IRule {
    /**
     * You can use this field to document why the rule is there.
     */
    comment?: string;
    /**
     * Criteria the 'from' end of a dependency should match to be caught by this rule.
     * Leave it empty if you want any module to be matched.
     */
    from: IRestriction;
    /**
     * Criteria the 'to' end of a dependency should match to be caught by this rule.
     * Leave it empty if you want any module to be matched.
     */
    to: IToRestriction;
}

export interface IForbiddenRuleType {
    /**
     * A short name for the rule - will appear in reporters to enable customers to
     * quickly identify a violated rule. Try to keep them short, eslint style.
     * E.g. 'not-to-core' for a rule forbidding dependencies on core modules, or
     * 'not-to-unresolvable' for one that prevents dependencies on modules that
     * probably don't exist.
     */
    name?: string;
    /**
     * How severe a violation of the rule is. The 'error' severity will make some
     * reporters return a non-zero exit code, so if you want e.g. a build to stop
     * when there's a rule violated: use that.
     */
    severity?: SeverityType;
    /**
     * You can use this field to document why the rule is there.
     */
    comment?: string;
    /**
     * Criteria the 'from' end of a dependency should match to be caught by this
     * rule. Leave it empty if you want any module to be matched.
     */
    from: IRestriction;
    /**
     * Criteria the 'to' end of a dependency should match to be caught by this
     * rule. Leave it empty if you want any module to be matched.
     */
    to: IToRestriction;
}

export interface IRuleSetType {
    /**
     * A list of rules that describe dependencies that are not allowed.
     * dependency-cruiser will emit a separate error (warning/ informational)
     * messages for each violated rule.
     */
    forbidden?: IForbiddenRuleType[];
    /**
     * A list of rules that describe dependencies that are allowed.
     * dependency-cruiser will emit the warning message 'not-in-allowed' for
     * each dependency that does not at least one of them.
     */
    allowed?: IRule[];
    /**
     * Runtime configuration options
     */
    options?: ICruiseOptions;
}

export interface ICruiseOptions {
    /**
     * if true, will attempt to validate with the rules in ruleSet.
     * Default false.
     */
    validate?: boolean;
    /**
     * An object containing the rules to validate against. The rules
     * should adhere to the
     * [ruleset schema](https://github.com/sverweij/dependency-cruiser/blob/develop/src/main/ruleSet/jsonschema.json)
     */
    ruleSet?: IRuleSetType;
    /**
     * regular expression describing which dependencies the function
     * should cruise, but not resolve or follow any further
     */
    doNotFollow?: string;
    /**
     * regular expression describing which dependencies the function
     * should not cruise
     */
    exclude?: string;
    /**
     * the maximum depth to cruise; 0 <= n <= 99
     * (default: 0, which means 'infinite depth')
     */
    maxDepth?: number;
    /**
     * an array of module systems to use for following dependencies;
     * defaults to ["es6", "cjs", "amd"]
     */
    moduleSystems?: ModuleSystemType[];
    /**
     * one of "json", "html", "dot", "csv" or "err". When left
     * out the function will return a javascript object as dependencies
     */
    outputType?: OutputType;
    /**
     * a string to insert before links (in dot/ svg output) so with
     * cruising local dependencies it is possible to point to sources
     * elsewhere (e.g. in an online repository)
     */
    prefix?: string;
}

/**
 * Cruises the specified files and files with supported extensions in
 * the specified directories in the pFileDirArray and returns the result
 * in an object.
 *
 * @param pFileDirArray An array of (names of) files and directories to start the cruise with
 * @param pOptions Options that influence the way the dependencies are cruised - and how they are returned.
 * @returns pornographic material NSFW
 */
export function cruise(pFileDirArray: string[], pOptions?: ICruiseOptions ): object;

/**
 * Returns an array of supported transpilers and for each of the transpilers
 * - the name of the transpiler
 * - the supported version range (semver version range)
 * - whether or not the transpiler is available in the current environment
 */
export function getAvailableTranspilers(): AvailableTranspilersType;

// export namespace cruise {
//     const prototype: {
//     };
// }
