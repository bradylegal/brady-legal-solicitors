import os
import re
import sqlite3
from datetime import datetime
from functools import wraps

from flask import Flask, g, jsonify, request, session, render_template
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "app.db")

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
CORS(app, resources={r"/api/*": {"origins": "*"}})

ADMIN_USER = os.environ.get("ADMIN_USER", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "admin123")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

SEED_REVIEWS = [
    {"name": "Margaret Whitfield", "location": "Edgbaston, Birmingham", "date": "March 2026", "rating": 5, "case_type": "Residential Conveyancing", "text": "We sold and purchased in a single chain that threatened to collapse twice. Jonathan kept everything moving and dealt with the other side directly when their solicitors became difficult. Completion happened on the day we were promised. I cannot fault the service."},
    {"name": "David Okafor", "location": "Camden, London", "date": "February 2026", "rating": 5, "case_type": "Employment Law", "text": "After being dismissed during probation I assumed I had no claim. Brady Legal took the time to look at my contract and found the flaws in the employer's process. We settled out of tribunal within twelve weeks and I received far more than I expected."},
    {"name": "Sarah-Louise Harper", "location": "Solihull", "date": "January 2026", "rating": 5, "case_type": "Wills & Probate", "text": "Handling my mother's estate after her death, with the family spread across three countries, was complicated. They were patient, explained every step in plain terms, and never once made me feel rushed. Their fee was agreed up front and it did not change."},
    {"name": "Robert Chen", "location": "Canary Wharf, London", "date": "December 2025", "rating": 4, "case_type": "Commercial Law", "text": "Drafted and negotiated a shareholders' agreement for our two founders. Pragmatic and commercially minded rather than the usual wall of legal jargon. Communication was good, though I did have to chase once or twice during a busy period."},
    {"name": "Priya Sharma", "location": "Harborne, Birmingham", "date": "November 2025", "rating": 5, "case_type": "Family Law", "text": "The most difficult year of my life, made bearable by how professionally my divorce was handled. Every option was laid out honestly with the costs attached, and the financial settlement was fair. I am grateful for their steadiness throughout."},
    {"name": "Geoffrey Ashworth", "location": "Kensington, London", "date": "October 2025", "rating": 5, "case_type": "Dispute Resolution", "text": "A commercial landlord refused to return our deposit of £86,000 and our previous solicitors had made little progress in six months. Brady Legal took over, wrote one robust letter, and the funds were in our account within three weeks."},
    {"name": "Helen Doyle", "location": "Sutton Coldfield", "date": "September 2025", "rating": 5, "case_type": "Residential Conveyancing", "text": "First-time buyer with a leasehold flat, so there was a lot to unpick. They flagged the ground rent clause that every other firm had missed and negotiated it down. Their fixed fee was exactly what we paid."},
    {"name": "Michael Bancroft", "location": "Islington, London", "date": "August 2025", "rating": 4, "case_type": "Commercial Law", "text": "Acted for us on an acquisition of a small logistics business. Thorough due diligence and a deal that closed on schedule. I would use them again without hesitation."},
    {"name": "Fatima Ali", "location": "Birmingham", "date": "July 2025", "rating": 5, "case_type": "Family Law", "text": "Custody arrangements for my two children, handled with genuine care. They prepared me for every hearing and the barrister they instructed was excellent. My children come first and they understood that from day one."},
    {"name": "Thomas Gregory", "location": "Richmond, London", "date": "June 2025", "rating": 5, "case_type": "Wills & Probate", "text": "Two simple wills and lasting powers of attorney, arranged for my wife and I within three weeks. Clear advice, sensible fees and the documents explained line by line. Exactly what you hope for from a solicitor."},
]


