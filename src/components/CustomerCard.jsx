export default function CustomerCard({ data }) {
  const categories = [
    { label: 'Truyền Hình', value: data.total_truyen_hinh, color: '#4f86c6' },
    { label: 'Phim Truyện', value: data.total_phim_truyen, color: '#e07b54' },
    { label: 'Thể Thao',    value: data.total_the_thao,    color: '#5cb85c' },
    { label: 'Thiếu Nhi',   value: data.total_thieu_nhi,   color: '#f0ad4e' },
    { label: 'Giải Trí',    value: data.total_giai_tri,    color: '#9b59b6' },
  ].filter(c => c.value)

  const maxVal = Math.max(...categories.map(c => c.value), 1)

  return (
    <div className="card">

      {/* ── Thông tin cá nhân ── */}
      <section className="section">
        <h2>Thông tin cá nhân</h2>
        <div className="info-grid">
          <div className="info-item"><span className="label">Họ tên</span><span>{data.full_name}</span></div>
          <div className="info-item"><span className="label">Tuổi</span><span>{data.age}</span></div>
          <div className="info-item"><span className="label">Giới tính</span><span>{data.gender}</span></div>
          <div className="info-item"><span className="label">Thành phố</span><span>{data.city}</span></div>
          <div className="info-item"><span className="label">Gói cước</span><span className="badge">{data.package}</span></div>
          <div className="info-item"><span className="label">Ngày tham gia</span><span>{data.joined_date}</span></div>
          <div className="info-item"><span className="label">Trạng thái</span>
            <span className={`badge ${data.is_active ? 'active' : 'inactive'}`}>
              {data.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Hành vi tìm kiếm ── */}
      <section className="section">
        <h2>Hành vi tìm kiếm</h2>
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
            <span className={`type-badge ${data.search_type === 'Same' ? 'same' : 'changed'}`}>
              {data.search_type || '—'}
            </span>
            <div className="group-label">{data.search_group || '—'}</div>
          </div>
        </div>
      </section>

      {/* ── Hành vi xem nội dung ── */}
      <section className="section">
        <h2>Hành vi xem nội dung</h2>
        <div className="content-summary">
          <div className="info-item"><span className="label">Xem nhiều nhất</span><span className="badge">{data.most_watch || '—'}</span></div>
          <div className="info-item"><span className="label">Sở thích</span><span>{data.taste || '—'}</span></div>
          <div className="info-item"><span className="label">Mức độ hoạt động</span>
            <span className={`badge ${data.active === 'High' ? 'active' : 'inactive'}`}>{data.active || '—'}</span>
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
                    style={{ width: `${(c.value / maxVal) * 100}%`, background: c.color }}
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
