from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import pymysql.cursors
from database import get_db_connection
from models import Collection
from events.publisher import publish_event

router = APIRouter()

# Create and delete Collection endpoints
@router.post("/add_collection", status_code=201)
async def create_collection(collection: Collection):
    if not collection.collection_name.strip():
        return {"message": "Collection name cannot be empty"}, 400
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS count FROM collection WHERE collection_name = %s", (collection.collection_name,))
            result = cursor.fetchone()
            if result['count'] > 0:
                return {"message": "The collection already exists."}, 409

            cursor.execute("INSERT INTO collection (collection_name) VALUES (%s)", (collection.collection_name,))
            connection.commit()

            publish_event('CollectionCreated', {'collection_name': collection.collection_name})
            
        return {"message": "Collection added successfully."}, 201
    finally:
        connection.close()

@router.delete("/delete_collection/{collection_name}", status_code=204)
async def delete_collection(collection_name: str):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM resources WHERE collection_name = %s", (collection_name,))
            rows_deleted = cursor.execute("DELETE FROM collection WHERE collection_name = %s", (collection_name,))
            connection.commit()
            if rows_deleted == 0:
                return {"message": "Collection not found"}, 404
            
            publish_event('CollectionDeleted', {'collection_name': collection_name})

            return {"message": "Collection and its resources deleted successfully"}, 204
    finally:
        connection.close()

# Collection and Resource list endpoints
@router.get("/collections_list", response_model=List[Collection])
async def get_collections():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT collection_name FROM collection")
            result = cursor.fetchall()
            return [{"collection_name": row["collection_name"]} for row in result]
    finally:
        connection.close()

@router.get("/collections_list/{collection_name}/resources", response_model=List[dict])
async def get_resources(collection_name: str):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT resource_name, link, description FROM resources WHERE collection_name = %s AND resource_name != ''", (collection_name,))
            result = cursor.fetchall()
            if not result:
                return {"message": "No resources found for this collection"}, 404
            return [{"resource_name": row["resource_name"], "link": row["link"], "description": row["description"]} for row in result]
    finally:
        connection.close()