def get_db():
    if "db" not in g:
        os.makedirs(DATA_DIR, exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        g.db = conn
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT DEFAULT '',
            matter TEXT DEFAULT '',
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT DEFAULT '',
            case_type TEXT DEFAULT '',
            rating INTEGER NOT NULL,
            text TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT DEFAULT '',
            matter TEXT NOT NULL,
            urgency TEXT DEFAULT '',
            meeting TEXT DEFAULT '',
            detail TEXT DEFAULT '',
            created_at TEXT NOT NULL
        );
        """
    )
    row = db.execute("SELECT COUNT(*) AS n FROM reviews").fetchone()
    if row["n"] == 0:
        for r in SEED_REVIEWS:
            db.execute(
                "INSERT INTO reviews (name, location, case_type, rating, text, status, created_at) VALUES (?, ?, ?, ?, ?, 'approved', ?)",
                (r["name"], r["location"], r["case_type"], r["rating"], r["text"], seed_date_to_iso(r["date"])),
            )
    db.commit()


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("authenticated"):
            return jsonify({"error": "Authentication required"}), 401
        return fn(*args, **kwargs)
    return wrapper


def clean_string(value, max_len):
    value = (value or "").strip()
    return value[:max_len]


def seed_date_to_iso(date_str):
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    parts = date_str.split()
    month = month_names.index(parts[0]) + 1
    year = int(parts[1])
    return "%04d-%02d-01 09:00:00" % (year, month)


def review_to_json(row):
    created = datetime.strptime(row["created_at"], "%Y-%m-%d %H:%M:%S")
    return {
        "id": row["id"],
        "name": row["name"],
        "location": row["location"],
        "caseType": row["case_type"],
        "rating": row["rating"],
        "text": row["text"],
        "status": row["status"],
        "date": created.strftime("%B %Y"),
    }


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/reviews", methods=["GET"])
def public_reviews():
    init_db()
    rows = get_db().execute(
        "SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC, id DESC"
    ).fetchall()
    return jsonify([review_to_json(r) for r in rows])


@app.route("/api/reviews", methods=["POST"])
def submit_review():
    init_db()
    data = request.get_json(silent=True) or {}
    name = clean_string(data.get("name"), 100)
    location = clean_string(data.get("location"), 100)
    case_type = clean_string(data.get("caseType"), 100)
    text = clean_string(data.get("text"), 3000)
    try:
        rating = int(data.get("rating", 0))
    except (TypeError, ValueError):
        rating = 0

    if not name or not text or rating not in (1, 2, 3, 4, 5):
        return jsonify({"error": "Please provide your name, a rating and your review text."}), 400

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur = get_db().execute(
        "INSERT INTO reviews (name, location, case_type, rating, text, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
        (name, location or "Client", case_type or "General Enquiry", rating, text, now),
    )
    get_db().commit()
    return jsonify({"status": "pending", "id": cur.lastrowid,
                    "message": "Thank you. Your review has been submitted and will appear after moderation."}), 201


@app.route("/api/contact", methods=["POST"])
def submit_contact():
    init_db()
    data = request.get_json(silent=True) or {}
    name = clean_string(data.get("name"), 100)
    email = clean_string(data.get("email"), 200)
    phone = clean_string(data.get("phone"), 50)
    matter = clean_string(data.get("matter"), 100)
    message = clean_string(data.get("message"), 5000)

    if not name or not message:
        return jsonify({"error": "Please provide your name and an enquiry message."}), 400
    if not email or not EMAIL_RE.match(email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    get_db().execute(
        "INSERT INTO messages (name, email, phone, matter, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (name, email, phone, matter, message, now),
    )
    get_db().commit()
    return jsonify({"status": "ok", "message": "Thank you. Your enquiry has been received — we will reply within one working day."}), 201


@app.route("/api/newsletter", methods=["POST"])
def subscribe_newsletter():
    init_db()
    data = request.get_json(silent=True) or {}
    email = clean_string(data.get("email"), 200)
    if not email or not EMAIL_RE.match(email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        get_db().execute("INSERT INTO subscribers (email, created_at) VALUES (?, ?)", (email.lower(), now))
        get_db().commit()
        return jsonify({"status": "ok", "message": "Thank you for subscribing to Legal Brief."}), 201
    except sqlite3.IntegrityError:
        return jsonify({"status": "ok", "message": "You are already on our mailing list."}), 200


@app.route("/api/enquiry", methods=["POST"])
def submit_enquiry():
    init_db()
    data = request.get_json(silent=True) or {}
    name = clean_string(data.get("name"), 100)
    email = clean_string(data.get("email"), 200)
    phone = clean_string(data.get("phone"), 50)
    matter = clean_string(data.get("matter"), 100)
    answers = data.get("answers") or {}
    urgency = clean_string(answers.get("urgency"), 100)
    meeting = clean_string(answers.get("meeting"), 100)
    detail = clean_string(answers.get("detail"), 3000)

    if not name or not email or not EMAIL_RE.match(email) or not matter:
        return jsonify({"error": "Please complete your details and choose a matter type."}), 400

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    get_db().execute(
        "INSERT INTO enquiries (name, email, phone, matter, urgency, meeting, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (name, email, phone, matter, urgency, meeting, detail, now),
    )
    get_db().commit()
    return jsonify({"status": "ok", "message": "Thank you. Your case outline has been received — a solicitor will contact you within one working day."}), 201


@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = clean_string(data.get("username"), 100)
    password = clean_string(data.get("password"), 200)
    if username == ADMIN_USER and password == ADMIN_PASS:
        session["authenticated"] = True
        return jsonify({"status": "ok"})
    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.clear()
    return jsonify({"status": "ok"})


@app.route("/api/admin/session", methods=["GET"])
def admin_session():
    return jsonify({"authenticated": bool(session.get("authenticated"))})


@app.route("/api/admin/messages", methods=["GET"])
@login_required
def admin_messages():
    init_db()
    rows = get_db().execute("SELECT * FROM messages ORDER BY id DESC").fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/admin/messages/<int:msg_id>", methods=["DELETE"])
@login_required
def admin_delete_message(msg_id):
    init_db()
    cur = get_db().execute("DELETE FROM messages WHERE id = ?", (msg_id,))
    get_db().commit()
    return jsonify({"deleted": cur.rowcount > 0})


@app.route("/api/admin/reviews", methods=["GET"])
@login_required
def admin_reviews():
    init_db()
    rows = get_db().execute("SELECT * FROM reviews ORDER BY id DESC").fetchall()
    return jsonify([review_to_json(r) for r in rows])


@app.route("/api/admin/reviews/<int:review_id>/approve", methods=["POST"])
@login_required
def admin_approve_review(review_id):
    init_db()
    get_db().execute("UPDATE reviews SET status = 'approved' WHERE id = ?", (review_id,))
    get_db().commit()
    return jsonify({"status": "approved"})


@app.route("/api/admin/reviews/<int:review_id>", methods=["DELETE"])
@login_required
def admin_delete_review(review_id):
    init_db()
    cur = get_db().execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    get_db().commit()
    return jsonify({"deleted": cur.rowcount > 0})


@app.route("/api/admin/subscribers", methods=["GET"])
@login_required
def admin_subscribers():
    init_db()
    rows = get_db().execute("SELECT * FROM subscribers ORDER BY id DESC").fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/admin/subscribers/<int:sub_id>", methods=["DELETE"])
@login_required
def admin_delete_subscriber(sub_id):
    init_db()
    cur = get_db().execute("DELETE FROM subscribers WHERE id = ?", (sub_id,))
    get_db().commit()
    return jsonify({"deleted": cur.rowcount > 0})


@app.route("/api/admin/enquiries", methods=["GET"])
@login_required
def admin_enquiries():
    init_db()
    rows = get_db().execute("SELECT * FROM enquiries ORDER BY id DESC").fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/admin/enquiries/<int:enq_id>", methods=["DELETE"])
@login_required
def admin_delete_enquiry(enq_id):
    init_db()
    cur = get_db().execute("DELETE FROM enquiries WHERE id = ?", (enq_id,))
    get_db().commit()
    return jsonify({"deleted": cur.rowcount > 0})


@app.route("/admin")
def admin_page():
    return render_template("admin.html")


if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=True)
