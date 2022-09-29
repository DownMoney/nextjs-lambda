interface Props {
    stackName: string;
    tsconfigPath: string;
    appPath: string;
}
export declare const deployHandler: ({ stackName, tsconfigPath, appPath }: Props) => Promise<void>;
export {};
