/**
 * GitNest UI Components Documentation
 * 
 * This file documents all the new UI components added to support the README showcase.
 * All components support full dark mode with TailwindCSS dark: variants.
 */

/**
 * EMPTY STATE COMPONENTS
 * =======================
 * 
 * These components are used to show empty states when no data is available.
 * They are stateless and fully customizable via props.
 */

/**
 * EmptyRepository Component
 * 
 * Shows when no repositories exist.
 * 
 * Usage:
 * ------
 * import { EmptyRepository } from '@/components/empty-states';
 * 
 * <EmptyRepository 
 *   title="No repositories yet"
 *   message="Create your first repository to get started."
 *   showCreateButton={true}
 *   onCreateClick={() => navigate('/create-repo')}
 * />
 * 
 * Props:
 * - title (string): Custom title text
 * - message (string): Custom message text
 * - showCreateButton (boolean): Whether to show the create button (default: true)
 * - onCreateClick (function): Callback when create button is clicked
 */

/**
 * EmptyIssues Component
 * 
 * Shows when no issues exist.
 * 
 * Usage:
 * ------
 * import { EmptyIssues } from '@/components/empty-states';
 * 
 * <EmptyIssues 
 *   showCreateButton={true}
 *   onCreateClick={() => setShowCreateIssueModal(true)}
 * />
 */

/**
 * EmptyPullRequests Component
 * 
 * Shows when no pull requests exist.
 * 
 * Usage:
 * ------
 * import { EmptyPullRequests } from '@/components/empty-states';
 * 
 * <EmptyPullRequests 
 *   showCreateButton={false}
 * />
 */

/**
 * STAT CARD COMPONENTS
 * ====================
 * 
 * These components display repository statistics and metrics.
 */

/**
 * StatCard Component
 * 
 * Generic stat card component with customizable icon, label, and value.
 * Supports multiple color variants.
 * 
 * Usage:
 * ------
 * import { StatCard } from '@/components/cards';
 * import { Star, GitFork, Eye } from 'lucide-react';
 * 
 * <StatCard 
 *   icon={Star}
 *   label="Stars"
 *   value="1,234"
 *   variant="primary"
 * />
 * 
 * Props:
 * - icon (Component): Lucide React icon component
 * - label (string): Label text
 * - value (string | number): Display value
 * - variant (string): 'default' | 'primary' | 'success' | 'warning' | 'danger'
 * - className (string): Additional CSS classes
 * 
 * Preset Components:
 * - <RepoStars count={123} /> - Stars with icon
 * - <RepoForks count={45} /> - Forks with icon
 * - <RepoWatchers count={67} /> - Watchers with icon
 * - <RepoLanguage language="TypeScript" /> - Language display
 */

/**
 * USER CARD COMPONENTS
 * ====================
 * 
 * Components for displaying user profile information.
 */

/**
 * UserCard Component
 * 
 * Displays user profile information with avatar, bio, stats, and follow button.
 * 
 * Usage:
 * ------
 * import { UserCard } from '@/components/cards';
 * 
 * <UserCard 
 *   avatar="https://example.com/avatar.jpg"
 *   username="johndoe"
 *   fullName="John Doe"
 *   bio="Developer and open source enthusiast"
 *   location="San Francisco, CA"
 *   email="john@example.com"
 *   joinDate="Joined in January 2024"
 *   followers={342}
 *   following={156}
 *   isFollowing={false}
 *   onFollowClick={() => toggleFollow(userId)}
 *   onMenuClick={() => showMenu(userId)}
 * />
 * 
 * Props:
 * - avatar (string): URL to user avatar image
 * - username (string): User's username
 * - fullName (string): User's full name
 * - bio (string): User bio/description
 * - location (string): User location
 * - email (string): User email
 * - joinDate (string): When user joined
 * - followers (number): Number of followers
 * - following (number): Number following
 * - isFollowing (boolean): Whether current user follows this user
 * - onFollowClick (function): Callback when follow button clicked
 * - onMenuClick (function): Callback when menu button clicked
 * - className (string): Additional CSS classes
 */

