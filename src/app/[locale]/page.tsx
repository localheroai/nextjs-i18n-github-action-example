import {useTranslations} from 'next-intl';

const TEAM_NAME = 'Northwind Studio';
const SEATS_LEFT = 2;
const ROLES = ['admin', 'editor', 'viewer'] as const;

type Role = (typeof ROLES)[number];

const MEMBERS: {name: string; email: string; role: Role; isYou?: boolean}[] = [
  {name: 'Alva Berg', email: 'alva@northwind.example', role: 'admin', isYou: true},
  {name: 'Jonas Weber', email: 'jonas@northwind.example', role: 'admin'},
  {name: 'Zofia Nowak', email: 'zofia@northwind.example', role: 'editor'},
  {name: 'Sam Carter', email: 'sam@northwind.example', role: 'editor'},
  {name: 'Ingrid Holm', email: 'ingrid@northwind.example', role: 'viewer'}
];

export default function TeamSettingsPage() {
  const t = useTranslations('TeamSettings');

  return (
    <main>
      <header>
        <h1>{t('title')}</h1>
        <p>{t('description', {teamName: TEAM_NAME})}</p>
      </header>

      <section>
        <h2>
          {t('members.heading')}{' '}
          <span className="count">{t('memberCount', {count: MEMBERS.length})}</span>
        </h2>
        <ul className="members">
          {MEMBERS.map((member) => (
            <li key={member.email}>
              <div>
                <strong>{member.name}</strong>
                {member.isYou && <span className="badge">{t('members.you')}</span>}
                <div className="muted">{member.email}</div>
              </div>
              <span>{t(`roles.${member.role}`)}</span>
              {!member.isYou && (
                <button type="button" className="secondary">
                  {t('members.remove')}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t('invite.heading')}</h2>
        <p className="muted">{t('invite.seatsLeft', {count: SEATS_LEFT})}</p>
        <form className="invite">
          <label>
            {t('invite.emailLabel')}
            <input
              type="email"
              name="email"
              placeholder={t('invite.emailPlaceholder')}
              required
            />
          </label>
          <label>
            {t('invite.roleLabel')}
            <select name="role" defaultValue="editor">
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`roles.${role}`)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">{t('invite.submit')}</button>
        </form>
      </section>
    </main>
  );
}
