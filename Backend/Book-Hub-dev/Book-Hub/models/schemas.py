from pydantic import BaseModel
from typing import List

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
    link: str
    description: str
    collection_name: str

class BorrowRequest(BaseModel):
    book_name: str

class ReturnRequest(BaseModel):
    book_name: str

class ResetPasswordRequest(BaseModel):
    email_id: str
    new_password: str

class UserUpdateRequest(BaseModel):
    email_id: str
    role: str

class CollectionDisplay(BaseModel):
    collection_name: str

class ResourceDisplay(BaseModel):
    resource_name: str
    link: str
