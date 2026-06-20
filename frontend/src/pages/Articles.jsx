import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ArticleCard from "../components/ArticleCard.jsx";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    api
      .listArticles(params)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="container section">
      <div className="page-head">
        <h1>The Bee Journal</h1>
        <p>
          Guides, science, and stories about honey bees and the craft of
          beekeeping — written for curious minds and aspiring keepers alike.
        </p>
      </div>

      <div className="shop-toolbar">
        <span />
        <input
          className="input"
          type="search"
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="muted">Loading articles…</p>
      ) : articles.length === 0 ? (
        <p className="muted">No articles found.</p>
      ) : (
        <div className="grid grid--3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
