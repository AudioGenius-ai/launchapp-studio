import * as git from '@code-pilot/plugin-git';
import type { GitStatus, GitCommit, GitBranch, GitRemote, GitTag, GitStashEntry, GitDiff, GitLogOptions, GitCommitOptions, GitCheckoutOptions } from '../types';

export class GitService {
    async getStatus(repoPath: string): Promise<GitStatus> {
        return await git.gitStatus(repoPath);
    }
    async getLog(repoPath: string, options: GitLogOptions = {}): Promise<GitCommit[]> {
        return await git.gitLog(repoPath, options);
    }
    async commit(repoPath: string, options: GitCommitOptions): Promise<void> {
        await git.gitCommit(repoPath, options);
    }
    async stageFile(repoPath: string, filePath: string): Promise<void> {
        return await git.gitStage(repoPath, filePath);
    }
    async unstageFile(repoPath: string, filePath: string): Promise<void> {
        return await git.gitUnstage(repoPath, filePath);
    }
    async stageAll(repoPath: string): Promise<void> {
        return await git.gitStageAll(repoPath);
    }
    async unstageAll(repoPath: string): Promise<void> {
        return await git.gitUnstageAll(repoPath);
    }
    async getBranches(repoPath: string): Promise<GitBranch[]> {
        return await git.gitBranches(repoPath);
    }
    async createBranch(repoPath: string, branchName: string, fromRef?: string): Promise<void> {
        return await git.gitCreateBranch(repoPath, branchName, fromRef);
    }
    async checkout(repoPath: string, options: GitCheckoutOptions): Promise<void> {
        return await git.gitCheckout(repoPath, options);
    }
    async deleteBranch(repoPath: string, branchName: string, force: boolean = false): Promise<void> {
        return await git.gitDeleteBranch(repoPath, branchName, force);
    }
    async getRemotes(repoPath: string): Promise<GitRemote[]> {
        return await git.gitRemotes(repoPath);
    }
    async getDiff(repoPath: string, cached: boolean = false): Promise<GitDiff> {
        const result = await git.gitDiff(repoPath, cached);
        // Convert array result to GitDiff format
        return {
            files: result || [],
            stats: {
                additions: 0,
                deletions: 0,
                files: result?.length || 0
            }
        };
    }
    async getDiffFile(repoPath: string, filePath: string, cached: boolean = false): Promise<GitDiff> {
        const result = await git.gitDiffFile(repoPath, filePath, cached);
        // Convert single file result to GitDiff format
        return {
            files: result ? [result] : [],
            stats: {
                additions: 0,
                deletions: 0,
                files: result ? 1 : 0
            }
        };
    }
    async getTags(repoPath: string): Promise<GitTag[]> {
        return await git.gitTags(repoPath);
    }
    async getStashList(repoPath: string): Promise<GitStashEntry[]> {
        return await git.gitStashList(repoPath);
    }
    // Helper methods
    async hasUncommittedChanges(repoPath: string): Promise<boolean> {
        const status = await this.getStatus(repoPath);
        return (status.staged && status.staged.length > 0) ||
            (status.unstaged && status.unstaged.length > 0) ||
            (status.untracked && status.untracked.length > 0) ||
            false;
    }
    async getCurrentBranch(repoPath: string): Promise<string> {
        const status = await this.getStatus(repoPath);
        return status.branch;
    }
    async isGitRepository(path: string): Promise<boolean> {
        try {
            await this.getStatus(path);
            return true;
        }
        catch {
            return false;
        }
    }
}
// Export singleton instance
export const gitService = new GitService();