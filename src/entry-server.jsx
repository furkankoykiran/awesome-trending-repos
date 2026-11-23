import { renderToString } from 'react-dom/server';
import App from './App.jsx';

export function render(data, feed, history) {
  return renderToString(<App initialData={data} initialFeed={feed} initialHistory={history} />);
}
