import os
import cv2
import numpy as np
import requests
from pyzbar.pyzbar import decode
from datetime import date, timedelta, datetime, timezone
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import inspect, text
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

YAHOO_APP_ID = os.getenv("YAHOO_APP_ID")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DEFAULT_YAHOO_ITEM_SEARCH_URL = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch"

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "OPTIONS"],
            "allow_headers": ["Content-Type", "X-User-Id"],
        }
    },
)

database_url = os.getenv("DATABASE_URL", "sqlite:///app.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
elif database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}
db = SQLAlchemy(app)

class APIError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_public_dict(self):
        return {
            "id": self.id,
            "username": self.username,
        }


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True, index=True)
    task_name = db.Column(db.String(255), nullable=False)
    task_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    barcode = db.Column(db.String(32), nullable=True)
    purchase_date = db.Column(db.Date, nullable=True)
    product_name = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(120), nullable=True)
    suggested_expiration = db.Column(db.Date, nullable=True)
    reason = db.Column(db.Text, nullable=True)
    product_image = db.Column(db.Text, nullable=True)
    yokai = db.Column(db.String(64), nullable=True)
    task_is_done = db.Column(db.Boolean, default=False, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "barcode": self.barcode,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "product_name": self.product_name or self.task_name,
            "category": self.category,
            "suggested_expiration": (
                self.suggested_expiration.isoformat()
                if self.suggested_expiration
                else (self.task_date.date().isoformat() if self.task_date else None)
            ),
            "reason": self.reason,
            "product_image": self.product_image,
            "yokai": self.yokai,
            "task_name": self.task_name,
            "task_date": self.task_date.isoformat() if self.task_date else None,
            "task_is_done": self.task_is_done,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


TASK_SCHEMA_UPDATES = {
    "user_id": "ALTER TABLE task ADD COLUMN user_id INTEGER",
    "barcode": "ALTER TABLE task ADD COLUMN barcode VARCHAR(32)",
    "purchase_date": "ALTER TABLE task ADD COLUMN purchase_date DATE",
    "product_name": "ALTER TABLE task ADD COLUMN product_name VARCHAR(255)",
    "category": "ALTER TABLE task ADD COLUMN category VARCHAR(120)",
    "suggested_expiration": "ALTER TABLE task ADD COLUMN suggested_expiration DATE",
    "reason": "ALTER TABLE task ADD COLUMN reason TEXT",
    "product_image": "ALTER TABLE task ADD COLUMN product_image TEXT",
    "yokai": "ALTER TABLE task ADD COLUMN yokai VARCHAR(64)",
    "completed_at": "ALTER TABLE task ADD COLUMN completed_at TIMESTAMP",
    "created_at": "ALTER TABLE task ADD COLUMN created_at TIMESTAMP",
    "updated_at": "ALTER TABLE task ADD COLUMN updated_at TIMESTAMP",
}

EXPIRATION_RULES = {
    "火災警報器": 365 * 10,

    "冷蔵庫": 365 * 8,
    "家電": 365 * 5,
    "防災用品": 365 * 5,

    "カー用品": 365 * 3,
    "PC周辺機器": 365 * 3,
    "電池": 365 * 3,

    "季節用品": 365,
    "家電消耗品": 365,

    "浄水器カートリッジ": 90,
    "オーラルケア": 90,
    "掃除用品": 90,
    "日用品・消耗品": 90,
    "日用品": 90,

    "衛生用品": 30,
    "コンタクトレンズ": 30,
    "冷凍食品": 30,

    "冷蔵食品": 7,
    "食品": 180
}

CATEGORY_TO_ID = {
    "火災警報器": 1,
    "冷蔵庫": 2,
    "家電": 3,
    "防災用品": 4,
    "カー用品": 5,
    "PC周辺機器": 6,
    "電池": 7,
    "季節用品": 8,
    "家電消耗品": 9,
    "浄水器カートリッジ": 10,
    "オーラルケア": 11,
    "掃除用品": 12,
    "日用品・消耗品": 13,
    "日用品": 14,
    "衛生用品": 15,
    "コンタクトレンズ": 16,
    "冷凍食品": 17,
    "冷凍食品": 18,
    "食品": 19, 
    "その他": 99
}

def ensure_task_schema() -> None:
    with app.app_context():
        db.create_all()
        inspector = inspect(db.engine)
        if "task" not in inspector.get_table_names():
            return

        existing_columns = {column["name"] for column in inspector.get_columns("task")}
        added_columns = False

        for column_name, ddl in TASK_SCHEMA_UPDATES.items():
            if column_name in existing_columns:
                continue

            db.session.execute(text(ddl))
            added_columns = True

        if added_columns:
            now = datetime.now(timezone.utc).isoformat()
            db.session.execute(
                text(
                    """
                    UPDATE task
                    SET created_at = COALESCE(created_at, task_date, :now),
                        updated_at = COALESCE(updated_at, task_date, :now),
                        product_name = COALESCE(product_name, task_name)
                    """
                ),
                {"now": now},
            )
            db.session.commit()


ensure_task_schema()


@app.errorhandler(APIError)
def handle_api_error(error: APIError):
    return jsonify({"detail": error.detail}), error.status_code


@app.errorhandler(404)
def handle_not_found(_error):
    return jsonify({"detail": "Not found"}), 404


@app.errorhandler(405)
def handle_method_not_allowed(_error):
    return jsonify({"detail": "Method not allowed"}), 405


@app.errorhandler(Exception)
def handle_unexpected_error(error: Exception):
    app.logger.exception("Unexpected error: %s", error)
    return jsonify({"detail": "Internal server error"}), 500


def parse_purchase_date(value: str | None) -> date:
    if not value:
        return date.today()

    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise APIError(400, "purchase_date must be in YYYY-MM-DD format") from exc


def parse_required_date(value: str | None, field_name: str) -> date:
    if not value:
        raise APIError(400, f"{field_name} is required")

    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise APIError(400, f"{field_name} must be in YYYY-MM-DD format") from exc


def parse_auth_payload() -> tuple[str, str]:
    payload = request.get_json(silent=True) or {}
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", "")).strip()

    if not username:
        raise APIError(400, "username is required")
    if " " in username:
        raise APIError(400, "username cannot contain spaces")
    if len(username) < 3:
        raise APIError(400, "username must be at least 3 characters")
    if len(username) > 64:
        raise APIError(400, "username must be 64 characters or less")
    if not password:
        raise APIError(400, "password is required")
    if len(password) < 8:
        raise APIError(400, "password must be at least 8 characters")

    return username, password


def get_request_user() -> User | None:
    user_id_header = request.headers.get("X-User-Id")
    if not user_id_header:
        return None

    try:
        user_id = int(user_id_header)
    except ValueError as exc:
        raise APIError(400, "X-User-Id must be an integer") from exc

    user = db.session.get(User, user_id)
    if not user:
        raise APIError(401, "Invalid user")
    return user


def guess_category(product_name: str, product_description: str | None) -> str:
    text = f"{product_name or ''} {product_description or ''}".lower()
    mapping = [
        ("交換目安", "日用品・消耗品"),
        ("長期保存", "防災用品"),

        ("交換用カートリッジ", "浄水器カートリッジ"),
        ("浄水フィルター", "浄水器カートリッジ"),
        ("替えブラシ", "オーラルケア"),
        ("替刃", "衛生用品"),
        ("ワンデー", "コンタクトレンズ"),
        ("1day", "コンタクトレンズ"),
        ("2ウィーク", "コンタクトレンズ"),
        ("2week", "コンタクトレンズ"),
        ("集じんフィルター", "家電消耗品"),
        ("加湿フィルター", "家電消耗品"),
        ("クリーナーパック", "家電消耗品"),

        ("スタッドレス", "カー用品"),
        ("スノーワイパー", "カー用品"),
        ("エンジンオイル", "カー用品"),
        ("除雪", "季節用品"),
        ("雪かき", "季節用品"),
        ("消火器", "防災用品"),
        ("保存水", "防災用品"),
        ("非常用持ち出し", "防災用品"),

        ("要冷凍", "冷凍食品"),
        ("要冷蔵", "冷凍食品"),

        ("fire alarm", "火災警報器"),
        ("smoke detector", "火災警報器"),
        ("refrigerator", "冷蔵庫"),
        ("冷蔵庫", "冷蔵庫"),
        ("battery", "電池"),
        ("電池", "電池"),

        ("詰め替え", "日用品"),
        ("詰替", "日用品"),
        ("医薬部外品", "衛生用品"),
        ("無香料", "日用品"),
        ("除菌", "掃除用品"),
        ("mask", "衛生用品"),
        ("マスク", "衛生用品"),
        ("cleaner", "掃除用品"),

        ("ワイヤレス", "PC周辺機器"),
        ("bluetooth", "PC周辺機器"),
        ("カメラ", "家電"),
        ("テレビ", "家電"),

        ("アレルギー物質", "食品"),
        ("賞味期限", "食品"),
        ("food", "食品"),
        ("食品", "食品"),
    ]
    for keyword, category in mapping:
        if keyword in text:
            return category
    return "その他"


def estimate_expiration_date(category: str, purchase_date: date) -> date:
    for keyword, added_days in EXPIRATION_RULES.items():
        if keyword in category:
            return purchase_date + timedelta(days=added_days)
        
    return purchase_date + timedelta(days=2 * 365)


def get_yahoo_item(jan_code: str, request_url: str | None = None) -> dict:
    if not YAHOO_APP_ID:
        raise APIError(500, "YAHOO_APP_ID is not set in environment")

    url = (request_url or DEFAULT_YAHOO_ITEM_SEARCH_URL).strip()
    if not url.startswith("https://shopping.yahooapis.jp/"):
        raise APIError(400, "request_url must be a Yahoo Shopping API domain")

    response = requests.get(
        url,
        params={
            "appid": YAHOO_APP_ID,
            "jan_code": jan_code,
            "results": 1,
        },
        timeout=10,
    )
    if response.status_code != 200:
        raise APIError(502, f"Yahoo API error: {response.status_code}")

    data = response.json()
    hits = data.get("hits", [])
    if not hits:
        raise APIError(404, "No Yahoo Shopping item was found for the barcode")

    return hits[0]

### added ###
def decode_barcode_from_image(file) -> dict:
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img is None:
        raise APIError(400, "The image could not be loaded correctly. Please check the image format")
    
    barcodes = decode(img)
    if not barcodes:
        raise APIError(404, "Barcode is not detected from the image")

    barcode_data = barcodes[0].data.decode('utf-8')
    barcode_type = barcodes[0].type

    return {
        "barcode": barcode_data,
        "type": barcode_type
    }

### added ###

def infer_deadline_reason(
    product_name: str,
    category: str,
    purchase_date: date,
    expiration_date: date,
) -> str:
    if GEMINI_API_KEY:
        try:
            prompt = (
                "次の商品について、交換期限の目安とした理由を日本語で80文字以内で簡潔に説明してください。"
                f" 商品名: {product_name}, カテゴリ: {category}, 購入日: {purchase_date}, "
                f"推定交換期限: {expiration_date}"
            )
            response = requests.post(
                (
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                    f"gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
                ),
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.2,
                        "maxOutputTokens": 120,
                    },
                },
                timeout=12,
            )
            if response.status_code == 200:
                result = response.json()
                candidates = result.get("candidates", [])
                if candidates and isinstance(candidates[0], dict):
                    content = candidates[0].get("content", {})
                    parts = content.get("parts", []) if isinstance(content, dict) else []
                    text = " ".join(
                        part.get("text", "")
                        for part in parts
                        if isinstance(part, dict) and part.get("text")
                    ).strip()
                    if text:
                        return text
        except Exception:
            pass

    return (
        f"{category}の一般的な交換目安を基準に、購入日 {purchase_date.isoformat()} から "
        f"{expiration_date.isoformat()} を推定交換期限としました。"
    )

