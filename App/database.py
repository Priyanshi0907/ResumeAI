"""
database.py  –  Unified DB layer (SQLite default, MySQL optional).
All raw SQL lives here so App.py stays clean.
"""

import sqlite3
import datetime
import pandas as pd
from config import DB_TYPE, SQLITE_PATH, MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB


# ─────────────────────────────────────────────────────────────
#  Connection factory
# ─────────────────────────────────────────────────────────────

def _get_conn():
    if DB_TYPE == "mysql":
        import pymysql
        return pymysql.connect(
            host=MYSQL_HOST, user=MYSQL_USER,
            password=MYSQL_PASS, db=MYSQL_DB,
            cursorclass=pymysql.cursors.DictCursor
        )
    else:
        conn = sqlite3.connect(SQLITE_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn


def _placeholder():
    """Return the correct positional placeholder for the active DB."""
    return "%s" if DB_TYPE == "mysql" else "?"


# ─────────────────────────────────────────────────────────────
#  Bootstrap – create tables once
# ─────────────────────────────────────────────────────────────

_BOOTSTRAP_DONE = False

def bootstrap():
    global _BOOTSTRAP_DONE
    if _BOOTSTRAP_DONE:
        return
    conn = _get_conn()
    cur  = conn.cursor()

    if DB_TYPE == "mysql":
        cur.execute("CREATE DATABASE IF NOT EXISTS `cv`;")
        cur.execute("USE `cv`;")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_data (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            sec_token        TEXT,
            ip_add           TEXT,
            host_name        TEXT,
            dev_user         TEXT,
            os_name_ver      TEXT,
            latlong          TEXT,
            city             TEXT,
            state            TEXT,
            country          TEXT,
            act_name         TEXT,
            act_mail         TEXT,
            act_mob          TEXT,
            name             TEXT,
            email            TEXT,
            resume_score     TEXT,
            timestamp        TEXT,
            no_of_pages      TEXT,
            predicted_field  TEXT,
            user_level       TEXT,
            actual_skills    TEXT,
            recommended_skills TEXT,
            recommended_courses TEXT,
            pdf_name         TEXT,
            linkedin         TEXT,
            github           TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_feedback (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            feed_name   TEXT,
            feed_email  TEXT,
            feed_score  TEXT,
            comments    TEXT,
            timestamp   TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS app_users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT,
            email       TEXT UNIQUE,
            password    TEXT,
            timestamp   TEXT
        )
    """)

    conn.commit()
    conn.close()
    _BOOTSTRAP_DONE = True


# ─────────────────────────────────────────────────────────────
#  Write helpers
# ─────────────────────────────────────────────────────────────

def insert_user_data(
    sec_token, ip_add, host_name, dev_user, os_name_ver,
    latlong, city, state, country,
    act_name, act_mail, act_mob,
    name, email, resume_score, timestamp, no_of_pages,
    predicted_field, user_level, actual_skills,
    recommended_skills, recommended_courses, pdf_name,
    linkedin="", github=""
):
    p = _placeholder()
    sql = f"""
        INSERT INTO user_data (
            sec_token, ip_add, host_name, dev_user, os_name_ver,
            latlong, city, state, country,
            act_name, act_mail, act_mob,
            name, email, resume_score, timestamp, no_of_pages,
            predicted_field, user_level, actual_skills,
            recommended_skills, recommended_courses, pdf_name,
            linkedin, github
        ) VALUES ({','.join([p]*25)})
    """
    vals = (
        str(sec_token), str(ip_add), host_name, dev_user, os_name_ver,
        str(latlong), city, state, country,
        act_name, act_mail, act_mob,
        name, email, str(resume_score), timestamp, str(no_of_pages),
        predicted_field, user_level, str(actual_skills),
        str(recommended_skills), str(recommended_courses), pdf_name,
        linkedin, github
    )
    conn = _get_conn()
    conn.execute(sql, vals)
    conn.commit()
    conn.close()


def insert_feedback(feed_name, feed_email, feed_score, comments, timestamp):
    p = _placeholder()
    sql = f"""
        INSERT INTO user_feedback (feed_name, feed_email, feed_score, comments, timestamp)
        VALUES ({p},{p},{p},{p},{p})
    """
    conn = _get_conn()
    conn.execute(sql, (feed_name, feed_email, str(feed_score), comments, timestamp))
    conn.commit()
    conn.close()


def register_user(name, email, password, timestamp) -> bool:
    p = _placeholder()
    sql = f"INSERT INTO app_users (name, email, password, timestamp) VALUES ({p}, {p}, {p}, {p})"
    conn = _get_conn()
    try:
        conn.execute(sql, (name, email.strip().lower(), password, timestamp))
        conn.commit()
        success = True
    except Exception as e:
        print(f"Registration error: {e}")
        success = False
    finally:
        conn.close()
    return success


def authenticate_user(email, password):
    p = _placeholder()
    sql = f"SELECT * FROM app_users WHERE email = {p} AND password = {p}"
    conn = _get_conn()
    try:
        cur = conn.cursor()
        cur.execute(sql, (email.strip().lower(), password))
        row = cur.fetchone()
        if row:
            return dict(row)
        return None
    except Exception as e:
        print(f"Auth error: {e}")
        return None
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────
#  Read helpers  (return DataFrames for easy display)
# ─────────────────────────────────────────────────────────────

def fetch_all_users() -> pd.DataFrame:
    conn = _get_conn()
    df = pd.read_sql_query("SELECT * FROM user_data", conn)
    conn.close()
    return df


def fetch_plot_data() -> pd.DataFrame:
    conn = _get_conn()
    df = pd.read_sql_query(
        "SELECT id, ip_add, resume_score, predicted_field, user_level, city, state, country FROM user_data",
        conn
    )
    conn.close()
    return df


def fetch_all_feedback() -> pd.DataFrame:
    conn = _get_conn()
    df = pd.read_sql_query("SELECT * FROM user_feedback", conn)
    conn.close()
    return df


def delete_user(row_id: int):
    p = _placeholder()
    conn = _get_conn()
    conn.execute(f"DELETE FROM user_data WHERE id = {p}", (row_id,))
    conn.commit()
    conn.close()


def delete_feedback(feed_id: int):
    p = _placeholder()
    conn = _get_conn()
    conn.execute(f"DELETE FROM user_feedback WHERE id = {p}", (feed_id,))
    conn.commit()
    conn.close()


def update_feedback(feed_id: int, new_score: int, new_comments: str):
    p = _placeholder()
    conn = _get_conn()
    conn.execute(
        f"UPDATE user_feedback SET feed_score = {p}, comments = {p} WHERE id = {p}",
        (str(new_score), new_comments, feed_id)
    )
    conn.commit()
    conn.close()


def user_count() -> int:
    conn = _get_conn()
    cur = conn.execute("SELECT COUNT(*) FROM user_data")
    n = cur.fetchone()[0]
    conn.close()
    return n