/**
 * SKELETON/LOADING COMPONENTS
 * ===========================
 * 
 * These components show loading states while data is being fetched.
 */

/**
 * StatCardSkeleton Component
 * 
 * Skeleton loader for stat cards.
 * 
 * Usage:
 * ------
 * import { StatCardSkeleton } from '@/components/cards';
 * import { useQuery } from '@tanstack/react-query';
 * 
 * const { data: stats, isLoading } = useQuery(['repo-stats'], fetchStats);
 * 
 * {isLoading ? (
 *   <div className="space-y-3">
 *     <StatCardSkeleton variant="primary" />
 *     <StatCardSkeleton variant="success" />
 *     <StatCardSkeleton variant="warning" />
 *   </div>
 * ) : (
 *   // Render actual stat cards
 * )}
 * 
 * Props:
 * - variant (string): 'default' | 'primary' | 'success' | 'warning' | 'danger'
 * - className (string): Additional CSS classes
 */

/**
 * UserCardSkeleton Component
 * 
 * Skeleton loader for user card while fetching user data.
 * 
 * Usage:
 * ------
 * import { UserCardSkeleton } from '@/components/cards';
 * 
 * {isLoadingUser ? <UserCardSkeleton /> : <UserCard {...userProps} />}
 * 
 * Props:
 * - className (string): Additional CSS classes
 */

/**
 * DARK MODE SUPPORT
 * =================
 * 
 * All components support full dark mode through TailwindCSS dark: variants.
 * 
 * The dark mode is controlled by adding/removing the 'dark' class on the 
 * html element:
 * 
 *   // Enable dark mode
 *   document.documentElement.classList.add('dark');
 *   
 *   // Disable dark mode
 *   document.documentElement.classList.remove('dark');
 * 
 * All color schemes are properly handled:
 * - Backgrounds: Light backgrounds become dark in dark mode
 * - Text: Light text becomes dark in dark mode
 * - Borders: Light borders become dark in dark mode
 * - Hover states: Properly adjusted for dark mode
 */

/**
 * IMPLEMENTATION EXAMPLES
 * =======================
 */

// Example 1: Repository page with stats
/*
import { RepoStars, RepoForks, RepoWatchers, RepoLanguage } from '@/components/cards';
import { useQuery } from '@tanstack/react-query';

function RepositoryPage() {
  const { data: repo, isLoading } = useQuery(['repo', id], () => fetchRepo(id));
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-6">
      <h1>{repo.name}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RepoStars count={repo.stars} />
        <RepoForks count={repo.forks} />
        <RepoWatchers count={repo.watchers} />
        <RepoLanguage language={repo.language} />
      </div>
    </div>
  );
}
*/

// Example 2: Issues page with empty state
/*
import { EmptyIssues } from '@/components/empty-states';
import { useQuery } from '@tanstack/react-query';

function IssuesPage() {
  const { data: issues = [], isLoading } = useQuery(['issues', repoId], () => fetchIssues(repoId));
  
  if (isLoading) return <div>Loading...</div>;
  
  if (issues.length === 0) {
    return (
      <EmptyIssues 
        onCreateClick={() => setShowCreateModal(true)}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {issues.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
*/

// Example 3: User profiles with loading state
/*
import { UserCard, UserCardSkeleton } from '@/components/cards';
import { useQuery } from '@tanstack/react-query';

function UserProfile() {
  const { data: user, isLoading } = useQuery(['user', userId], () => fetchUser(userId));
  
  return (
    <div className="max-w-md">
      {isLoading ? (
        <UserCardSkeleton />
      ) : (
        <UserCard 
          {...user}
          onFollowClick={() => toggleFollow(userId)}
          onMenuClick={() => showMenu(userId)}
        />
      )}
    </div>
  );
}
*/

export default {};
