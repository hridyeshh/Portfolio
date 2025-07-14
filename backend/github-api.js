const fetch = require('node-fetch');

class GitHubAPI {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.username = 'hridyeshh';
        this.token = process.env.GITHUB_TOKEN;
        this.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-AI-Assistant'
        };
        
        if (this.token) {
            this.headers['Authorization'] = `token ${this.token}`;
        }
    }

    async makeRequest(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('GitHub API request failed:', error);
            return null;
        }
    }

    async getUserProfile() {
        return await this.makeRequest(`/users/${this.username}`);
    }

    async getRepositories() {
        return await this.makeRequest(`/users/${this.username}/repos?sort=updated&per_page=100`);
    }

    async getRepositoryDetails(repoName) {
        return await this.makeRequest(`/repos/${this.username}/${repoName}`);
    }

    async getRepositoryLanguages(repoName) {
        return await this.makeRequest(`/repos/${this.username}/${repoName}/languages`);
    }

    async getRepositoryCommits(repoName) {
        return await this.makeRequest(`/repos/${this.username}/${repoName}/commits?per_page=30`);
    }

    async getRepositoryContributors(repoName) {
        return await this.makeRequest(`/repos/${this.username}/${repoName}/contributors`);
    }

    async getRepositoryForks(repoName) {
        return await this.makeRequest(`/repos/${this.username}/${repoName}/forks`);
    }

    async getRepositoryStars(repoName) {
        return await this.makeRequest(`/repos/${this.username}/${repoName}/stargazers`);
    }

    async getRepositoryIssues(repoName) {
        return await this.makeRequest(`/repos/${this.username}/${repoName}/issues?state=all&per_page=30`);
    }

    async getRepositoryPulls(repoName) {
        return await this.makeRequest(`/repos/${this.username}/${repoName}/pulls?state=all&per_page=30`);
    }

    async getRecentActivity() {
        return await this.makeRequest(`/users/${this.username}/events?per_page=50`);
    }

    async getFollowers() {
        return await this.makeRequest(`/users/${this.username}/followers`);
    }

    async getFollowing() {
        return await this.makeRequest(`/users/${this.username}/following`);
    }

    async getGists() {
        return await this.makeRequest(`/users/${this.username}/gists`);
    }

    // Comprehensive data gathering
    async getComprehensiveData() {
        try {
            const [
                profile,
                repositories,
                recentActivity
            ] = await Promise.all([
                this.getUserProfile(),
                this.getRepositories(),
                this.getRecentActivity()
            ]);

            if (!profile || !repositories) {
                return null;
            }

            // Get detailed data for top repositories
            const topRepos = repositories.slice(0, 10);
            const detailedRepos = await Promise.all(
                topRepos.map(async (repo) => {
                    const [languages, commits, forks, stars] = await Promise.all([
                        this.getRepositoryLanguages(repo.name),
                        this.getRepositoryCommits(repo.name),
                        this.getRepositoryForks(repo.name),
                        this.getRepositoryStars(repo.name)
                    ]);

                    return {
                        ...repo,
                        languages,
                        commitCount: commits ? commits.length : 0,
                        forkCount: forks ? forks.length : 0,
                        starCount: stars ? stars.length : 0
                    };
                })
            );

            return {
                profile,
                repositories: detailedRepos,
                recentActivity,
                summary: this.generateSummary(profile, detailedRepos, recentActivity)
            };
        } catch (error) {
            console.error('Error gathering comprehensive GitHub data:', error);
            return null;
        }
    }

    generateSummary(profile, repositories, recentActivity) {
        if (!profile || !repositories) return null;

        const totalRepos = repositories.length;
        const totalStars = repositories.reduce((sum, repo) => sum + (repo.starCount || 0), 0);
        const totalForks = repositories.reduce((sum, repo) => sum + (repo.forkCount || 0), 0);
        const totalCommits = repositories.reduce((sum, repo) => sum + (repo.commitCount || 0), 0);

        // Language analysis
        const languageStats = {};
        repositories.forEach(repo => {
            if (repo.languages) {
                Object.entries(repo.languages).forEach(([lang, bytes]) => {
                    languageStats[lang] = (languageStats[lang] || 0) + bytes;
                });
            }
        });

        const topLanguages = Object.entries(languageStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([lang]) => lang);

        // Recent activity analysis
        const recentCommits = recentActivity?.filter(event => 
            event.type === 'PushEvent' && 
            new Date(event.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        ).length || 0;

        return {
            totalRepositories: totalRepos,
            totalStars,
            totalForks,
            totalCommits,
            topLanguages,
            recentCommits,
            followers: profile.followers,
            following: profile.following,
            publicGists: profile.public_gists,
            publicRepos: profile.public_repos,
            accountCreated: profile.created_at,
            lastActive: recentActivity?.[0]?.created_at
        };
    }

    // Format data for AI context
    formatForAIContext(data) {
        if (!data) return '';

        const { profile, repositories, summary } = data;
        
        let context = `\n\nLIVE GITHUB DATA:\n`;
        context += `GitHub Profile: ${profile.html_url}\n`;
        context += `Followers: ${summary.followers} | Following: ${summary.following}\n`;
        context += `Public Repositories: ${summary.totalRepositories}\n`;
        context += `Total Stars: ${summary.totalStars} | Total Forks: ${summary.totalForks}\n`;
        context += `Total Commits: ${summary.totalCommits}\n`;
        context += `Top Languages: ${summary.topLanguages.join(', ')}\n`;
        context += `Recent Activity: ${summary.recentCommits} commits in last 30 days\n\n`;

        context += `RECENT REPOSITORIES:\n`;
        repositories.slice(0, 8).forEach((repo, index) => {
            const languages = repo.languages ? Object.keys(repo.languages).join(', ') : 'N/A';
            const lastUpdated = new Date(repo.updated_at).toLocaleDateString();
            
            context += `${index + 1}. ${repo.name}\n`;
            context += `   Description: ${repo.description || 'No description'}\n`;
            context += `   Languages: ${languages}\n`;
            context += `   Stars: ${repo.starCount || 0} | Forks: ${repo.forkCount || 0} | Commits: ${repo.commitCount || 0}\n`;
            context += `   Last Updated: ${lastUpdated}\n`;
            context += `   URL: ${repo.html_url}\n\n`;
        });

        return context;
    }
}

module.exports = GitHubAPI; 