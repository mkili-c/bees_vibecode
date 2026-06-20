from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..models import Article, User
from ..schemas import ArticleCreate, ArticleOut, ArticleUpdate
from ..security import slugify

router = APIRouter(prefix="/api/articles", tags=["articles"])


def _unique_slug(db: Session, title: str) -> str:
    base = slugify(title)
    slug = base
    i = 2
    while db.scalar(select(Article).where(Article.slug == slug)):
        slug = f"{base}-{i}"
        i += 1
    return slug


@router.get("", response_model=list[ArticleOut])
def list_articles(
    db: Session = Depends(get_db),
    tag: str | None = Query(default=None),
    search: str | None = Query(default=None),
    include_unpublished: bool = Query(default=False),
):
    stmt = select(Article)
    if not include_unpublished:
        stmt = stmt.where(Article.published.is_(True))
    if tag:
        stmt = stmt.where(Article.tags.ilike(f"%{tag}%"))
    if search:
        stmt = stmt.where(Article.title.ilike(f"%{search}%"))
    stmt = stmt.order_by(Article.created_at.desc())
    return list(db.scalars(stmt).all())


@router.get("/{slug}", response_model=ArticleOut)
def get_article(slug: str, db: Session = Depends(get_db)):
    article = db.scalar(select(Article).where(Article.slug == slug))
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


# ---------- Admin management ----------
@router.post("", response_model=ArticleOut, status_code=status.HTTP_201_CREATED)
def create_article(
    payload: ArticleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    article = Article(**payload.model_dump(), slug=_unique_slug(db, payload.title))
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.put("/{article_id}", response_model=ArticleOut)
def update_article(
    article_id: int,
    payload: ArticleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(article, key, value)
    if "title" in data:
        article.slug = _unique_slug(db, article.title)
    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(article)
    db.commit()
