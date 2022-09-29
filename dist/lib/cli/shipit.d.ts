interface Props {
    gitUser: string;
    gitEmail: string;
    tagPrefix: string;
    failOnMissingCommit: boolean;
    releaseBranchPrefix: string;
    forceBump: boolean;
}
export declare const shipitHandler: ({ gitEmail, gitUser, tagPrefix, failOnMissingCommit, forceBump, releaseBranchPrefix }: Props) => Promise<void>;
export {};
