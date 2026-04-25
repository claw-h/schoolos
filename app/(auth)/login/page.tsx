import { loginAction } from '@/app/auth-actions'

export const dynamic = 'force-dynamic'

type LoginPageProps = {
  searchParams?: {
    error?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : ''

  return (
    <>
      <div className="lekh-login-root">
        <div className="lekh-login-card">
          <div className="card-header">
            <span className="header-section-num">00 -</span>
            <span className="header-eyebrow">SchoolOS · Access Control</span>
          </div>

          <div className="card-title-block">
            <div className="card-display-title">
              SIGN <span>IN</span>
            </div>
            <div className="card-editorial">secure access for administrators, teachers and staff</div>
          </div>

          <form className="card-form" action={loginAction}>
            <div className="field-row">
              <label htmlFor="email" className="field-label">
                Email address
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@school.edu" className="field-input" />
            </div>

            <div className="field-row" style={{ marginTop: '1.25rem' }}>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="············" className="field-input" />
            </div>

            {error ? (
              <div className="error-row" style={{ marginTop: '1.25rem' }}>
                <span className="error-text">{error}</span>
              </div>
            ) : null}

            <div className="cta-block">
              <p className="cta-hint">Authentication is now routed through server actions and middleware-backed sessions.</p>
              <button type="submit" className="cta-btn">
                Sign in
              </button>
            </div>
          </form>

          <div className="card-footer">
            <span className="coord-stamp">India-first Grade 1-8 ERP</span>
            <span className="version-stamp">Phase 1</span>
          </div>
        </div>
      </div>
    </>
  )
}
