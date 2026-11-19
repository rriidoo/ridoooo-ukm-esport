import { LogOut } from 'lucide-react';

// Only the authenticated user's profile is used for display.
// Authorization is checked separately against ridoooo_admin_users.
export default function AdminSidebarProfile({ adminUser, onLogout }) {
  const metadata = adminUser?.user_metadata || {};
  const profileName = [metadata.full_name, metadata.name, metadata.display_name]
    .find((value) => typeof value === 'string' && value.trim())?.trim();
  // If the account has no saved name, show its actual login email,
  // never a hard-coded sample administrator name.
  const name = profileName || adminUser?.email || 'Admin';
  const initials = profileName
    ? profileName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
    : (adminUser?.email?.split('@')[0].slice(0, 2).toUpperCase() || 'AD');

  return (
    <div className="beranda-sidebar__bottom">
      <div className="beranda-admin">
        <div className="beranda-admin__avatar" aria-hidden="true">{initials}</div>
        <div className="beranda-admin__copy">
          <strong title={name}>{name}</strong>
          <span>ADMIN</span>
        </div>
        <button type="button" className="beranda-admin__logout" onClick={onLogout} aria-label="Logout">
          <LogOut size={15} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
