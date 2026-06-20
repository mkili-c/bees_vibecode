import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import Markdown from "../components/Markdown.jsx";
import { formatDate } from "../utils/format.js";

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setArticle(null);
    setError("");
    api
      .getArticle(slug)
      .then(setArticle)
      .catch(() => setError("Sorry, we couldn't find that article."));
  }, [slug]);

  if (error)
    return (
      <div className="container section">
        <p className="muted">{error}</p>
        <Link to="/learn" className="link-arrow">← Back to the journal</Link>
      </div>
    );

  if (!article) return <div className="container section">Loading…</div>;

  const tags = article.tags
    ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <article className="article-view">
      {article.cover_image_url && (
        <div className="article-view__cover">
          <img src={article.cover_image_url} alt={article.title} />
        </div>
      )}
      <div className="container article-view__body">
        <Link to="/learn" className="link-arrow back">← Back to the journal</Link>
        <div className="article-card__tags">
          {tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <h1>{article.title}</h1>
        <p className="article-view__meta">
          By {article.author} · {formatDate(article.created_at)}
        </p>
        <p className="article-view__excerpt">{article.excerpt}</p>
        <Markdown content={article.body} />
      </div>
    </article>
  );
}
