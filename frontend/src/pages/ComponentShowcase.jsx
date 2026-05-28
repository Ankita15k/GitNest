import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  EmptyRepository,
  EmptyIssues,
  EmptyPullRequests,
} from '../components/empty-states';
import {
  StatCard,
  RepoStars,
  RepoForks,
  RepoWatchers,
  RepoLanguage,
  UserCard,
  StatCardSkeleton,
  UserCardSkeleton,
} from '../components/cards';

const ComponentShowcase = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">GitNest Component Showcase</h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
          {/* Empty States Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Empty States</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-semibold mb-4">Empty Repository</h3>
                <EmptyRepository
                  showCreateButton={false}
                />
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-semibold mb-4">Empty Issues</h3>
                <EmptyIssues
                  showCreateButton={false}
                />
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-semibold mb-4">Empty Pull Requests</h3>
                <EmptyPullRequests
                  showCreateButton={false}
                />
              </div>
            </div>
          </section>

          {/* Stat Cards Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Stat Cards</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Repository Stats</h3>
                <div className="space-y-3">
                  <RepoStars count={1234} />
                  <RepoForks count={456} />
                  <RepoWatchers count={789} />
                  <RepoLanguage language="TypeScript" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Custom Stat Cards</h3>
                <div className="space-y-3">
                  <StatCard icon={Sun} label="Custom Stat" value="42" variant="primary" />
                  <StatCard icon={Moon} label="Another Stat" value="99" variant="success" />
                  <StatCard icon={Sun} label="Warning Stat" value="51" variant="warning" />
                  <StatCard icon={Moon} label="Danger Stat" value="0" variant="danger" />
                </div>
              </div>
            </div>
          </section>

          {/* Loading Skeletons Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Loading Skeletons</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Stat Card Skeleton</h3>
                <div className="space-y-3">
                  <StatCardSkeleton variant="default" />
                  <StatCardSkeleton variant="primary" />
                  <StatCardSkeleton variant="success" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">User Card Skeleton</h3>
                <UserCardSkeleton />
              </div>
            </div>
          </section>

          {/* User Card Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8">User Cards</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">User Card Example</h3>
                <UserCard
                  avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack"
                  username="jackdev"
                  fullName="Jack Developer"
                  bio="Full-stack developer | Open source enthusiast | Coffee lover ☕"
                  location="San Francisco, CA"
                  email="jack@gitnest.dev"
                  joinDate="Joined in May 2024"
                  followers={342}
                  following={156}
                  isFollowing={false}
                  onFollowClick={() => alert('Follow clicked!')}
                  onMenuClick={() => alert('Menu clicked!')}
                />
              </div>

              <div>
                <h3 className="font-semibold mb-4">User Card (Following)</h3>
                <UserCard
                  avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                  username="sarahcode"
                  fullName="Sarah Code"
                  bio="React specialist | UI/UX designer"
                  location="Austin, TX"
                  email="sarah@gitnest.dev"
                  joinDate="Joined in March 2024"
                  followers={1205}
                  following={89}
                  isFollowing={true}
                  onFollowClick={() => alert('Unfollow clicked!')}
                  onMenuClick={() => alert('Menu clicked!')}
                />
              </div>
            </div>
          </section>

          {/* Dark Mode Notes */}
          <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Dark Mode Support</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              All components in this showcase fully support both light and dark modes.
              Toggle the theme using the button in the header to see the components
              adapt to different color schemes.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Components are built using TailwindCSS with the <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">dark:</code> variant
              for proper dark mode styling.
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-600 dark:text-slate-400">
            <p>GitNest Component Showcase • All components support full dark mode</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ComponentShowcase;
