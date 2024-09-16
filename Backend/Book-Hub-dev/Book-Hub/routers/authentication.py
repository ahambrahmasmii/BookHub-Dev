from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import pymysql.cursors
import hashlib
from database import get_db_connection
from models import LoginRequest, SignupRequest, ResetPasswordRequest, BorrowRequest, ReturnRequest, Book
from events.publisher import publish_event

router = APIRouter()

# Global variable to keep track of the logged-in user
logged_in_user = None

# Password hashing and verification functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(stored_hash: str, password: str) -> bool:
    return stored_hash == hash_password(password)

@router.post("/login")
async def login(request: LoginRequest):
    global logged_in_user
    connection = get_db_connection()
    if not connection:
        return {"statusCode": 500, "message": "Database connection error"}
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email_id = %s", (request.email_id,))
            result = cursor.fetchone()

            if not result:
                return {"statusCode": 400, "message": "User not found, Signup to proceed"}

            if verify_password(result['password'], request.password):
                logged_in_user = result['name']
                publish_event('UserLoggedIn', {'email_id': request.email_id})
                return {"statusCode": 200, "message": "Login successful", "email_id": result['email_id'], "name": result['name'], "role": result['role']}
            else:
                return {"statusCode": 401, "message": "Invalid email or password"}
    finally:
        connection.close()

@router.post("/signup")
async def signup(request: SignupRequest):
    hashed_password = hash_password(request.password)
    # user_data = request.dict()
    role = 'admin' if request.email_id in ['alam@montycloud.com', 'bindhu@montycloud.com'] else 'visitor'
    
    connection = get_db_connection()
    if not connection:
        return {"statusCode": 500, "message": "Database connection error"}

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email_id = %s", (request.email_id,))
            if cursor.fetchone():
                return {"statusCode": 400, "message": "User already exists. Please login to proceed."}
            
            cursor.execute("INSERT INTO users (name, email_id, password, role) VALUES (%s, %s, %s, %s)", (request.name, request.email_id, hashed_password, role))
            connection.commit()
            publish_event('UserCreated', request.email_id)
            return {"statusCode": 200, "message": "User registered successfully"}
    finally:
        connection.close()

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    connection = get_db_connection()
    if not connection:
        return {"statusCode": 500, "message": "Database connection error"}
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email_id = %s", (request.email_id,))
            if not cursor.fetchone():
                return {"statusCode": 404, "message": "Email not found"}

            hashed_password = hash_password(request.new_password)
            cursor.execute("UPDATE users SET password = %s WHERE email_id = %s", (hashed_password, request.email_id))
            connection.commit()
            publish_event('PasswordReset', {'email_id': request.email_id, 'new_password': hashed_password})
            return {"statusCode": 200, "message": "Password reset successfully"}
    finally:
        connection.close()


# Borrow a book
@router.put("/borrow")
async def borrow_book(request: BorrowRequest):
    global logged_in_user
    if not logged_in_user:
        return {"statusCode": 401, "message": "Not authenticated"}

    connection = get_db_connection()
    if not connection:
        return {"statusCode": 500, "message": "Database connection error"}

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE books
                SET borrowby = %s, borrow_date = NOW()
                WHERE book_name = %s AND borrowby IS NULL
            """, (logged_in_user, request.book_name))
            connection.commit()

            if cursor.rowcount == 0:

                publish_event("BookBorrowed", {"book_name": request.book_name, "user": logged_in_user})

                return {"statusCode": 404, "message": "Book not found or already borrowed"}
    finally:
        connection.close()

    return {"statusCode": 200, "message": "Book borrowed successfully"}

# Return a book
@router.put("/return")
async def return_book(request: ReturnRequest):
    global logged_in_user
    if not logged_in_user:
        return {"statusCode": 401, "message": "Not authenticated"}

    connection = get_db_connection()
    if not connection:
        return {"statusCode": 500, "message": "Database connection error"}

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT borrowby FROM books WHERE book_name = %s", (request.book_name,))
            result = cursor.fetchone()
            if not result or result['borrowby'] != logged_in_user:
                return {"statusCode": 400, "message": "You can only return books borrowed by you"}

            cursor.execute("""
                UPDATE books
                SET borrowby = NULL, borrow_date = NULL
                WHERE book_name = %s AND borrowby = %s
            """, (request.book_name, logged_in_user))
            connection.commit()

            if cursor.rowcount == 0:

                publish_event("BookReturned", {"book_name": request.book_name, "user": logged_in_user})

                return {"statusCode": 404, "message": "Book not found or already returned"}
    finally:
        connection.close()

    return {"statusCode": 200, "message": "Book returned successfully"}


