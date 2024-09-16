# config.py
import pymysql.cursors
import os

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_DATABASE'),
    'cursorclass': pymysql.cursors.DictCursor
}
