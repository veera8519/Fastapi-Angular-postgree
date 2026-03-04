from fastapi import FastAPI,Depends

from typing import Annotated
from sqlalchemy.orm import Session

import models

from database import engine,Base,SessionLocal

app=FastAPI()

Base.metadata.create_all(bind=engine)


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_depends=Annotated[Session,Depends(get_db)]


@app.get("/")
def read_ALL(db:db_depends):
    return db.query(models.BookTable).all()


@app.get("/books/{book_id}")
def read_get_BOOK_BY_ID(db:db_depends,book_id:int):
     book=db.query(models.BookTable).filter(models.BookTable.id==book_id).first()
     if book is not None:
         return book
     raise HTTPException(status_code=404,detail="Book not found")