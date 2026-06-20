from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth / Users ----------
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    is_admin: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Products ----------
class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    short_description: str = ""
    description: str = ""
    price: float = Field(ge=0)
    weight_grams: int = Field(default=0, ge=0)
    stock: int = Field(default=0, ge=0)
    image_url: str = ""
    category: str = "Honey"
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    short_description: str | None = None
    description: str | None = None
    price: float | None = Field(default=None, ge=0)
    weight_grams: int | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)
    image_url: str | None = None
    category: str | None = None
    is_active: bool | None = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime


# ---------- Orders ----------
class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)
    shipping_name: str = Field(min_length=1, max_length=255)
    shipping_address: str = Field(min_length=1)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductOut


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    total: float
    shipping_name: str
    shipping_address: str
    created_at: datetime
    items: list[OrderItemOut]


# ---------- Articles ----------
class ArticleBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    excerpt: str = ""
    body: str = ""
    cover_image_url: str = ""
    tags: str = ""
    author: str = "The Golden Hive"
    published: bool = True


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: str | None = None
    excerpt: str | None = None
    body: str | None = None
    cover_image_url: str | None = None
    tags: str | None = None
    author: str | None = None
    published: bool | None = None


class ArticleOut(ArticleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
