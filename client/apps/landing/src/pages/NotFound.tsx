import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { paths } from '../routes/paths';

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="not-found-code">404</p>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to={paths.home}>
        <Button type="primary" size="large">
          Back to home
        </Button>
      </Link>
    </div>
  );
}
