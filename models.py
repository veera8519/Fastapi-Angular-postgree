

from database import Base

from sqlalchemy import Column,Integer,String,Float

class BooksTable(Base):
    __tablename__="booksTable"
    id=Column(Integer,primary_key=True,index=True)
    title=Column(String)
    description=Column(String)
    author=Column(String)
    rating=Column(Integer)
    published_date=Column(Integer)

        

 
