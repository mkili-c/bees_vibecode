"""Populate the database with an admin user, honey products, and bee articles.

Idempotent: running it again will not create duplicates.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Article, Product, User
from .security import hash_password, slugify

ADMIN_EMAIL = "admin@goldenhive.com"
ADMIN_PASSWORD = "beekeeper123"


PRODUCTS = [
    {
        "name": "Wildflower Honey",
        "short_description": "Raw, unfiltered honey from summer meadow blooms.",
        "description": (
            "Our signature Wildflower Honey is gathered from hives set among "
            "untouched summer meadows. Each jar captures the nectar of dozens of "
            "wild blossoms, giving a rich amber colour and a balanced, floral "
            "sweetness. Raw and unfiltered, it retains all the natural pollen, "
            "enzymes, and antioxidants the bees worked so hard to create."
        ),
        "price": 12.50,
        "weight_grams": 500,
        "stock": 40,
        "category": "Honey",
        "image_url": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
    },
    {
        "name": "Acacia Honey",
        "short_description": "Delicate, light and slow to crystallise.",
        "description": (
            "Acacia Honey is prized for its pale colour and exceptionally mild, "
            "almost vanilla-like flavour. High in fructose, it stays liquid far "
            "longer than most honeys, making it perfect for sweetening tea or "
            "drizzling over yoghurt and fresh fruit."
        ),
        "price": 15.00,
        "weight_grams": 500,
        "stock": 25,
        "category": "Honey",
        "image_url": "https://images.unsplash.com/photo-1558642891-54be180ea339?w=800&q=80",
    },
    {
        "name": "Chestnut Honey",
        "short_description": "Bold, dark and pleasantly bitter.",
        "description": (
            "For those who love a strong character, Chestnut Honey delivers a "
            "dark, intense flavour with a distinctive bitter edge. Robust and "
            "aromatic, it pairs beautifully with aged cheeses and cured meats."
        ),
        "price": 14.00,
        "weight_grams": 500,
        "stock": 18,
        "category": "Honey",
        "image_url": "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&q=80",
    },
    {
        "name": "Raw Honeycomb",
        "short_description": "Pure comb straight from the hive.",
        "description": (
            "A piece of honeycomb is honey in its most natural form: sweet honey "
            "still sealed inside the beeswax cells the colony built. Chew the comb "
            "to release the honey, or cut it onto a cheese board for a "
            "show-stopping centrepiece."
        ),
        "price": 18.00,
        "weight_grams": 350,
        "stock": 12,
        "category": "Honey",
        "image_url": "https://images.unsplash.com/photo-1601063476271-a159c71ab0b3?w=800&q=80",
    },
    {
        "name": "Beeswax Candles (Set of 3)",
        "short_description": "Hand-poured, naturally golden, clean-burning.",
        "description": (
            "Made from 100% pure beeswax rendered in our own apiary, these "
            "hand-poured candles burn cleanly with a warm, honey-scented glow. "
            "Beeswax burns longer than paraffin and releases no synthetic fumes."
        ),
        "price": 22.00,
        "weight_grams": 300,
        "stock": 30,
        "category": "Hive Products",
        "image_url": "https://images.unsplash.com/photo-1602178141046-d4ad1c0f41b7?w=800&q=80",
    },
    {
        "name": "Propolis Tincture",
        "short_description": "Natural propolis extract, 30ml dropper bottle.",
        "description": (
            "Propolis is the resinous 'bee glue' that colonies use to seal and "
            "protect the hive. Traditionally valued for its supportive properties, "
            "our tincture is a concentrated extract in a convenient dropper "
            "bottle. (Not a medicine; for wellbeing use.)"
        ),
        "price": 16.50,
        "weight_grams": 30,
        "stock": 22,
        "category": "Hive Products",
        "image_url": "https://images.unsplash.com/photo-1550411294-56f7d0c0e1f0?w=800&q=80",
    },
]


ARTICLES = [
    {
        "title": "Getting Started with Beekeeping: A Beginner's Guide",
        "excerpt": (
            "Thinking of keeping bees? Here is everything a first-year beekeeper "
            "needs to know, from choosing a hive to your first inspection."
        ),
        "tags": "beginners, guide, equipment",
        "cover_image_url": "https://images.unsplash.com/photo-1568526381923-caf3fd520382?w=1200&q=80",
        "body": (
            "## Why Keep Bees?\n\n"
            "Beekeeping is one of the most rewarding ways to connect with nature. "
            "A single healthy colony pollinates gardens for miles around and can "
            "produce 10–25 kg of surplus honey in a good year. Beyond the honey, "
            "many keepers find the rhythm of hive work deeply calming.\n\n"
            "## Choosing Your First Hive\n\n"
            "The two most common designs for beginners are the **Langstroth** "
            "hive, with its stackable boxes and removable frames, and the "
            "**National** hive popular in the UK. Both make inspection easy and "
            "are well supported by equipment suppliers.\n\n"
            "## Essential Equipment\n\n"
            "- A bee suit and gloves\n"
            "- A smoker to keep the colony calm\n"
            "- A hive tool for prising frames apart\n"
            "- A bee brush\n\n"
            "## Your First Inspection\n\n"
            "On a calm, sunny day, light your smoker and gently puff a little "
            "smoke at the entrance. Work slowly, lifting one frame at a time, and "
            "look for the queen, eggs, larvae, and capped brood. A good "
            "inspection answers one question: *is the colony healthy and "
            "growing?*"
        ),
    },
    {
        "title": "Understanding the Life of the Honey Bee Colony",
        "excerpt": (
            "A colony is a single superorganism made of thousands of individuals. "
            "Meet the queen, the workers, and the drones."
        ),
        "tags": "biology, colony, education",
        "cover_image_url": "https://images.unsplash.com/photo-1559814049-c9d8ef1d9c44?w=1200&q=80",
        "body": (
            "## One Colony, Three Castes\n\n"
            "A honey bee colony is best understood as a single living organism. "
            "It is made up of three castes, each with a distinct role.\n\n"
            "### The Queen\n\n"
            "There is normally just one queen per colony. Her job is to lay "
            "eggs — up to 2,000 a day at the height of summer — and to hold the "
            "colony together with her pheromones.\n\n"
            "### The Workers\n\n"
            "Workers are sterile females and make up the vast majority of the "
            "colony. Over her short life a worker moves through a sequence of "
            "jobs: cleaning cells, nursing brood, building comb, guarding the "
            "entrance, and finally foraging for nectar and pollen.\n\n"
            "### The Drones\n\n"
            "Drones are the males. Their single purpose is to mate with a young "
            "queen. As autumn approaches and resources tighten, the workers expel "
            "the drones from the hive."
        ),
    },
    {
        "title": "From Flower to Jar: How Honey Is Made",
        "excerpt": (
            "Honey is the result of an astonishing collective effort. Follow a "
            "drop of nectar on its journey from blossom to your breakfast table."
        ),
        "tags": "honey, production, education",
        "cover_image_url": "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?w=1200&q=80",
        "body": (
            "## Foraging\n\n"
            "It begins with a forager bee visiting hundreds of flowers, sipping "
            "nectar into a special 'honey stomach'. To make just 500g of honey, "
            "the colony's foragers collectively visit around two million "
            "flowers.\n\n"
            "## Ripening\n\n"
            "Back at the hive, the nectar is passed mouth-to-mouth between worker "
            "bees, which add enzymes that break down complex sugars. The bees "
            "then fan the nectar with their wings to evaporate water until the "
            "moisture content drops below about 18%.\n\n"
            "## Capping\n\n"
            "Once the honey is ripe, the bees seal each cell with a thin cap of "
            "beeswax. This is the signal to the beekeeper that the honey is ready "
            "to harvest — though we always leave plenty for the bees themselves."
        ),
    },
    {
        "title": "Why Bees Matter: Pollination and Our Food",
        "excerpt": (
            "Roughly one in three mouthfuls of the food we eat depends on "
            "pollinators. Here's why protecting bees protects us."
        ),
        "tags": "environment, pollination, conservation",
        "cover_image_url": "https://images.unsplash.com/photo-1444465693019-aa0b6392460d?w=1200&q=80",
        "body": (
            "## The Pollination Service\n\n"
            "As bees move from flower to flower collecting nectar, they transfer "
            "pollen and fertilise plants. This free service underpins the "
            "production of apples, almonds, berries, melons, and countless other "
            "crops.\n\n"
            "## A Worrying Decline\n\n"
            "Habitat loss, pesticides, disease, and climate change have all put "
            "pressure on both wild and managed bees. Declines in pollinators "
            "threaten biodiversity and food security alike.\n\n"
            "## How You Can Help\n\n"
            "- Plant a variety of native, flowering plants\n"
            "- Avoid using pesticides in your garden\n"
            "- Leave a patch of your lawn to grow wild\n"
            "- Buy honey from local, responsible beekeepers\n\n"
            "Every small action adds up to a friendlier world for bees."
        ),
    },
]


def run_seed(db: Session) -> None:
    # Admin user
    admin = db.scalar(select(User).where(User.email == ADMIN_EMAIL))
    if not admin:
        admin = User(
            email=ADMIN_EMAIL,
            full_name="Hive Administrator",
            hashed_password=hash_password(ADMIN_PASSWORD),
            is_admin=True,
        )
        db.add(admin)
        print(f"  + created admin user: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")

    # Products
    for data in PRODUCTS:
        slug = slugify(data["name"])
        if not db.scalar(select(Product).where(Product.slug == slug)):
            db.add(Product(**data, slug=slug))
            print(f"  + product: {data['name']}")

    # Articles
    for data in ARTICLES:
        slug = slugify(data["title"])
        if not db.scalar(select(Article).where(Article.slug == slug)):
            db.add(Article(**data, slug=slug))
            print(f"  + article: {data['title']}")

    db.commit()


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Seeding database...")
        run_seed(db)
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
