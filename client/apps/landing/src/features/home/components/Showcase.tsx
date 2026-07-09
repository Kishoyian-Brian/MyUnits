import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { HomeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { paths } from '../../../routes/paths';

const listings = [
  {
    id: 1,
    title: 'Westlands Heights',
    location: 'Westlands, Nairobi',
    meta: '12 units · 92% occupied',
    price: 'Ksh 486,000 / month collected',
    tone: 'a',
  },
  {
    id: 2,
    title: 'Limuru Garden Flats',
    location: 'Limuru Town',
    meta: '8 units · 3 invoices due',
    price: 'Ksh 124,500 / month collected',
    tone: 'b',
  },
  {
    id: 3,
    title: 'Kiserian Court',
    location: 'Kiserian, PCEA Rd',
    meta: '6 units · All paid this month',
    price: 'Ksh 72,000 / month collected',
    tone: 'c',
  },
  {
    id: 4,
    title: 'South B Apartments',
    location: 'South B, Nairobi',
    meta: '15 units · 2 maintenance open',
    price: 'Ksh 612,000 / month collected',
    tone: 'd',
  },
];

export default function Showcase() {
  return (
    <section className="showcase-section" id="showcase">
      <div className="container">
        <div className="section-header section-header-left">
          <h2 className="section-title">Your portfolio at a glance</h2>
          <p className="section-subtitle">
            See occupancy, rent collection, and outstanding invoices in real
            time — for every property you manage.
          </p>
        </div>

        <div className="listing-grid">
          {listings.map((item) => (
            <article className="listing-card" key={item.id}>
              <div className={`listing-card-image tone-${item.tone}`}>
                <HomeOutlined className="listing-card-icon" />
              </div>
              <div className="listing-card-body">
                <h3 className="listing-card-title">{item.title}</h3>
                <p className="listing-card-location">{item.location}</p>
                <p className="listing-card-meta">{item.meta}</p>
                <p className="listing-card-price">{item.price}</p>
                <Link to={paths.register} className="listing-card-link">
                  View in dashboard <ArrowRightOutlined />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="showcase-footer-cta">
          <Link to={paths.register}>
            <Button type="primary" size="large">
              Add your first property
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
