from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware

from typing import Annotated
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models

from database import engine,Base,SessionLocal



app=FastAPI()

# CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_depends=Annotated[Session,Depends(get_db)]

# Pydantic models
class BookBase(BaseModel):
    id: int
    title: str
    author: str
    description: str = ""
    rating: int = 0
    published_year: int = 2024

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: str = ""
    author: str = ""
    description: str = ""
    rating: int = 0
    published_year: int = 2024

@app.get("/")
def read_ALL(db:db_depends):
    return db.query(models.BooksTable).all()

@app.get("/all-books")
def read_all_books(db:db_depends):
    return db.query(models.BooksTable).all()

@app.get("/books/{book_id}")
def read_book(book_id:int,db:db_depends):
    return db.query(models.BooksTable).filter(models.BooksTable.id==book_id).first()

@app.post("/books/")
def create_book(book: BookCreate, db: db_depends):
    db_book = models.BooksTable(
        id=book.id,
        title=book.title,
        description=book.description,
        author=book.author,
        rating=book.rating,
        published_year=book.published_year
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@app.put("/books/{book_id}")
def update_book(book_id: int, book: BookUpdate, db: db_depends):
    db_book = db.query(models.BooksTable).filter(models.BooksTable.id == book_id).first()
    if db_book:
        if book.title:
            db_book.title = book.title
        if book.author:
            db_book.author = book.author
        if book.description:
            db_book.description = book.description
        if book.rating:
            db_book.rating = book.rating
        if book.published_year:
            db_book.published_year = book.published_year
        db.commit()
        db.refresh(db_book)
        return db_book
    return {"message": "Book not found"}

@app.delete("/books/{book_id}")
def delete_book(book_id:int,db:db_depends):
    book=db.query(models.BooksTable).filter(models.BooksTable.id==book_id).first()
    if book:
        db.delete(book)
        db.commit()
        return {"message":"Book deleted successfully"}
    else:
        return {"message":"Book not found"}

