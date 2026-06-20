import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="container section about">
      <div className="page-head">
        <h1>Our Story</h1>
        <p>A small family apiary with a big love for bees.</p>
      </div>

      <div className="about__grid">
        <div className="prose">
          <p>
            The Golden Hive began with a single hive at the bottom of the garden and
            a fascination that quickly turned into a way of life. Today we tend a
            modest collection of colonies across wildflower meadows and orchards,
            harvesting honey only when the bees have more than enough for
            themselves.
          </p>
          <h2>How we keep our bees</h2>
          <p>
            We practise gentle, bee-first beekeeping. That means minimal
            intervention, no routine chemical treatments where we can avoid them,
            and always leaving the colony with ample honey stores for winter. Healthy
            bees make wonderful honey — it really is that simple.
          </p>
          <h2>Why we share what we learn</h2>
          <p>
            Bees are extraordinary, and the more people understand them, the better
            we can protect them. Alongside the shop, we publish guides and articles
            in our <Link to="/learn">Bee Journal</Link> for anyone curious about
            these remarkable insects — whether you're thinking of keeping bees
            yourself or simply want to help them thrive.
          </p>
        </div>
        <aside className="about__facts card">
          <h3>At a glance</h3>
          <ul className="facts">
            <li><strong>🐝 ~12</strong> colonies</li>
            <li><strong>🌼 100%</strong> raw, unfiltered honey</li>
            <li><strong>📍</strong> Wildflower meadows & orchards</li>
            <li><strong>♻️</strong> Reusable, recyclable packaging</li>
          </ul>
          <Link to="/shop" className="btn btn--block">Visit the shop</Link>
        </aside>
      </div>
    </div>
  );
}