def get_category_id(category_name: str) -> int:
    return CATEGORY_TO_ID.get(category_name, 99)
 
@app.get("/")
def root():
    return jsonify({"message": "Flask backend is running"})


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/auth/register")
def register():
    username, password = parse_auth_payload()

    existing = User.query.filter_by(username=username).first()
    if existing:
        raise APIError(409, "username is already in use")

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_public_dict()), 201


@app.post("/api/auth/login")
def login():
    username, password = parse_auth_payload()

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        raise APIError(401, "invalid username or password")

    return jsonify(user.to_public_dict())

##リクエストに対してデータベースを'全件'返す（要修正)
@app.get("/api/tasks") 
def get_tasks():
    user = get_request_user()
    query = Task.query
    if user:
        query = query.filter(Task.user_id == user.id)
    else:
        query = query.filter(Task.user_id.is_(None))

    tasks = query.order_by(Task.suggested_expiration.is_(None), Task.suggested_expiration.asc(), Task.id.desc()).all()
    result = [task.to_dict() for task in tasks]

    return jsonify(result)

##特定のタスクのリクエストに対して、そのリクエストのis_doneを完了(True)にして返す
@app.put("/api/tasks/<int:task_id>/done")
def change_task_done(task_id):
    user = get_request_user()
    query = Task.query.filter(Task.id == task_id)
    if user:
        query = query.filter(Task.user_id == user.id)
    else:
        query = query.filter(Task.user_id.is_(None))

    task = query.first()
    if not task:
        return jsonify({"detail": "The expected task is not found"}), 404
    
    task.task_is_done = True
    task.completed_at = datetime.now(timezone.utc)
    
    db.session.commit()
    
    return jsonify(task.to_dict())

