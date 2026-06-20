from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_current_admin, get_current_user
from ..models import Order, OrderItem, Product, User
from ..schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Place an order. Validates stock, snapshots prices, and decrements inventory."""
    order = Order(
        user_id=user.id,
        shipping_name=payload.shipping_name,
        shipping_address=payload.shipping_address,
        status="pending",
    )
    total = 0.0
    for line in payload.items:
        product = db.get(Product, line.product_id)
        if not product or not product.is_active:
            raise HTTPException(
                status_code=400, detail=f"Product {line.product_id} is unavailable."
            )
        if product.stock < line.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for '{product.name}'. "
                f"Available: {product.stock}.",
            )
        product.stock -= line.quantity
        total += product.price * line.quantity
        order.items.append(
            OrderItem(
                product_id=product.id,
                quantity=line.quantity,
                unit_price=product.price,
            )
        )
    order.total = round(total, 2)
    db.add(order)
    db.commit()

    # Re-load with relationships eagerly for the response.
    order = db.scalar(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
    )
    return order


@router.get("", response_model=list[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    orders = db.scalars(
        select(Order)
        .where(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .options(selectinload(Order.items).selectinload(OrderItem.product))
    ).all()
    return list(orders)


@router.get("/all", response_model=list[OrderOut])
def all_orders(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    orders = db.scalars(
        select(Order)
        .order_by(Order.created_at.desc())
        .options(selectinload(Order.items).selectinload(OrderItem.product))
    ).all()
    return list(orders)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.scalar(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
    )
    if not order or (order.user_id != user.id and not user.is_admin):
        raise HTTPException(status_code=404, detail="Order not found")
    return order
