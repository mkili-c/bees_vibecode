import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  const tags = article.tags
    ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <article className="card article-card">
      <Link to={`/learn/${article.slug}`} className="article-card__image">
        {article.cover_image_url ? (
          <img src={article.cover_image_url} alt={article.title} loading="lazy" />
        ) : (
          <div className="article-card__placeholder">📖</div>
        )}
      </Link>
      <div className="article-card__body">
        <div className="article-card__tags">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <h3>
          <Link to={`/learn/${article.slug}`}>{article.title}</Link>
        </h3>
        <p>{article.excerpt}</p>
        <Link to={`/learn/${article.slug}`} className="link-arrow">
          Read article →
        </Link>
      </div>
    </article>
  );
}
