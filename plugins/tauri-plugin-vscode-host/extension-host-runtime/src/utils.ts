export function parseArgs(args: string[]): Record<string, string | boolean> {
    const result: Record<string, string | boolean> = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const nextArg = args[i + 1];
            
            if (nextArg && !nextArg.startsWith('--')) {
                result[key] = nextArg;
                i++; // Skip next arg
            } else {
                result[key] = true;
            }
        }
    }
    
    return result;
}