from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route("/api/data", methods=["POST"])
def process_data():
    data = request.json

    item_name = data.get("itemName")
    item_desc = data.get("itemDescription")
    item_id = data.get("itemId")
    item_uuid = data.get("itemUuid")
    item_hash = data.get("itemHash")

    print(f"Success! Backend received item: {item_name} ItemDescription:{item_desc} (ID: {item_id})")

    return jsonify(
        {
            "status": "success",
            "message": f"Flask successfully processed '{item_name}' ItemDescription:{item_desc} (ID: {item_id})",
        }
    )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
