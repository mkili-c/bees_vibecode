import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import ArticleCard from "../components/ArticleCard.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.listProducts().then((p) => setProducts(p.slice(0, 3))).catch(() => {});
    api.listArticles().then((a) => setArticles(a.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="hero__eyebrow">🐝 From our hives to your table</span>
            <h1>Pure, raw honey — straight from the bees.</h1>
            <p>
              We are a small family apiary on a simple mission: keep healthy bees,
              harvest honey gently, and share what we learn along the way. Taste the
              difference of truly raw honey, and dive into our world of bees.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--lg">Shop honey</Link>
              <Link to="/learn" className="btn btn--lg btn--ghost">
                Learn about bees
              </Link>
            </div>
          </div>
          <div className="hero__art" aria-hidden>
            <div className="hero__jar">🍯</div>
          </div>
        </div>
      </section>

      <section className="features container">
        <div className="feature">
          <div className="feature__icon">🌼</div>
          <h3>Raw & unfiltered</h3>
          <p>Never heat-treated, so all the natural pollen and enzymes stay intact.</p>
        </div>
        <div className="feature">
          <div className="feature__icon">🐝</div>
          <h3>Bee-first beekeeping</h3>
          <p>We always leave plenty of honey for the colony to thrive through winter.</p>
        </div>
        <div className="feature">
          <div className="feature__icon">📦</div>
          <h3>Shipped with care</h3>
          <p>Carefully packed and dispatched within two working days of your order.</p>
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Fresh from the shop</h2>
          <Link to="/shop" className="link-arrow">View all →</Link>
        </div>
        <div className="grid grid--3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="banner">
        <div className="container banner__inner">
          <h2>One in three bites of food depends on pollinators.</h2>
          <p>
            Every jar you buy supports responsible beekeeping and the bees that keep
            our world blooming.
          </p>
          <Link to="/learn/why-bees-matter-pollination-and-our-food" className="btn btn--lg">
            Why bees matter
          </Link>
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>From the journal</h2>
          <Link to="/learn" className="link-arrow">All articles →</Link>
        </div>
        <div className="grid grid--3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </>
  );
}
