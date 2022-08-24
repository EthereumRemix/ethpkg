export declare const extractVersionFromString: (str: string | undefined) => string | undefined;
export declare const versionToDisplayVersion: (version: string | undefined) => string | undefined;
export declare const extractChannelFromVersionString: (versionString?: string | undefined) => string | undefined;
export declare const extractPlatformFromString: (str: string) => "darwin" | "linux" | "windows" | undefined;
export declare function extractArchitectureFromString(str: string): string | undefined;
