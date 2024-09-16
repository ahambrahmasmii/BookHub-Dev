from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import pymysql.cursors
from database import get_db_connection
from models import Book
from events.publisher import publish_event

router = APIRouter()

# Endpoint to get all books
@router.get('/books')
async def get_books():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT book_name, author, borrowby, borrow_date FROM books")
            books = cursor.fetchall()
            return books
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        connection.close()


# Endpoint to add a new book
@router.post("/add_book")
async def create_book(book: Book):
    connection = get_db_connection()
    if not connection:
        return {"statusCode": 500, "message": "Database connection error"}
    try:
        with connection.cursor() as cursor:
            # Check if the book already exists
            cursor.execute("SELECT COUNT(*) AS count FROM books WHERE book_name = %s AND author = %s", (book.book_name, book.author))
            result = cursor.fetchone()

            if result['count'] > 0:
                return {"statusCode": 400, "message": "Book already exists"}
            
             # Add the new book
            cursor.execute("INSERT INTO books (book_name, author) VALUES (%s, %s)", (book.book_name, book.author))
            connection.commit()

            publish_event("BookAdded", {"book_name": book.book_name, "author": book.author})

        return {"statusCode": 201, "message": "Book added successfully"}
    finally:
        connection.close()

# Endpoint to delete a new book
@router.delete("/delete_book/{book_name}")
async def delete_book(book_name: str):
    connection = get_db_connection()
    if not connection:
        return {"statusCode": 500, "message": "Database connection error"}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT borrow_date FROM books WHERE book_name = %s", (book_name,))
            book = cursor.fetchone()

            if book is None:
                return {"statusCode": 404, "message": "Book not found"}
            
            if book['borrow_date'] is not None:
                return {"statusCode": 400, "message": "Cannot delete a borrowed book"}
            
            cursor.execute("DELETE FROM books WHERE book_name = %s", (book_name,))
            connection.commit()

            publish_event("BookDeleted", {"book_name": book_name})

            if cursor.rowcount == 0:
                return {"statusCode": 404, "message": "Book not found after deletion attempt"}

        return {"statusCode": 200, "message": "Book deleted successfully"}
    finally:
        connection.close()

@router.get("/search", response_model=List[Book])
async def search_books(book_name: str):
    connection = get_db_connection()
    if not connection:
        return {"statusCode": 500, "message": "Database connection error"}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT book_name, author FROM books WHERE book_name LIKE %s", (book_name + '%',))
            result = cursor.fetchall()
        return result
    finally:
        connection.close()

