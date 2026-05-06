from flask import Flask, request, jsonify
import pandas as pd
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

latest_file = None


def read_file(path):
    if path.endswith('.csv'):
        return pd.read_csv(path)
    elif path.endswith('.xlsx'):
        return pd.read_excel(path, engine='openpyxl')
    else:
        raise Exception("Unsupported file format")


@app.route('/')
def home():
    return "Backend Running"


@app.route('/upload', methods=['POST'])
def upload_file():
    global latest_file

    file = request.files.get('file')

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    latest_file = filepath

    return jsonify({"message": "File uploaded successfully"})


@app.route('/data', methods=['GET'])
def get_data():
    global latest_file

    if not latest_file:
        return jsonify({"error": "Upload file first"}), 400

    df = read_file(latest_file)
    return jsonify(df.fillna("").to_dict(orient='records'))


@app.route('/columns', methods=['GET'])
def get_columns():
    global latest_file

    df = read_file(latest_file)
    return jsonify(list(df.columns))


@app.route('/filter', methods=['GET'])
def filter_data():
    global latest_file

    if not latest_file:
        return jsonify({"error": "Upload file first"}), 400

    search = request.args.get('search', '')
    column = request.args.get('column', '')
    value = request.args.get('value', '')
    selected = request.args.get('selected', '')

    df = read_file(latest_file)

    # Global search
    if search:
        df = df[df.astype(str).apply(
            lambda row: row.str.lower().str.contains(search.lower()).any(), axis=1
        )]

    # Column filter
    if column and value:
        df = df[df[column].astype(str).str.lower().str.contains(value.lower(), na=False)]

    # Show selected column only
    if selected:
        df = df[[selected]]

    return jsonify(df.fillna("").to_dict(orient='records'))


if __name__ == '__main__':
    app.run(debug=True)