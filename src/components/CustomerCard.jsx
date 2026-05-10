const CATEGORY_COLORS = {
  'Truyền Hình': '#3b82f6',
  'Phim Truyện': '#8b5cf6',
  'Thể Thao':    '#10b981',
  'Thiếu Nhi':   '#f59e0b',
  'Giải Trí':    '#ec4899',
}

export default function CustomerCard({ data }) {
  const categories = [
    { label: 'Truyền Hình', value: data.total_truyen_hinh },
    { label: 'Phim Truyện', value: data.total_phim_truyen },
    { label: 'Thể Thao',    value: data.total_the_thao },
    { label: 'Thiếu Nhi',   value: data.total_thieu_nhi },
    { label: 'Giải Trí',    value: data.total_giai_tri },
  ].filter(c => c.value)

  const maxVal = Math.max(...categories.map(c => c.value), 1)

  const initials = data.full_name
    ?.split(' ')
    .map(w => w[0])
    .slice(-2)
    .join('')
    .toUpperCase() || '?'

  const isActive = data.is_active

  return (
    <div className="card">

      {/* ── Hero ── */}
      <div className="card-hero">
        <div className="hero-content">
          <div className="avatar">{initials}</div>
          <div>
            <div className="hero-name">{data.full_name}</div>
            <div className="hero-chips">
              <span className="chip city">📍 {data.city}</span>
              <span className="chip package">📦 {data.package}</span>
              <span className={`chip ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? '● Đang hoạt động' : '● Không hoạt động'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Thông tin cá nhân ── */}
      <section className="section">
        <div className="section-title">
          <span className="icon">👤</span> Thông tin cá nhân
        </div>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Tuổi</span>
            <span className="value">{data.age}</span>
          </div>
          <div className="info-item">
            <span className="label">Giới tính</span>
            <span className="value">{data.gender}</span>
          </div>
          <div className="info-item">
            <span className="label">Ngày tham gia</span>
            <span className="value">{data.joined_date}</span>
          </div>
          <div className="info-item">
            <span className="label">Mã khách hàng</span>
            <span className="value" style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
              {data.user_id}
            </span>
          </div>
        </div>
      </section>

      {/* ── Hành vi tìm kiếm ── */}
      <section className="section">
        <div className="section-title">
          <span className="icon">🔍</span> Hành vi tìm kiếm
        </div>
        <div className="search-grid">
          <div className="month-box">
            <div className="month-label">Tháng 6</div>
            <div className="keyword">{data.most_search_t6 || '—'}</div>
            <div className="category-tag">{data.category_t6 || '—'}</div>
          </div>

          <div className="arrow">→</div>

          <div className="month-box">
            <div className="month-label">Tháng 7</div>
            <div className="keyword">{data.most_search_t7 || '—'}</div>
            <div className="category-tag">{data.category_t7 || '—'}</div>
          </div>

          <div className="result-box">
            <div className={`type-badge ${data.search_type === 'Same' ? 'same' : 'changed'}`}>
              {data.search_type === 'Same' ? '↔ Giữ nguyên' : '↕ Đổi trend'}
            </div>
            <div className="group-label">{data.search_group || '—'}</div>
          </div>
        </div>
      </section>

      {/* ── Hành vi xem nội dung ── */}
      <section className="section">
        <div className="section-title">
          <span className="icon">📺</span> Hành vi xem nội dung
        </div>

        <div className="content-summary">
          <div className="stat-chip">
            <span className="label">Xem nhiều nhất</span>
            <span className="value">{data.most_watch || '—'}</span>
          </div>
          <div className="stat-chip">
            <span className="label">Sở thích</span>
            <span className="value">{data.taste || '—'}</span>
          </div>
          <div className="stat-chip">
            <span className="label">Mức độ hoạt động</span>
            <span className={`value ${data.active === 'High' ? 'active-high' : 'active-low'}`}>
              {data.active === 'High' ? '▲ Cao' : '▼ Thấp'}
            </span>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="bar-chart">
            {categories.map(c => (
              <div key={c.label} className="bar-row">
                <span className="bar-label">{c.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(c.value / maxVal) * 100}%`,
                      background: CATEGORY_COLORS[c.label] || '#3b82f6',
                    }}
                  />
                </div>
                <span className="bar-value">{c.value?.toLocaleString()}s</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
