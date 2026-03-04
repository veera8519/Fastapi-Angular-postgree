from fastapi import FastAPI, Body
from typing import Optional

app = FastAPI()


BOOKS = [
    {"id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "year": 1925, "category": "science"},
    {"id": 2, "title": "To Kill a     Mockingbird", "author": "Harper Lee", "year": 1960, "category": "social"},
    {"id": 3, "title": "1984", "author": "George Orwell", "year": 1949, "category": "economic"},
    {"id": 4, "title": "Pride and Prejudice", "author": "Jane Austen", "year": 1813},
    {"id": 5, "title": "The Catcher in the Rye", "author": "J.D. Salinger", "year": 1951},
    {"id": 6, "title": "The Lord of the Rings", "author": "J.R.R. Tolkien", "year": 1954}
]


@app.get("/all-books")
def read_all_books():
    return BOOKS


@app.get("/books/mybook")
def read_mybook():
    return {"book_title": "My FAVA book!"}


@app.get("/books/title/{book_title}")
def read_book(book_title: str):
    for book in BOOKS:
        if (book.get("title") or "").casefold() == book_title.casefold():
            return book
    return {"error": "Book not found"}


@app.get("/books/")
def read_category_by_query(category: str):
    books_to_return = []
    for b in BOOKS:
        if (b.get("category") or "").casefold() == category.casefold():
            books_to_return.append(b)
    return books_to_return


@app.get("/books/author/")
def read_author_category_by_query(book_author: str, category: Optional[str] = None):
    books_to_return = []
    for b in BOOKS:
        if (b.get("author") or "").casefold() == book_author.casefold():
            if category is None or (b.get("category") or "").casefold() == category.casefold():
                books_to_return.append(b)
    return books_to_return


@app.post("/books/")
def create_book(book: dict = Body(...)):
    BOOKS.append(book)
    return {"status": "created", "book": book}

@app.put("/books/{book_id}")
def update_book(book_id: int, updated_book: dict = Body(...)):
    for b in BOOKS:
        if b.get("id") == book_id:
            b.update(updated_book)
            return {"status": "updated", "book": b}                         
    return {"error": "book not found"}

@app.delete("/books/delee_book/{book_id}")
def delete_book(book_id: int):
    for i in range(len(BOOKS)):
        if BOOKS[i].get("id") == book_id:
            deleted_book = BOOKS.pop(i)
            return {"status": "deleted", "book": deleted_book}
