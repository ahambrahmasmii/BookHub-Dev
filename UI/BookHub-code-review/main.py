from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mangum import Mangum
from typing import List
import pymysql.cursors
import hashlib
# import logging

app = FastAPI()
handler = Mangum(app)

DB_CONFIG = {
    'host': 'bookhub.c1q0o0eis5sg.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'admin2001',
    'database': 'bookhub',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)


# DB_CONFIG = {
#     'host': 'bookhub.c1q0o0eis5sg.us-east-1.rds.amazonaws.com',
#     'user': 'admin',
#     'password': 'admin2001',
#     'database': 'bookhub',
#     'cursorclass': pymysql.cursors.DictCursor
# }

# def get_db_connection():
#     return pymysql.connect(**DB_CONFIG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_database_and_tables():
    connection = pymysql.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password']
    )
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS bookhub")
        
        connection.select_db(DB_CONFIG['database'])
        
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255),
                    email_id VARCHAR(255) UNIQUE,
                    password VARCHAR(255),
                    role VARCHAR(255) DEFAULT 'visitor'
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS books (
                    book_name VARCHAR(255),
                    author VARCHAR(255),
                    borrowby VARCHAR(255)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS collection (
                    collection_name VARCHAR(255)
                   
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS resources (
                    collection_name VARCHAR(244),
                    resource_name VARCHAR(244),
                    description VARCHAR(244),
                    link VARCHAR(244)
                   
                )
            """)
        
        connection.commit()
    finally:
        connection.close()

# Call the function to create the database and tables
create_database_and_tables()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Include OPTIONS method
    allow_headers=["*"],
)

# Pydantic models for request data
class LoginRequest(BaseModel):
    email_id: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email_id: str
    password: str

class Book(BaseModel):
    book_name: str
    author: str

class Collection(BaseModel):
    collection_name: str

class Resource(BaseModel):
    resource_name: str
    link:str
    description:str
    collection_name:str

class BorrowRequest(BaseModel):
    book_name: str

class ReturnRequest(BaseModel):
    book_name: str

# Models
class CollectionDisplay(BaseModel):
    collection_name: str

class ResourceDisaplay(BaseModel):
    resource_name: str
    link: str

class ResetPasswordRequest(BaseModel):
    email_id: str
    new_password: str

def hash_password(password: str) -> str:
    """
    Hash the given password using SHA-256 and return the hashed password.
    """
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(stored_hash: str, password: str) -> bool:
    """
    Verify that the provided password matches the stored hashed password.
    """
    return stored_hash == hash_password(password)

@app.post("/login")
async def login(request: LoginRequest):
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE email_id = %s"
            cursor.execute(sql, (request.email_id,))
            result = cursor.fetchone()

            if not result:
                return {"message": "user_not_found"}

            # Compare the stored hashed password with the provided password
            db_hashed_password = result['password']
            if verify_password(db_hashed_password, request.password):
                return {"message": "valid", "role": result['role']}
            else:
                raise HTTPException(status_code=401, detail="Invalid email or password")
    except pymysql.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        connection.close()

@app.post("/signup")
async def signup(request_data: SignupRequest):
    name = request_data.name
    email_id = request_data.email_id
    password = hash_password(request_data.password)  # Hash the password using SHA-256

    # Determine role based on email_id
    if email_id in ['alam@gmail.com', 'bindhu@gmail.com']:
        role = 'admin'
    else:
        role = 'visitor'

    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection error")

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email_id = %s", (email_id,))
            user = cursor.fetchone()

            if user:
                return {'message': 'User already exists. Please login to proceed.'}
            else:
                cursor.execute("INSERT INTO users (name, email_id, password, role) VALUES (%s, %s, %s, %s)",
                               (name, email_id, password, role))
                connection.commit()
                return {'message': 'valid'}
    except pymysql.Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        connection.close()

@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        with connection.cursor() as cursor:
            # Check if the email exists
            sql = "SELECT * FROM users WHERE email_id = %s"
            cursor.execute(sql, (request.email_id,))
            result = cursor.fetchone()

            if not result:
                raise HTTPException(status_code=404, detail="Email not found")

            # Update the password with the hashed version
            hashed_password = hash_password(request.new_password)
            sql = "UPDATE users SET password = %s WHERE email_id = %s"
            cursor.execute(sql, (hashed_password, request.email_id))
            connection.commit()

            return {"message": "Password reset successfully"}
    except pymysql.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        connection.close()

@app.get('/books')
async def get_books():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT book_name, author FROM books")
            items = cursor.fetchall()

        if not items:
            raise HTTPException(status_code=404, detail="No books found")

        return items
    except Exception as e:
        print(f"Error fetching books: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        connection.close()

@app.post("/add_book")
async def create_book(book: Book):
    connection = get_db_connection()
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Check if the book already exists
            cursor.execute("SELECT COUNT(*) AS count FROM books WHERE book_name = %s AND author = %s", (book.book_name, book.author))
            result = cursor.fetchone()
            
            if result['count'] > 0:
                # Book already exists
                return {"message": "Book already exists"}

            # Insert the new book
            cursor.execute("INSERT INTO books (book_name, author) VALUES (%s, %s)", (book.book_name, book.author))
            conn.commit()
        return {"message": "Book added successfully"}
    except Exception as e:
        # Catch all exceptions and log them
        print(f"Error adding book: {e}")
        # Return a generic error message
        return {"message": "Failed to add book"}
    finally:
        conn.close()

@app.put("/borrow")
def borrow_book(request: BorrowRequest):
    logged_in_user = "John Doe"  # Hardcoded logged-in user
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE books SET borrowby = %s WHERE book_name = %s", (logged_in_user, request.book_name))
            connection.commit()
        return {"message": "Book borrowed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        connection.close()

@app.put("/return")
def return_book(request: ReturnRequest):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE books SET borrowby = NULL WHERE book_name = %s", (request.book_name,))
            connection.commit()
        return {"message": "Book returned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        connection.close()

@app.delete("/delete_book/{book_name}")
async def delete_book(book_name: str):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM books WHERE book_name = %s", (book_name,))
            connection.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Book not found")
        return {"message": "Book deleted successfully"}
    finally:
        connection.close()

        

@app.post("/add_collection")
async def create_collection(collection: Collection):
    # Ensure collection_name is not an empty string
    if not collection.collection_name.strip():
        return {"message": "Collection name cannot be empty"}
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Check if the collection already exists
            cursor.execute("SELECT COUNT(*) AS count FROM collection WHERE collection_name = %s", (collection.collection_name,))
            result = cursor.fetchone()
            if result['count'] > 0:
                # Collection already exists
                return {"message": "The collection already exists."}

            # Insert the new collection
            cursor.execute("INSERT INTO collection (collection_name) VALUES (%s)", (collection.collection_name,))
            connection.commit()
        return {"message": "Collection added successfully."}
    except Exception as e:
        print(f"Error adding collection: {e}")
        return {"message": "Failed to add collection. Please try again later."}
    finally:
        connection.close()

@app.get("/collections")
def get_collection_names():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT collection_name FROM collection")
            collection = [row['collection_name'] for row in cursor.fetchall()]
        return collection
    except Exception as e:
        print(f"Error fetching collection: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch collection")
    finally:
        connection.close()

@app.post("/add_resource")
async def create_resource(resource: Resource):
    # Validate that none of the fields are empty strings
    if not resource.resource_name.strip():
        return {"message": "Resource name cannot be empty"}
    if not resource.link.strip():
        return {"message": "Resource link cannot be empty"}
    if not resource.collection_name.strip():
        return {"message": "Collection name cannot be empty"}

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Check if the resource already exists in the specified collection
            cursor.execute(
                "SELECT COUNT(*) AS count FROM resources WHERE link = %s AND collection_name = %s", 
                (resource.link, resource.collection_name)
            )
            result = cursor.fetchone()
            if result['count'] > 0:
                # Resource already exists
                return {"message": "Resource already exists"}

            # Insert the new resource
            cursor.execute(
                "INSERT INTO resources (resource_name, link, description, collection_name) VALUES (%s, %s, %s, %s)",
                (resource.resource_name, resource.link, resource.description, resource.collection_name)
            )
            connection.commit()
        return {"message": "Resource added successfully"}
    except Exception as e:
        print(f"Error adding resource: {e}")
        return {"message": "Failed to add resource. Please try again later."}
    finally:
        connection.close()



@app.get("/search", response_model=List[Book])
async def search_books(book_name: str):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT book_name, author FROM books WHERE book_name LIKE %s", (book_name + '%',))
            result = cursor.fetchall()
            
        return result
    finally:
        connection.close()

@app.get("/collections_list")
async def get_collections():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT DISTINCT collection_name FROM collection"
            cursor.execute(sql)
            result = cursor.fetchall()
            return [{"collection_name": row["collection_name"]} for row in result]
    finally:
        connection.close()

@app.get("/collections_list/{collection_name}/resources")
async def get_resources(collection_name: str):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT resource_name, link, description FROM resources WHERE collection_name = %s AND resource_name != ''"
            cursor.execute(sql, (collection_name,))
            result = cursor.fetchall()
            if not result:
                raise HTTPException(status_code=404, detail="Collection not found")
            return [{"resource_name": row["resource_name"], "link": row["link"], "description": row["description"]} for row in result]
    finally:
        connection.close()

