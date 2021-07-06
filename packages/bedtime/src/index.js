import Router from 'preact-router';
import App from './components/app';
import { HASH_ID_ROUTE, ID_ROUTE } from './routes';

import './index.css';

const Index = () => (
  <Router>
    <App path={ID_ROUTE} />
    <App path={HASH_ID_ROUTE} />
    <App default />
  </Router>
)

export default Index;