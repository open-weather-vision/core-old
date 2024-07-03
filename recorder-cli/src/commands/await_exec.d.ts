declare module "await-exec" {
    export default function(command: string): Promise<{
        stdOut: string,
        stdErr: string
    }>
}