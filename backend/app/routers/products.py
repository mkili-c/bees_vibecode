from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..models import Product, User
from ..schemas import ProductCreate, ProductOut, ProductUpdate
from ..security import slugify

router = APIRouter(prefix="/api/products", tags=["products"])


def _unique_slug(db: Session, name: str) -> str:
    base = slugify(name)
    slug = base
    i = 2
    while db.scalar(select(Product).where(Product.slug == slug)):
        slug = f"{base}-{i}"
        i += 1
    return slug


@router.get("", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    include_inactive: bool = Query(default=False),
):
    stmt = select(Product)
    if not include_inactive:
        stmt = stmt.where(Product.is_active.is_(True))
    if category:
        stmt = stmt.where(Product.category == category)
    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(Product.name.ilike(like))
    stmt = stmt.order_by(Product.created_at.desc())
    return list(db.scalars(stmt).all())


@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Product.category).where(Product.is_active.is_(True)).distinct()
    ).all()
    return sorted(r for r in rows if r)


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ---------- Admin management ----------
@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    product = Product(**payload.model_dump(), slug=_unique_slug(db, payload.name))
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(product, key, value)
    if "name" in data:
        product.slug = _unique_slug(db, product.name)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
