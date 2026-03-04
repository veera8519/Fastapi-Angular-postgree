from fastapi import FastAPI,Depends

from typing import Annotated
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models

from database import engine,Base,SessionLocal

app=FastAPI()

Base.metadata.create_all(bind=engine)

# Pydantic models for request bodies
class BookCreate(BaseModel):
    title: str
    description: str
    author: str
    rating: int
    publish_year: int

class BookUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    author: str | None = None
    rating: int | None = None
    publish_year: int | None = None


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_depends=Annotated[Session,Depends(get_db)]


@app.get("/")
def read_ALL(db:db_depends):
    return db.query(models.BooksTable).all()


@app.get("/books/{book_id}")
def read_book(book_id:int,db:db_depends):
    return db.query(models.BooksTable).filter(models.BooksTable.id==book_id).first()


@app.post("/books")
def create_book(book:BookCreate, db:db_depends):
    new_book = models.BooksTable(
        title=book.title,
        description=book.description,
        author=book.author,
        rating=book.rating,
        publish_year=book.publish_year
    )
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


@app.put("/books/{book_id}")
def update_book(book_id:int, book:BookUpdate, db:db_depends):
    existing_book = db.query(models.BooksTable).filter(models.BooksTable.id==book_id).first()
    if not existing_book:
        return {"error": "Book not found"}
    
    if book.title is not None:
        existing_book.title = book.title
    if book.description is not None:
        existing_book.description = book.description
    if book.author is not None:
        existing_book.author = book.author
    if book.rating is not None:
        existing_book.rating = book.rating
    if book.publish_year is not None:
        existing_book.publish_year = book.publish_year
    
    db.commit()
    db.refresh(existing_book)
    return existing_book


@app.delete("/books/{book_id}")
def delete_book(book_id:int, db:db_depends):
    book = db.query(models.BooksTable).filter(models.BooksTable.id==book_id).first()
    if not book:
        return {"error": "Book not found"}
    
    db.delete(book)
    db.commit()
    return {"message": "Book deleted successfully"}
