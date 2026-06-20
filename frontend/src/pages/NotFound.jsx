import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container section center">
      <div className="empty">
        <div className="empty__icon">🐝</div>
        <h1>Lost in the meadow</h1>
        <p className="muted">
          The page you're looking for has buzzed off somewhere else.
        </p>
        <Link to="/" className="btn btn--lg">Back home</Link>
      </div>
    </div>
  );
}