##フロントエンドからタスクをデータベースに登録する
@app.post("/api/tasks")
def create_task():
    user = get_request_user()
    data = request.get_json(silent=True) or {}
    required_fields = [
        "barcode",
        "purchase_date",
        "product_name",
        "category",
        "suggested_expiration",
        "reason",
        "yokai",
    ]
    missing_fields = [field for field in required_fields if not str(data.get(field, "")).strip()]
    if missing_fields:
        return jsonify({"detail": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    product_name = str(data["product_name"]).strip()
    new_task = Task(
        user_id=user.id if user else None,
        task_name=product_name,
        barcode=str(data["barcode"]).strip(),
        purchase_date=parse_required_date(data.get("purchase_date"), "purchase_date"),
        product_name=product_name,
        category=str(data["category"]).strip(),
        suggested_expiration=parse_required_date(data.get("suggested_expiration"), "suggested_expiration"),
        reason=str(data["reason"]).strip(),
        product_image=str(data.get("product_image") or "").strip() or None,
        yokai=str(data["yokai"]).strip(),
        task_date=datetime.now(timezone.utc),
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify(new_task.to_dict()), 201


@app.post("/api/estimate")
def estimate():
    payload = request.get_json(silent=True) or {}

    barcode = str(payload.get("barcode", "")).strip().replace("-", "").replace(" ", "")
    if not barcode.isdigit() or len(barcode) < 8:
        raise APIError(400, "A valid barcode is required")

    purchase_date = parse_purchase_date(payload.get("purchase_date"))
    request_url = payload.get("request_url")

    jan_code = barcode[-13:]
    if len(jan_code) not in {8, 12, 13}:
        jan_code = barcode

    try:
        item = get_yahoo_item(jan_code, request_url)
    except APIError:
        raise
    except Exception as exc:
        raise APIError(500, f"Failed to retrieve product information: {exc}") from exc

    product_name = item.get("name") or "未取得の商品"
    image_obj = item.get("image", {}) if isinstance(item.get("image"), dict) else {}
    product_image = image_obj.get("medium") or image_obj.get("small")
    genre_text = " ".join(
        genre.get("name", "")
        for genre in item.get("parentGenreCategories", [])
        if isinstance(genre, dict)
    )
    description = item.get("description", "")
    category = guess_category(product_name, f"{description} {genre_text}")
    category_id = get_category_id(category)
    suggested_expiration = estimate_expiration_date(category, purchase_date)
    reason = infer_deadline_reason(product_name, category, purchase_date, suggested_expiration)

    return jsonify(
        {
            "product_name": product_name,
            "product_image": product_image,
            "category": category,
            "category_id": category_id,
            "suggested_expiration": suggested_expiration.isoformat(),
            "reason": reason,
        }
    )

### added ###
@app.post("/api/scan-barcode") #あとで決める
def scan_barcode():
    if "image" not in request.files:
        raise APIError(400, "Not included the 'image' key")
    
    file = request.files['image']

    try:
        result = decode_barcode_from_image(file)
    except APIError:
        raise
    except Exception as exc:
        raise APIError(500, f"An unexpected error has occurred: {exc}") from exc
    
    return jsonify(result)
### added ###

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5002"))
    app.run(host="0.0.0.0", port=port, debug=True)
