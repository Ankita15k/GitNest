import { MapPin, Mail, Calendar, MoreVertical } from 'lucide-react';

const UserCard = ({
  avatar,
  username,
  fullName,
  bio,
  location,
  email,
  joinDate,
  followers = 0,
  following = 0,
  isFollowing = false,
  onFollowClick = null,
  onMenuClick = null,
  className = '',
}) => {
  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden ${className}`}>
      {/* Header background */}
      <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600" />

      <div className="px-6 pb-6">
        {/* Avatar & header content */}
        <div className="flex items-start gap-4 -mt-12 mb-4">
          {avatar && (
            <img
              src={avatar}
              alt={username}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 object-cover"
            />
          )}
          
          <div className="flex-1 pt-4">
            <div className="flex items-start justify-between">
              <div>
                {fullName && (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {fullName}
                  </h3>
                )}
                {username && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    @{username}
                  </p>
                )}
              </div>
              
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {bio}
          </p>
        )}

        {/* Location, email, join date */}
        <div className="flex flex-col gap-2 mb-4 text-sm">
          {location && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{location}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {joinDate && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{joinDate}</span>
            </div>
          )}
        </div>

        {/* Followers / Following stats */}
        <div className="flex gap-6 mb-4 py-3 border-t border-b border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {followers}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {following}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Following</p>
          </div>
        </div>

        {/* Follow button */}
        {onFollowClick && (
          <button
            onClick={onFollowClick}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isFollowing
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
                : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
